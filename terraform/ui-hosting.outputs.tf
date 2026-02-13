output "ui_bucket_name" {
  value = aws_s3_bucket.ui.bucket
}

output "ui_cloudfront_domain_name" {
  value = aws_cloudfront_distribution.ui.domain_name
}

output "ui_cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.ui.id
}
