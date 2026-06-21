import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
DynamoDBDocumentClient,
PutCommand,
} from "@aws-sdk/lib-dynamodb";

import type { CityMetrics } from "../src/types/city";
import rawCities from "../src/data/seed-cities.json";

const client = new DynamoDBClient({
region: process.env.AWS_REGION,
credentials: {
accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
},
});

const db = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;

console.log("TABLE:", TABLE_NAME);
console.log("REGION:", process.env.AWS_REGION);
console.log("KEY:", !!process.env.AWS_ACCESS_KEY_ID);
console.log("SECRET:", !!process.env.AWS_SECRET_ACCESS_KEY);

function computePulseIntensity(city: (typeof rawCities)[0]): number {
const gdpNorm = Math.min(city.gdp_billion / 2000, 1);
const startupNorm = Math.min(city.startup_count / 10000, 1);
const tradeNorm = Math.min(city.trade_volume_b / 900, 1);
const riskPenalty = 1 - city.risk_score / 100;

return parseFloat(
(
gdpNorm * 0.35 +
startupNorm * 0.30 +
tradeNorm * 0.25 +
riskPenalty * 0.10
).toFixed(3)
);
}

function buildCityId(name: string): string {
return `city#${name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")}`;
}

async function seedCities() {
const timestamp = new Date().toISOString();

let seeded = 0;
let skipped = 0;

console.log("Cities:", rawCities.length);

for (const raw of rawCities) {
const cityId = buildCityId(raw.name);

const city = {
  "city-Id": cityId,
  timestamp,
  name: raw.name,
  country: raw.country,
  countryCode: raw.countryCode,
  lat: raw.lat,
  lng: raw.lng,
  gdp_billion: raw.gdp_billion,
  population_m: raw.population_m,
  startup_count: raw.startup_count,
  trade_volume_b: raw.trade_volume_b,
  risk_score: raw.risk_score,
  pulse_intensity: computePulseIntensity(raw),
};

try {
  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: city,
    })
  );

  console.log(`✓ ${city.name}`);
  seeded++;
} catch (err: any) {
  console.error(`✗ ${city.name}:`, err?.message || err);
  skipped++;
}

}

console.log(`\nDone. Seeded: ${seeded} | Failed: ${skipped}`);
}

seedCities().catch((err) => {
console.error("Seed failed:", err);
process.exit(1);
});
