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

variable "bedrock_event_model_id" {
  type        = string
  description = "Bedrock inference profile used to generate player events."
  default     = "us.amazon.nova-2-lite-v1:0"
}
