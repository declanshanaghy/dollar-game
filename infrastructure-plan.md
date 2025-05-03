# Dollar Game S3 Deployment with OpenTofu

This document outlines the plan for deploying the Dollar Game application to AWS S3 using OpenTofu (an open-source alternative to Terraform) for infrastructure as code.

## Prerequisites

- AWS CLI configured with the `dollar-game` profile
- OpenTofu installed

## OpenTofu Installation Instructions

### For macOS (using Homebrew):
```bash
brew install opentofu
```

### For Linux:
```bash
curl --proto '=https' --tlsv1.2 -fsSL https://get.opentofu.org/install-opentofu.sh | bash
```

### For Windows (using Chocolatey):
```bash
choco install opentofu
```

Verify installation:
```bash
tofu version
```

## Infrastructure Setup

Create a directory structure:
```bash
mkdir -p dollar-game/infrastructure
```

## OpenTofu Configuration

Create a file named `dollar-game.tf` in the infrastructure directory with the following content:

```hcl
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
```

## Deployment Process

1. Initialize OpenTofu:
```bash
cd dollar-game/infrastructure
tofu init
```

2. Plan the deployment:
```bash
tofu plan
```

3. Apply the infrastructure:
```bash
tofu apply
```

4. Build the React application:
```bash
cd dollar-game
npm run build
```

5. Upload the built files to S3:
```bash
aws s3 sync dist/ s3://dollar-game-firemandecko/ --profile dollar-game
```

## Cost Optimization

This setup is optimized for the lowest possible cost:
- Uses S3 Standard storage class
- No CloudFront distribution
- No Route 53 or custom domain
- Minimal bucket policies

## Estimated Costs

| Service | Estimated Monthly Cost |
|---------|------------------------|
| S3 Standard Storage | ~$0.023 per GB (likely < $0.01 for small app) |
| S3 GET Requests | $0.0004 per 1,000 requests |
| S3 PUT Requests | $0.005 per 1,000 requests (only during deployment) |
| Data Transfer Out | $0.09 per GB (first 10TB) |

**Total Estimated Monthly Cost**: Less than $1 for low traffic sites

## Limitations

1. HTTP only (no HTTPS without CloudFront)
2. No CDN for global distribution
3. No custom domain name
4. Limited to S3 website features

## Maintenance and Updates

To update the application:
1. Make changes to the code
2. Rebuild the application
3. Sync the new build to the S3 bucket

```bash
cd dollar-game
npm run build
aws s3 sync dist/ s3://dollar-game-firemandecko/ --profile dollar-game