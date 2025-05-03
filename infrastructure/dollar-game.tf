# AWS Provider Configuration
provider "aws" {
  profile = "dollar-game"
  region  = "us-east-1"  # Change to your preferred region
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

# S3 Bucket Policy for Public Read Access
resource "aws_s3_bucket_policy" "website_bucket_policy" {
  bucket = aws_s3_bucket.website_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website_bucket.arn}/*"
      }
    ]
  })

  # Ensure the public access block is configured before applying the policy
  depends_on = [aws_s3_bucket_public_access_block.website_public_access]
}

# Output the website URL
output "website_url" {
  value = "http://${aws_s3_bucket.website_bucket.bucket}.s3-website-${data.aws_region.current.name}.amazonaws.com"
}

# Current region data source
data "aws_region" "current" {}