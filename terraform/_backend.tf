terraform {
  backend "s3" {
    bucket         = "ffthh-game-of-life-tf-state"
    key            = "envs/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "ffthh-game-of-life-tf-lock"
    encrypt        = true
  }
}