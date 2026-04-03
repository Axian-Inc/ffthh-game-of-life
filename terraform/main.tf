terraform {
  required_version = ">= 1.4.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  name_suffix = terraform.workspace
  name_prefix = "${var.app_name}-${data.aws_caller_identity.current.account_id}-${local.name_suffix}"
}

data "aws_caller_identity" "current" {}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_s3_bucket" "app" {
  bucket = "${local.name_prefix}-app"

  tags = {
    Application = var.app_name
    Workspace   = local.name_suffix
  }
}

resource "aws_s3_bucket_public_access_block" "app" {
  bucket = aws_s3_bucket.app.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "app" {
  bucket = aws_s3_bucket.app.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_cloudfront_origin_access_control" "app" {
  name                              = "${local.name_prefix}-oac"
  description                       = "OAC for ${var.app_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "app" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.app.bucket_regional_domain_name
    origin_id                = "${local.name_prefix}-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.app.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${local.name_prefix}-origin"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Application = var.app_name
    Workspace   = local.name_suffix
  }
}

resource "aws_s3_bucket_policy" "app" {
  bucket = aws_s3_bucket.app.id
  policy = data.aws_iam_policy_document.app.json
}

data "aws_iam_policy_document" "app" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.app.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.app.arn]
    }
  }
}

resource "aws_dynamodb_table" "games" {
  name         = "${local.name_prefix}-games"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Application = var.app_name
    Workspace   = local.name_suffix
  }
}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "games_api" {
  name               = "${local.name_prefix}-games-api-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

data "aws_iam_policy_document" "games_api_policy" {
  statement {
    actions = [
      "dynamodb:DeleteItem",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:Scan",
    ]
    resources = [aws_dynamodb_table.games.arn]
  }

  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_role_policy" "games_api" {
  name   = "${local.name_prefix}-games-api-policy"
  role   = aws_iam_role.games_api.id
  policy = data.aws_iam_policy_document.games_api_policy.json
}

data "archive_file" "games_api" {
  type        = "zip"
  source_dir  = "${path.module}/../src/api"
  output_path = "${path.module}/games-api.zip"
}

resource "aws_lambda_function" "games_api" {
  function_name = "${local.name_prefix}-games-api"
  role          = aws_iam_role.games_api.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  filename         = data.archive_file.games_api.output_path
  source_code_hash = data.archive_file.games_api.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.games.name
    }
  }

  tags = {
    Application = var.app_name
    Workspace   = local.name_suffix
  }
}

resource "aws_apigatewayv2_api" "games_api" {
  name          = "${local.name_prefix}-games-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["Content-Type"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins = ["*"]
  }

  tags = {
    Application = var.app_name
    Workspace   = local.name_suffix
  }
}

resource "aws_apigatewayv2_integration" "games_api" {
  api_id                 = aws_apigatewayv2_api.games_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.games_api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "games_list" {
  api_id    = aws_apigatewayv2_api.games_api.id
  route_key = "GET /games"
  target    = "integrations/${aws_apigatewayv2_integration.games_api.id}"
}

resource "aws_apigatewayv2_route" "games_create" {
  api_id    = aws_apigatewayv2_api.games_api.id
  route_key = "POST /games"
  target    = "integrations/${aws_apigatewayv2_integration.games_api.id}"
}

resource "aws_apigatewayv2_route" "games_get" {
  api_id    = aws_apigatewayv2_api.games_api.id
  route_key = "GET /games/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.games_api.id}"
}

resource "aws_apigatewayv2_route" "games_delete" {
  api_id    = aws_apigatewayv2_api.games_api.id
  route_key = "DELETE /games/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.games_api.id}"
}

resource "aws_apigatewayv2_route" "games_update" {
  api_id    = aws_apigatewayv2_api.games_api.id
  route_key = "PUT /games/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.games_api.id}"
}

resource "aws_apigatewayv2_route" "games_turn_advance" {
  api_id    = aws_apigatewayv2_api.games_api.id
  route_key = "POST /games/{id}/turns/advance"
  target    = "integrations/${aws_apigatewayv2_integration.games_api.id}"
}

resource "aws_apigatewayv2_stage" "games_api" {
  api_id      = aws_apigatewayv2_api.games_api.id
  name        = "$default"
  auto_deploy = true

  tags = {
    Application = var.app_name
    Workspace   = local.name_suffix
  }
}

resource "aws_lambda_permission" "games_api" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.games_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.games_api.execution_arn}/*/*"
}
