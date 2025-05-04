# Dollar Game Infrastructure Resources

## S3 Bucket
- **Name**: dollar-game-firemandecko
- **Region**: us-east-1 (default region)
- **ARN**: arn:aws:s3:::dollar-game-firemandecko
- **Website URL**: http://dollar-game-firemandecko.s3-website-us-east-1.amazonaws.com

## Website Configuration
```json
{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "index.html"
    }
}
```

## Bucket Policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CloudFrontReadGetObject",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity [OAI_ID]"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::dollar-game-firemandecko/*"
        }
    ]
}
```

## Public Access Block Configuration
```json
{
    "BlockPublicAcls": false,
    "IgnorePublicAcls": false,
    "BlockPublicPolicy": false,
    "RestrictPublicBuckets": false
}
```

## CloudFront Distribution
- **Domain**: dollar-game.firemandecko.com
- **Aliases**: dollar-game.firemandecko.com, www.dollar-game.firemandecko.com
- **Origin**: S3 bucket (dollar-game-firemandecko)
- **Origin Access Identity**: Used to secure S3 bucket access
- **Default Root Object**: index.html
- **Price Class**: PriceClass_100 (North America and Europe edge locations)
- **SSL Certificate**: ACM Certificate for dollar-game.firemandecko.com
- **Custom Error Response**: 404 errors return index.html with 200 status code (for SPA routing)

## Route 53 and DNS
- **Hosted Zone**: firemandecko.com
- **DNS Records**:
  - dollar-game.firemandecko.com -> CloudFront distribution
  - www.dollar-game.firemandecko.com -> CloudFront distribution

## SSL/TLS Certificate
- **Domain**: dollar-game.firemandecko.com
- **Alternative Names**: www.dollar-game.firemandecko.com
- **Validation Method**: DNS
- **Region**: us-east-1 (required for CloudFront)

## Estimated Costs

| Service | Estimated Monthly Cost |
|---------|------------------------|
| S3 Standard Storage | ~$0.023 per GB (likely < $0.01 for small app) |
| S3 GET Requests | $0.0004 per 1,000 requests |
| S3 PUT Requests | $0.005 per 1,000 requests (only during deployment) |
| CloudFront Data Transfer | $0.085 per GB (first 10TB) |
| CloudFront Requests | $0.01 per 10,000 HTTPS requests |
| Route 53 Hosted Zone | $0.50 per hosted zone |
| ACM Certificate | Free |

**Total Estimated Monthly Cost**: $1-5 for low traffic sites

## Deployment Process

The application is deployed automatically using GitHub Actions workflows:

1. **Infrastructure Deployment** (.github/workflows/deploy-infrastructure.yml):
   - Triggered when files in the infrastructure/ directory change
   - Uses OpenTofu to apply infrastructure changes
   - Waits for certificate validation and DNS propagation

2. **Application Deployment** (.github/workflows/deploy-app.yml):
   - Triggered when application files change
   - Builds the application using pnpm
   - Deploys the built files to S3
   - Invalidates the CloudFront cache to ensure the latest content is served
   - Verifies the deployment

## CloudFront Cache Invalidation

When new content is deployed to S3, the CloudFront cache is invalidated to ensure the latest content is served to users. This is done automatically as part of the GitHub Actions workflow.

To manually invalidate the CloudFront cache:

```bash
# Get the CloudFront distribution ID
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, 'dollar-game.firemandecko.com')]].Id" --output text --profile dollar-game)

# Create invalidation for all files
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --profile dollar-game
```

## Troubleshooting

If you encounter 403 Forbidden errors from CloudFront:

1. Check that the S3 bucket policy allows access from the CloudFront Origin Access Identity
2. Verify that the CloudFront distribution is properly configured to use the OAI
3. Ensure that the CloudFront cache has been invalidated after deploying new content
4. Check the CloudFront distribution status in the AWS Console