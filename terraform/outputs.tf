output "ui_bucket_name" {
  value       = aws_s3_bucket.ui.bucket
  description = "S3 bucket name hosting the UI assets."
}

output "ui_website_endpoint" {
  value       = aws_s3_bucket_website_configuration.ui.website_endpoint
  description = "Website endpoint for the UI bucket."
}

output "ui_cloudfront_domain" {
  value       = aws_cloudfront_distribution.ui.domain_name
  description = "CloudFront domain name for the UI distribution."
}
