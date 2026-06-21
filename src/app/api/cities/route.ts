import { NextResponse } from "next/server";
import { getAllCityDots } from "@/lib/queries";

// Cache the response at the edge for 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const cities = await getAllCityDots();

    return NextResponse.json(
      {
        success: true,
        count: cities.length,
        cities,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[/api/cities] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}