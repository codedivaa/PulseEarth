# Deployment Guide

This guide covers the complete production deployment of PulseEarth: GitHub repository setup, AWS DynamoDB provisioning, Vercel deployment, and post-deployment verification.

---

## Prerequisites

- GitHub account
- AWS account (free tier is sufficient for DynamoDB at this scale)
- Vercel account (free tier works for PulseEarth)
- Anthropic API key

---

## Step 1: GitHub Repository Setup

```bash
# Initialize git if not already done
git init
git add .
git commit -m "feat: initial PulseEarth release"

# Create repo on GitHub (via UI or GitHub CLI)
gh repo create pulseearth --public
git remote add origin https://github.com/your-username/pulseearth.git
git push -u origin main
```

**Important:** Verify `.gitignore` is correct before pushing. The following must never be committed:
- `.env.local` (your actual secrets)
- `node_modules/`
- `.next/`

---

## Step 2: AWS DynamoDB Setup

### 2a. Create IAM User

1. Go to AWS Console → IAM → Users → Create User
2. Name: `pulseearth-dynamodb`
3. Attach policy: **AmazonDynamoDBFullAccess** (or create a custom policy with minimum permissions)
4. Create access key → save `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

**Minimum IAM policy (recommended for production):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/city-metrics"
    }
  ]
}
```

### 2b. Create DynamoDB Table

1. AWS Console → DynamoDB → Create Table
2. Table name: `city-metrics` (or your preferred name — update `DYNAMODB_TABLE_NAME` env var)
3. Partition key: `cityId` (String)
4. Table settings: Default (On-demand capacity is fine for this scale)
5. Click **Create table**

### 2c. Seed City Data

```bash
# Set env vars locally first
cp .env.example .env.local
# Edit .env.local with your AWS credentials and table name

# Run the seeder
npm run seed
# → Seeds 29 cities into DynamoDB
# → Should print: "Seeded: New York, London, Tokyo, ..."
```

**Verify in AWS Console:** DynamoDB → Tables → city-metrics → Explore items. You should see 29 items.

---

## Step 3: Vercel Deployment

### 3a. Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import your `pulseearth` GitHub repository
3. Framework: Next.js (auto-detected)
4. Root directory: `./` (project root)
5. Build command: `npm run build` (default)
6. Output directory: `.next` (default)

### 3b. Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

| Key | Value | Environment |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Production, Preview |
| `AWS_REGION` | `us-east-1` | Production, Preview |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | Production, Preview |
| `AWS_SECRET_ACCESS_KEY` | `...` | Production, Preview |
| `DYNAMODB_TABLE_NAME` | `city-metrics` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production |
| `GEMINI_API_KEY` | (if using) | Production, Preview |
| `HUGGING_FACE_TOKEN` | (if using) | Production, Preview |

**Note:** `NEXT_PUBLIC_*` variables are exposed to the browser. Only set public metadata here, never secrets.

### 3c. Deploy

Click **Deploy**. Vercel will:
1. Install dependencies (`npm install`)
2. Build the Next.js app (`npm run build`)
3. Deploy to their edge network

First deployment typically takes 2–4 minutes. Subsequent deploys (on push to main) take 60–90 seconds.

---

## Step 4: Custom Domain (Optional)

1. Vercel Dashboard → Project → Domains → Add Domain
2. Enter your domain (e.g., `pulseearth.io`)
3. Add the DNS records shown (CNAME or A record) in your domain registrar
4. Update `NEXT_PUBLIC_APP_URL` env var to the custom domain

---

## Step 5: Production Checklist

Run through this checklist before announcing the launch:

### Globe & Visualization
- [ ] Globe loads and rotates automatically
- [ ] Countries can be clicked and highlighted
- [ ] City dots appear (DynamoDB seeded correctly)
- [ ] Pulse rings animate on city dots
- [ ] Fly-to animation works (click a country)

### Intelligence Layers
- [ ] Economic Heatmap colors countries correctly
- [ ] Trade Routes appear (golden arcs)
- [ ] City Network appears (cyan arcs)
- [ ] Investment Signal colors countries green/yellow/red
- [ ] Historical Timeline slider moves 2015–2025

### Country Panel
- [ ] World Bank data loads for major countries (US, DE, IN, SG)
- [ ] "Verified · World Bank YYYY" badge shows correct year
- [ ] Population, GDP, Growth, Inflation, Unemployment display correctly
- [ ] Risk Score and Innovation Index compute and display
- [ ] Data vintage year appears on stat cards

### AI Features
- [ ] Brief Me generates a real briefing (not placeholder text)
- [ ] AI Anchor loads and shows briefing text
- [ ] AI Insight Stream produces streaming text
- [ ] Investment Report generates STRONG BUY/BUY/HOLD/UNDERWEIGHT/AVOID
- [ ] Investment Report PDF opens a printable window

### Other Features
- [ ] Search finds countries, capitals, and cities
- [ ] Compare mode shows side-by-side metrics
- [ ] Demo Mode cycles through 6 countries
- [ ] News panel loads articles for US, IN, AE (test different country types)
- [ ] DataUnavailable shows for a territory (e.g., try "AQ" for Antarctica)
- [ ] City panel loads for Singapore, Dubai, Mumbai

### Performance
- [ ] Initial load time < 5 seconds on 4G
- [ ] Globe renders without visible jitter
- [ ] Country data loads within 2–3 seconds after click

---

## Environment-Specific Notes

### Development
```bash
npm run dev
# Uses .env.local
# Hot reload enabled
# TypeScript errors surface in terminal
```

### Vercel Preview (PR deployments)
Each pull request gets a unique preview URL. Preview environments use the same env vars as Production (set in Vercel dashboard).

### Production
- All Next.js API routes run as Vercel serverless functions
- Static assets (JS bundles, CSS) served from Vercel's CDN
- Globe textures served from jsDelivr CDN (no hosting cost)
- GeoJSON served from CloudFront CDN (no hosting cost)

---

## Updating City Data

If you add cities to `seed-cities.json` and want to update DynamoDB in production:

```bash
# Option 1: Re-run seed locally (overwrites existing items with PutItem)
AWS_REGION=us-east-1 \
AWS_ACCESS_KEY_ID=AKIA... \
AWS_SECRET_ACCESS_KEY=... \
DYNAMODB_TABLE_NAME=city-metrics \
npm run seed

# Option 2: Use AWS Console → DynamoDB → Explore items → Create item
```

---

## Monitoring & Logs

**Vercel Functions logs:**
- Dashboard → Project → Deployments → Select deployment → Functions
- Real-time logs for each API route invocation
- Error traces with stack frames

**What to watch for:**
- `[country route] fatal error` — World Bank API timeout or parse failure
- `[heatmap route]` errors — WB bulk fetch failure (globe goes grey)
- `[anchor route]` errors — AI briefing failures
- DynamoDB `ResourceNotFoundException` — table name mismatch or wrong region

---

## Rollback

If a deployment causes issues:

```bash
# Via Vercel CLI
vercel rollback

# Or in Vercel Dashboard:
# Deployments → select a previous deployment → Promote to Production
```
