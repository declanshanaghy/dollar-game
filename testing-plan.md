# DNS Migration Testing Plan: Namecheap to AWS Route53

## Overview

This document outlines a comprehensive testing strategy for the DNS migration from Namecheap to AWS Route53 and SSL setup for the Dollar Game application. The testing plan covers pre-migration baseline testing, testing during the migration process, post-migration verification, and rollback procedures in case of issues.

## 0. Prerequisites and Setup

Before beginning the migration process, ensure that the AWS user has the necessary permissions to work with Route53 and ACM.

### 0.1 Required AWS Permissions

The AWS user (dollar-game) needs the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "route53:CreateHostedZone",
        "route53:GetHostedZone",
        "route53:ListHostedZones",
        "route53:ChangeResourceRecordSets",
        "route53:ListResourceRecordSets",
        "route53:GetChange",
        "acm:RequestCertificate",
        "acm:DescribeCertificate",
        "acm:ListCertificates",
        "acm:AddTagsToCertificate"
      ],
      "Resource": "*"
    }
  ]
}
```

### 0.2 Adding Permissions to the AWS User

1. Log in to the AWS Management Console
2. Navigate to IAM > Users > dollar-game
3. Click "Add permissions"
4. Choose "Attach policies directly"
5. Create a new policy with the JSON above or attach the existing "AmazonRoute53FullAccess" policy
6. Click "Next" and then "Add permissions"

### 0.3 Verify Permissions

```bash
# Verify that the user has the necessary permissions
aws route53 list-hosted-zones --profile dollar-game
```

## 1. Pre-Migration Testing

### 1.1 Baseline DNS Configuration Testing

**Objective**: Document the current DNS configuration and establish baseline functionality.

**Tools Required**:
- `dig` or `nslookup` command-line tools
- Online DNS lookup tools (e.g., MxToolbox, DNSChecker)
- Web browser

**Procedures**:

1. **Record current DNS configuration**:
   ```bash
   # Check current nameservers
   dig NS firemandecko.com
   
   # Check A records
   dig A firemandecko.com
   dig A www.firemandecko.com
   dig A dollar-game.firemandecko.com
   
   # Check CNAME records
   dig CNAME www.firemandecko.com
   dig CNAME www.dollar-game.firemandecko.com
   
   # Check MX records
   dig MX firemandecko.com
   
   # Check TXT records (including SPF)
   dig TXT firemandecko.com
   ```

2. **Document DNS resolution times**:
   ```bash
   # Measure DNS resolution time
   dig firemandecko.com +stats
   dig dollar-game.firemandecko.com +stats
   ```

3. **Verify current DNS propagation**:
   - Use online tools like [dnschecker.org](https://dnschecker.org/) to check DNS propagation across different global locations

### 1.2 Website Accessibility Testing

**Objective**: Verify current website functionality and accessibility.

**Tools Required**:
- Web browser
- `curl` command-line tool
- HTTP status code checker

**Procedures**:

1. **Check website availability**:
   ```bash
   # Check HTTP status codes
   curl -I http://firemandecko.com
   curl -I http://www.firemandecko.com
   curl -I http://dollar-game.firemandecko.com
   curl -I http://www.dollar-game.firemandecko.com
   
   # Check HTTPS status codes (if already configured)
   curl -I https://firemandecko.com
   curl -I https://www.firemandecko.com
   curl -I https://dollar-game.firemandecko.com
   curl -I https://www.dollar-game.firemandecko.com
   ```

2. **Verify website functionality**:
   - Manually navigate through the website and document key functionality
   - Test all critical user flows in the Dollar Game application

### 1.3 SSL Certificate Testing

**Objective**: Document current SSL configuration and certificate details.

**Tools Required**:
- OpenSSL
- SSL checker tools

**Procedures**:

1. **Check current SSL certificate details**:
   ```bash
   # Check SSL certificate details
   openssl s_client -showcerts -connect firemandecko.com:443 </dev/null | openssl x509 -noout -text
   openssl s_client -showcerts -connect dollar-game.firemandecko.com:443 </dev/null | openssl x509 -noout -text
   ```

2. **Verify SSL certificate validity**:
   - Use online tools like [SSL Labs](https://www.ssllabs.com/ssltest/) to check SSL configuration
   - Command: `curl -s https://api.ssllabs.com/api/v3/analyze?host=firemandecko.com`

## 2. Testing During Migration

### 2.1 DNS Propagation Monitoring

**Objective**: Monitor DNS propagation during the migration process.

**Tools Required**:
- `dig` or `nslookup` command-line tools
- Online DNS propagation checkers

**Procedures**:

1. **Monitor nameserver changes**:
   ```bash
   # Check nameserver propagation (run periodically)
   dig NS firemandecko.com
   ```

2. **Monitor DNS record propagation**:
   ```bash
   # Check A record propagation (run periodically)
   dig A firemandecko.com
   dig A dollar-game.firemandecko.com
   
   # Check CNAME record propagation (run periodically)
   dig CNAME www.firemandecko.com
   dig CNAME www.dollar-game.firemandecko.com
   ```

