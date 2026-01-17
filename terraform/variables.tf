variable "aws_region" {
  type        = string
  description = "AWS region to deploy to."
  default     = "us-west-2"
}

variable "site_dist_dir" {
  type        = string
  description = "Path to the built UI assets."
  default     = "../src/ui/dist"
}

variable "site_name_prefix" {
  type        = string
  description = "Prefix for resource names."
  default     = "ffthh-game-of-life"
}
