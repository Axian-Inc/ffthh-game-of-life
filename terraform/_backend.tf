terraform {
  required_version = "~> 1.10"

  backend "s3" {
    bucket         = "ffthh-game-of-life-tf-state"
    key            = "envs/terraform.tfstate"
    region         = "us-west-2"
    use_lockfile   = true
    encrypt        = true
  }
}