3. **Use online tools to check global propagation**:
   - Use [dnschecker.org](https://dnschecker.org/) to check DNS propagation across different global locations

### 2.2 Incremental Functionality Testing

**Objective**: Verify website functionality as DNS changes propagate.

**Tools Required**:
- Web browser
- `curl` command-line tool

**Procedures**:

1. **Test website accessibility during propagation**:
   ```bash
   # Check HTTP status codes (run periodically)
   curl -I http://firemandecko.com
   curl -I http://dollar-game.firemandecko.com
   ```

2. **Test website functionality during propagation**:
   - Periodically navigate through the website and test key functionality
   - Document any issues or errors

## 3. Post-Migration Verification

### 3.1 Complete DNS Verification

**Objective**: Verify that all DNS records have been properly migrated and are resolving correctly.

**Tools Required**:
- `dig` or `nslookup` command-line tools
- Online DNS lookup tools

**Procedures**:

1. **Verify nameserver configuration**:
   ```bash
   # Check that nameservers have been updated to AWS Route53
   dig NS firemandecko.com
   ```

2. **Verify all DNS records**:
   ```bash
   # Check A records
   dig A firemandecko.com
   dig A dollar-game.firemandecko.com
   
   # Check CNAME records
   dig CNAME www.firemandecko.com
   dig CNAME www.dollar-game.firemandecko.com
   
   # Check MX records
   dig MX firemandecko.com
   
   # Check TXT records
   dig TXT firemandecko.com
   ```

3. **Compare DNS records with pre-migration baseline**:
   - Compare the output of the above commands with the pre-migration baseline
   - Ensure all records are resolving correctly

### 3.2 SSL Certificate Validation

**Objective**: Verify that SSL certificates are properly validated and working.

**Tools Required**:
- AWS CLI
- OpenSSL
- Web browser

**Procedures**:

1. **Check ACM certificate status**:
   ```bash
   # Get the certificate ARN
   CERT_ARN=$(aws acm describe-certificate --domain-name dollar-game.firemandecko.com --query 'Certificate.CertificateArn' --output text)
   
   # Check certificate status
   aws acm describe-certificate --certificate-arn $CERT_ARN --query 'Certificate.Status' --output text
   ```

2. **Verify SSL certificate details**:
   ```bash
   # Check SSL certificate details
   openssl s_client -showcerts -connect dollar-game.firemandecko.com:443 </dev/null | openssl x509 -noout -text
   ```

3. **Test HTTPS functionality**:
   - Navigate to https://dollar-game.firemandecko.com in a web browser
   - Verify that the connection is secure (green padlock icon)
   - Check certificate details in the browser

### 3.3 CloudFront Distribution Testing

**Objective**: Verify that the CloudFront distribution is working correctly.

**Tools Required**:
- AWS CLI
- `curl` command-line tool
- Web browser

**Procedures**:

1. **Check CloudFront distribution status**:
   ```bash
   # Get the distribution ID
   DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[0]=='dollar-game.firemandecko.com'].Id" --output text)
   
   # Check distribution status
   aws cloudfront get-distribution --id $DIST_ID --query 'Distribution.Status' --output text
   ```

2. **Test CloudFront caching**:
   ```bash
   # Make multiple requests and check response headers
   curl -I https://dollar-game.firemandecko.com
   ```

3. **Verify CloudFront is serving content**:
   - Navigate to https://dollar-game.firemandecko.com in a web browser
   - Check network requests in browser developer tools
   - Verify that content is being served from CloudFront (check response headers)

### 3.4 End-to-End Testing

**Objective**: Verify overall functionality of the website and application.

**Tools Required**:
- Web browser
- `curl` command-line tool

**Procedures**:

1. **Test website accessibility**:
   ```bash
   # Check HTTP status codes (should redirect to HTTPS)
   curl -I http://firemandecko.com
   curl -I http://www.firemandecko.com
   curl -I http://dollar-game.firemandecko.com
   curl -I http://www.dollar-game.firemandecko.com
   
   # Check HTTPS status codes
   curl -I https://firemandecko.com
   curl -I https://www.firemandecko.com
   curl -I https://dollar-game.firemandecko.com
   curl -I https://www.dollar-game.firemandecko.com
   ```

2. **Test website functionality**:
   - Navigate through the website and test all key functionality
   - Test the Dollar Game application thoroughly
   - Document any issues or errors

## 4. Rollback Procedures

### 4.1 Rollback Decision Criteria

**Objective**: Define criteria for when to initiate rollback.

**Criteria**:
- Website is inaccessible for more than 30 minutes
- SSL certificate validation fails
- Critical functionality is broken
- DNS resolution issues persist after 24 hours

### 4.2 Rollback to Namecheap DNS

**Objective**: Revert DNS management back to Namecheap if needed.

**Tools Required**:
- Namecheap account access
- `dig` or `nslookup` command-line tools

**Procedures**:

1. **Revert nameservers at Namecheap**:
   - Log in to Namecheap account
   - Go to Domain List > Manage > Domain
   - Select "Namecheap BasicDNS" instead of "Custom DNS"
   - Save changes

2. **Verify nameserver changes**:
   ```bash
   # Check nameserver propagation (run periodically)
   dig NS firemandecko.com
   ```

3. **Monitor DNS propagation**:
   - Use [dnschecker.org](https://dnschecker.org/) to check DNS propagation across different global locations
   - Monitor until the original Namecheap nameservers are visible globally

4. **Verify website functionality after rollback**:
   - Navigate to the website and test key functionality
   - Document any issues or errors

### 4.3 Post-Rollback Actions

**Objective**: Document issues and plan for future migration attempt.

**Procedures**:

1. **Document issues encountered**:
   - Record all issues that led to the rollback
   - Analyze root causes

2. **Update migration plan**:
   - Revise the migration plan based on lessons learned
   - Address any issues that caused the rollback

3. **Schedule new migration attempt**:
   - Plan for a new migration attempt with the updated plan
   - Ensure all stakeholders are informed