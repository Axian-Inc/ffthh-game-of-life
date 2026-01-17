output "s3_bucket_name" {
  value       = aws_s3_bucket.site.bucket
  description = "S3 bucket hosting the site assets."
}

output "s3_website_endpoint" {
  value       = aws_s3_bucket_website_configuration.site.website_endpoint
  description = "Public S3 website endpoint."
}
