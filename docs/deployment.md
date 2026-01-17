# Deployment

## Overview
The Game Hub UI deploys as a static site on AWS S3 with static website hosting enabled.
CloudFront is a planned future enhancement; when it is added, cache invalidation will
be required after each deployment.

## Prerequisites
- Node.js 18+
- AWS CLI configured (`aws configure`)
- An S3 bucket configured for static hosting
- Optional (future): a CloudFront distribution pointing to the bucket

## Environment Variables
Set these before running the deployment script:

- `S3_BUCKET`: S3 bucket name for the site
- Optional (future): `CLOUDFRONT_DISTRIBUTION_ID` for cache invalidation

## Deploy Script
Run from the repository root:

```bash
S3_BUCKET=your-bucket-name ./scripts/deploy.sh
```

## Manual Commands
If you prefer to run commands directly:

```bash
cd src/ui
npm install
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
# Optional (future): run after CloudFront is added
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Rollback
Re-run the deployment script with a previous build artifact if you retain versions or enable S3 versioning.

## Future CloudFront
When CloudFront is introduced, add the distribution ID to enable invalidation after each deploy.
