output "app_bucket_name" {
  value       = aws_s3_bucket.app.bucket
  description = "S3 bucket name for the app assets."
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.app.id
  description = "CloudFront distribution ID."
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.app.domain_name
  description = "CloudFront domain name for the app."
}
