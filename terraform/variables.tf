variable "aws_region" {
  type        = string
  description = "AWS region for resources."
  default     = "us-west-2"
}

variable "app_name" {
  type        = string
  description = "Application name prefix for resources."
  default     = "ffthh-game-of-life"
}
