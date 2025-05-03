# GitHub Actions Workflow Architecture

This document describes the architecture of the GitHub Actions workflows used for deploying the Dollar Game application.

## Overview

The project uses two separate GitHub Actions workflows:

1. **Infrastructure Deployment Workflow** - Deploys AWS infrastructure using OpenTofu
2. **Application Deployment Workflow** - Builds and deploys the React application to AWS S3

These workflows are designed to run independently based on which files have changed in a commit, ensuring efficient and targeted deployments.

## Infrastructure Deployment Workflow

**File:** `.github/workflows/deploy-infrastructure.yml`

### Trigger
- Runs on pushes to the `master` branch
- Only triggers when files in the `infrastructure/` directory are modified

### Container
- Uses the `ghcr.io/opentofu/opentofu:1.6.0` container image
- Has OpenTofu pre-installed for efficient infrastructure deployment

### Steps
1. **Checkout code** - Retrieves the repository code
2. **Set up AWS profile** - Configures AWS credentials for OpenTofu
3. **Initialize OpenTofu** - Prepares the OpenTofu environment
4. **Plan infrastructure changes** - Creates an execution plan
5. **Apply infrastructure changes** - Implements the planned changes
6. **Output deployment status** - Displays the deployment results including the website URL

### Resources Deployed
- S3 bucket for website hosting
- S3 bucket configuration for static website
- S3 bucket policy for public access
- S3 bucket and DynamoDB table for Terraform state management

## Application Deployment Workflow

**File:** `.github/workflows/deploy-app.yml`

### Trigger
- Runs on pushes to the `master` branch
- Only triggers when files outside the `infrastructure/` directory are modified
- Ignores changes to `.github/workflows/deploy-infrastructure.yml` and markdown files

### Container
- Uses the `node:20` container image
- Has Node.js pre-installed for building the application
- AWS CLI is installed during the workflow execution

### Steps
1. **Checkout code** - Retrieves the repository code
2. **Install AWS CLI** - Sets up the AWS CLI for S3 deployment
3. **Install dependencies and build** - Installs npm dependencies and builds the application
4. **Set up AWS profile** - Configures AWS credentials for S3 access
5. **Deploy to S3** - Uploads the built application to the S3 bucket
6. **Verify deployment** - Confirms the deployment was successful
7. **Output deployment status** - Displays the deployment results including the website URL

## Workflow Optimization

Both workflows are optimized for efficiency:

1. **Containerized Execution** - Using pre-built containers with required tools
2. **Selective Triggering** - Only running workflows when relevant files change
3. **AWS Credentials Management** - Secure handling of AWS credentials via GitHub secrets
4. **Verification Steps** - Ensuring deployments are successful before completing

## Testing

The workflows have been verified using the `act` tool, which allows for local testing of GitHub Actions workflows. Both workflows successfully complete their respective tasks:

1. The infrastructure workflow correctly plans and applies infrastructure changes
2. The application workflow successfully builds and deploys the application to S3

## Future Improvements

Potential future improvements to the workflows could include:

1. Adding CloudFront distribution for CDN capabilities
2. Implementing automated testing before deployment
3. Adding deployment notifications via Slack or email
4. Setting up staging environments for pre-production testing