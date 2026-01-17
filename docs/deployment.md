# Deployment

## Overview
The Game Hub UI deploys as a static site on AWS S3 with CloudFront in front of it.

## Prerequisites
- Node.js 18+
- AWS CLI configured (`aws configure`)
- An S3 bucket configured for static hosting
- A CloudFront distribution pointing to the bucket

## Environment Variables
Set these before running the deployment script:

- `S3_BUCKET`: S3 bucket name for the site
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID

## Deploy Script
Run from the repository root:

```bash
S3_BUCKET=your-bucket-name \
CLOUDFRONT_DISTRIBUTION_ID=YOUR_DISTRIBUTION_ID \
./scripts/deploy.sh
```

## Manual Commands
If you prefer to run commands directly:

```bash
cd src/ui
npm install
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Rollback
Re-run the deployment script with a previous build artifact if you retain versions or enable S3 versioning.
