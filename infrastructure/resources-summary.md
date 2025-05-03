# Dollar Game S3 Website Resources

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
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
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

## Deployment Steps

To deploy the application to this S3 bucket:

1. Build the React application:
```bash
cd dollar-game
npm run build
```

2. Upload the built files to S3:
```bash
aws s3 sync dist/ s3://dollar-game-firemandecko/ --profile dollar-game
```

## Maintenance and Updates

To update the application:
1. Make changes to the code
2. Rebuild the application
3. Sync the new build to the S3 bucket

```bash
cd dollar-game
npm run build
aws s3 sync dist/ s3://dollar-game-firemandecko/ --profile dollar-game