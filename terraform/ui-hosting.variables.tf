variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "bucket_name_override" {
  type    = string
  default = null
}
