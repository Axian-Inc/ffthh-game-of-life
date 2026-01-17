terraform {
  required_version = ">= 1.4.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "aws_region" {
  type        = string
  description = "AWS region for the UI bucket."
  default     = "us-west-2"
}

provider "aws" {
  region = var.aws_region
}

locals {
  name_suffix = lower(terraform.workspace)
  bucket_name = "ffthh-game-of-life-ui-${local.name_suffix}"
  tags = {
    Project   = "ffthh-game-of-life"
    Workspace = terraform.workspace
  }
}

resource "aws_s3_bucket" "ui" {
  bucket = local.bucket_name
  tags   = local.tags
}

resource "aws_s3_bucket_public_access_block" "ui" {
  bucket = aws_s3_bucket.ui.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "ui" {
  bucket = aws_s3_bucket.ui.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

data "aws_iam_policy_document" "ui_public_read" {
  statement {
    sid       = "PublicReadGetObject"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.ui.arn}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "ui_public_read" {
  bucket = aws_s3_bucket.ui.id
  policy = data.aws_iam_policy_document.ui_public_read.json

  depends_on = [aws_s3_bucket_public_access_block.ui]
}

resource "aws_cloudfront_distribution" "ui" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "FFTHH Game of Life UI (${terraform.workspace})"
  default_root_object = "index.html"

  origin {
    origin_id   = "ui-s3-website"
    domain_name = aws_s3_bucket_website_configuration.ui.website_endpoint

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "ui-s3-website"

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = local.tags

  depends_on = [aws_s3_bucket_website_configuration.ui]
}
