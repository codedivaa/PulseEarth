import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

function createClient() {
  return DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    }),
    { marshallOptions: { removeUndefinedValues: true } }
  )
}

let _db: DynamoDBDocumentClient | null = null

export function getDb() {
  if (!_db) _db = createClient()
  return _db
}

export const TABLE_NAME = () => process.env.DYNAMODB_TABLE_NAME ?? 'city-metrics'