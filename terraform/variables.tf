variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"
}

variable "bucket_base_name" {
  description = "Base name for the S3 bucket"
  type        = string
  default     = "game-hub-ui"
}

variable "tags" {
  description = "Additional tags to apply"
  type        = map(string)
  default     = {}
}
