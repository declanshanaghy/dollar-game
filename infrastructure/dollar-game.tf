# Terraform/OpenTofu Backend Configuration
terraform {
  backend "s3" {
    bucket         = "dollar-game-terraform-state"
    key            = "dollar-game/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "dollar-game-terraform-locks"
    encrypt        = true
    profile        = "dollar-game"
  }
}

# AWS Provider Configuration
provider "aws" {
  profile = "dollar-game"
  region  = "us-east-1"  # Change to your preferred region
}

# AWS Provider for us-east-1 region (required for CloudFront certificates)
provider "aws" {
  alias   = "us_east_1"
  profile = "dollar-game"
  region  = "us-east-1"
}

# S3 Bucket for Website Hosting
resource "aws_s3_bucket" "website_bucket" {
  bucket = "dollar-game-firemandecko"
}

# S3 Bucket Website Configuration
resource "aws_s3_bucket_website_configuration" "website_config" {
  bucket = aws_s3_bucket.website_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# S3 Bucket Public Access Block Configuration
resource "aws_s3_bucket_public_access_block" "website_public_access" {
  bucket = aws_s3_bucket.website_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 Bucket Policy for CloudFront Access
resource "aws_s3_bucket_policy" "website_bucket_policy" {
  bucket = aws_s3_bucket.website_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "CloudFrontReadGetObject"
        Effect    = "Allow"
        Principal = {
          AWS = "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${aws_cloudfront_origin_access_identity.oai.id}"
        }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website_bucket.arn}/*"
      }
    ]
  })

  # Ensure the public access block is configured before applying the policy
  depends_on = [aws_s3_bucket_public_access_block.website_public_access]
}

# Output the S3 website URL
output "s3_website_url" {
  value = "http://${aws_s3_bucket.website_bucket.bucket}.s3-website-${data.aws_region.current.name}.amazonaws.com"
  description = "S3 website URL"
}

# Current region data source
data "aws_region" "current" {}