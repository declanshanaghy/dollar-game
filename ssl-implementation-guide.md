# SSL Implementation Guide for Dollar Game

This guide provides step-by-step instructions for implementing SSL for the Dollar Game application. Follow these steps to add HTTPS support using AWS Certificate Manager (ACM) and CloudFront.

## Step 1: Create the ssl.tf File

Create a new file `infrastructure/ssl.tf` with the following content:

```hcl
# ACM Certificate for dollar-game.firemandecko.com
resource "aws_acm_certificate" "cert" {
  domain_name               = "dollar-game.firemandecko.com"
  subject_alternative_names = []
  validation_method         = "DNS"
  
  # ACM certificates for CloudFront must be in us-east-1 region
  provider = aws.us_east_1
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name        = "dollar-game-certificate"
    Environment = "production"
  }
}

# CloudFront Origin Access Identity to secure S3 bucket
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for dollar-game.firemandecko.com"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "website_distribution" {
  origin {
    domain_name = aws_s3_bucket.website_bucket.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.website_bucket.bucket}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = ["dollar-game.firemandecko.com"]
  price_class         = "PriceClass_100" # Use only North America and Europe edge locations
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${aws_s3_bucket.website_bucket.bucket}"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }
  
  # Handle SPA routing - return index.html for 404s
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  
  tags = {
    Name        = "dollar-game-distribution"
    Environment = "production"
  }
}

# Output the CloudFront distribution domain name
output "cloudfront_url" {
  value       = "https://${aws_cloudfront_distribution.website_distribution.domain_name}"
  description = "CloudFront distribution domain name"
}

output "custom_domain" {
  value       = "https://dollar-game.firemandecko.com"
  description = "Custom domain with HTTPS"
}

output "certificate_validation_records" {
  value = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      value  = dvo.resource_record_value
    }
  }
  description = "DNS records needed for certificate validation"
}
```

## Step 2: Update dollar-game.tf

Modify the `infrastructure/dollar-game.tf` file to:

1. Add the us-east-1 provider (required for CloudFront certificates)
2. Update the S3 bucket policy to only allow access from CloudFront

Add this to the provider section:

```hcl
provider "aws" {
  alias   = "us_east_1"
  profile = "dollar-game"
  region  = "us-east-1"
}
```

Replace the existing S3 bucket policy with:

```hcl
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
```

## Step 3: Update GitHub Actions Workflow

Update the `.github/workflows/deploy-infrastructure.yml` file to add a step for waiting for certificate validation.

Add this after the "Apply OpenTofu" step:

```yaml
- name: Wait for certificate validation
  working-directory: ./infrastructure
  run: |
    echo "Waiting for ACM certificate validation..."
    # Get the certificate ARN
    CERT_ARN=$(tofu output -raw acm_certificate_arn || echo "")
    
    if [ -n "$CERT_ARN" ]; then
      # Wait for certificate validation (timeout after 30 minutes)
      TIMEOUT=${{ env.CERTIFICATE_VALIDATION_TIMEOUT }}
      START_TIME=$(date +%s)
      
      while true; do
        # Check certificate status
        STATUS=$(aws acm describe-certificate --certificate-arn "$CERT_ARN" --query 'Certificate.Status' --output text)
        
        if [ "$STATUS" = "ISSUED" ]; then
          echo "Certificate validated successfully!"
          break
        fi
        
        # Check timeout
        CURRENT_TIME=$(date +%s)
        ELAPSED_TIME=$((CURRENT_TIME - START_TIME))
        if [ $ELAPSED_TIME -gt $TIMEOUT ]; then
          echo "Certificate validation timed out after $TIMEOUT seconds"
          echo "Please check the ACM console and validate the certificate manually"
          break
        fi
        
        echo "Certificate status: $STATUS. Waiting..."
        sleep 60
      done
    else
      echo "Certificate ARN not found. Skipping validation wait."
    fi
```

Also update the "Deployment Status" step:

```yaml
- name: Deployment Status
  working-directory: ./infrastructure
  run: |
    echo "Infrastructure deployment completed"
    echo "S3 Website URL: $(tofu output -raw s3_website_url)"
    echo "CloudFront URL: $(tofu output -raw cloudfront_url || echo 'Not available yet')"
    echo "Custom Domain: $(tofu output -raw custom_domain || echo 'Not available yet')"
    
    # Output certificate validation records if available
    if tofu output -raw certificate_validation_records &>/dev/null; then
      echo "Certificate Validation Records:"
      tofu output -json certificate_validation_records | jq -r 'to_entries[] | "\(.key):\n  Name: \(.value.name)\n  Type: \(.value.type)\n  Value: \(.value.value)"'
    fi
```

## Step 4: Implementation Process

1. **Create the Terraform files**:
   - Create `infrastructure/ssl.tf`
   - Update `infrastructure/dollar-game.tf`
   - Update `.github/workflows/deploy-infrastructure.yml`

2. **Apply the Terraform changes to request the ACM certificate**:
   ```bash
   cd infrastructure
   tofu init
   tofu plan
   tofu apply
   ```

3. **Create DNS validation records**:
   - After applying the Terraform changes, you'll get output with the DNS validation records
   - Add these CNAME records to your DNS provider
   - Example:
     ```
     Name: _a79865eb4cd1a6ab43e0e.dollar-game.firemandecko.com
     Type: CNAME
     Value: _424242424242424242.acm-validations.aws
     ```

4. **Wait for certificate validation**:
   - This can take anywhere from a few minutes to several hours
   - You can check the status in the AWS ACM console or using the AWS CLI:
     ```bash
     aws acm describe-certificate --certificate-arn <certificate-arn> --query 'Certificate.Status' --output text
     ```

5. **Apply the remaining Terraform changes to create the CloudFront distribution**:
   ```bash
   tofu apply
   ```

6. **Update DNS records to point to CloudFront**:
   - After the CloudFront distribution is created, you'll get the distribution domain name
   - Add these records to your DNS provider:
     - For the apex domain (dollar-game.firemandecko.com):
       - Type: ALIAS/ANAME (if your provider supports it) or CNAME
       - Name: @ or empty (depends on provider)
       - Value: CloudFront distribution domain (e.g., d1234abcd.cloudfront.net)
     - For the www subdomain:
       - Type: CNAME
       - Name: www
       - Value: CloudFront distribution domain (e.g., d1234abcd.cloudfront.net)

7. **Verify HTTPS functionality**:
   - Wait for DNS propagation (can take up to 48 hours, but often much faster)
   - Visit https://dollar-game.firemandecko.com and verify it loads correctly
   - Check that the SSL certificate is valid

8. **Update application and documentation**:
   - Update any hardcoded URLs in the application to use the new domain
   - Update README.md with the new domain information

## DNS Configuration Notes for External DNS Providers

Since you're using an external DNS provider (not AWS Route 53), here are some specific considerations:

1. **Certificate Validation Records**:
   - These are temporary records needed only for certificate validation
   - They must be created exactly as provided by ACM
   - They can be removed after the certificate is validated, but it's safer to keep them for certificate renewals

2. **Apex Domain Configuration**:
   - Many DNS providers don't support CNAME records at the apex domain
   - Options:
     - Use ALIAS/ANAME records if your provider supports them
     - Use a service like Cloudflare that offers CNAME flattening
     - As a last resort, use A records pointing to CloudFront's IP addresses (not recommended as these can change)

3. **TTL Settings**:
   - Use short TTL values (e.g., 300 seconds) during the transition
   - You can increase TTL values after everything is working correctly

4. **Common External DNS Provider Instructions**:

   **Cloudflare**:
   - Supports CNAME flattening for apex domains
   - Set "Proxy status" to "DNS only" (gray cloud) for ACM validation records
   - Can use "Proxied" (orange cloud) for the final domain records

   **GoDaddy**:
   - Doesn't support ALIAS/ANAME records for apex domains
   - For apex domains, you might need to use a redirect service

   **Namecheap**:
   - Offers "ALIAS" record type for apex domains on some plans
   - Otherwise, use their URL redirect service

   **Google Domains**:
   - Supports "Synthetic records" which work like ALIAS records for apex domains

Remember to check your specific DNS provider's documentation for the most accurate instructions.