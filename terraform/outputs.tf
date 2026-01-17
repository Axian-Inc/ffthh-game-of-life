output "ui_bucket_name" {
  description = "S3 bucket hosting the Game Hub UI assets."
  value       = aws_s3_bucket.ui.bucket
}

output "ui_cloudfront_domain" {
  description = "CloudFront distribution domain name for the UI."
  value       = aws_cloudfront_distribution.ui.domain_name
}
