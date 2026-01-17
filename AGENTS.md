# Repository Guidelines

## Build, Test, and Development Commands
- **Terraform workspace rules:** never run `terraform apply` in the implicit `default` workspace. Create/select an explicit workspace (e.g., `terraform workspace new chadr`, `terraform workspace select chadr`) before planning. Include the active workspace name in every resource identifier via `locals` (e.g., `local.name_suffix = terraform.workspace`) so resources remain unique per workspace.
