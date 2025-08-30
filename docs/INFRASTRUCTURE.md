# Infrastructure & Deployment - AWS Native

## Overview
Liminal Transit uses a 100% AWS cloud-native architecture with Infrastructure as Code (Terraform) and GitHub Actions for CI/CD. The solution features modular AI service integration supporting OpenAI, Anthropic Claude, AWS Bedrock, and future AI providers through a pluggable architecture.

## AWS Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          AWS Cloud                              │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   CloudFront    │───▶│      S3         │    │  API Gateway │ │
│  │   (Global CDN)  │    │  (Static Site)  │    │  (AI Proxy)  │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                       │                      │      │
│           │              ┌─────────────────┐            │      │
│           │              │   Lambda@Edge   │            │      │
│           │              │ (A/B Testing)   │            │      │
│           │              └─────────────────┘            │      │
│           │                                             │      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    AI Services Layer                        │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │   Bedrock   │  │  External   │  │   Future    │         │ │
│  │  │ (Claude 3)  │  │   OpenAI    │  │    Models   │         │ │
│  │  │   Titan     │  │   Claude    │  │             │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   CloudWatch    │    │   Systems Mgr   │    │   Secrets    │ │
│  │  (Monitoring)   │    │ (Config/Params) │    │   Manager    │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │      WAF        │    │   Certificate   │    │     Route53  │ │
│  │  (Security)     │    │    Manager      │    │    (DNS)     │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Modular AI Service Architecture

### AI Provider Abstraction Layer
```typescript
interface AIProvider {
  name: string;
  generateNarrative(prompt: string, context: StoryContext): Promise<string>;
  validateResponse(response: string): boolean;
  estimateCost(tokens: number): number;
  getModelCapabilities(): ModelCapabilities;
}

// Implementations
class BedrockProvider implements AIProvider { ... }
class OpenAIProvider implements AIProvider { ... }
class ClaudeProvider implements AIProvider { ... }
class CustomModelProvider implements AIProvider { ... }
```

### AWS AI Services Integration
- **Amazon Bedrock**: Primary AI service with Claude 3, Titan models
- **Amazon SageMaker**: Custom model hosting and endpoints
- **Amazon Comprehend**: Content analysis and safety
- **Amazon Translate**: Multi-language support
- **Lambda Functions**: AI request routing and response processing

## Terraform Configuration

### Directory Structure
```
terraform/
├── modules/
│   ├── cloudfront/          # CDN and edge configuration
│   ├── s3-website/          # Static website hosting
│   ├── api-gateway/         # AI service proxy
│   ├── lambda/              # Edge functions and AI routing
│   ├── bedrock/             # AWS Bedrock configuration
│   ├── monitoring/          # CloudWatch, X-Ray, alarms
│   ├── security/            # WAF, IAM, certificates
│   └── networking/          # VPC, subnets (if needed)
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
├── shared/
│   ├── data.tf              # Shared data sources
│   ├── locals.tf            # Common local values
│   └── outputs.tf           # Cross-environment outputs
└── scripts/
    ├── deploy.sh            # Deployment automation
    ├── rollback.sh          # Rollback procedures
    └── validate.sh          # Configuration validation
```

### Core AWS Resources

#### 1. Static Website Hosting (modules/s3-website/)
```hcl
resource "aws_s3_bucket" "website" {
  bucket = "${var.environment}-liminal-transit-${random_string.suffix.result}"
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # SPA fallback
  }
}

resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id
  policy = data.aws_iam_policy_document.website_policy.json
}
```

#### 2. CloudFront Distribution (modules/cloudfront/)
```hcl
resource "aws_cloudfront_distribution" "website" {
  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.website.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.website.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = aws_lambda_function.edge_router.qualified_arn
      include_body = false
    }
  }

  # AI API caching behavior
  ordered_cache_behavior {
    path_pattern     = "/api/ai/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_api_gateway_rest_api.ai_proxy.id
    
    cache_policy_id = aws_cloudfront_cache_policy.ai_cache.id
    
    lambda_function_association {
      event_type   = "origin-request"
      lambda_arn   = aws_lambda_function.ai_router.qualified_arn
      include_body = true
    }
  }
}
```

#### 3. API Gateway for AI Services (modules/api-gateway/)
```hcl
resource "aws_api_gateway_rest_api" "ai_proxy" {
  name        = "${var.environment}-liminal-ai-proxy"
  description = "AI service proxy for Liminal Transit"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "ai" {
  rest_api_id = aws_api_gateway_rest_api.ai_proxy.id
  parent_id   = aws_api_gateway_rest_api.ai_proxy.root_resource_id
  path_part   = "ai"
}

resource "aws_api_gateway_method" "ai_post" {
  rest_api_id   = aws_api_gateway_rest_api.ai_proxy.id
  resource_id   = aws_api_gateway_resource.ai.id
  http_method   = "POST"
  authorization = "AWS_IAM"
}

resource "aws_api_gateway_integration" "ai_lambda" {
  rest_api_id = aws_api_gateway_rest_api.ai_proxy.id
  resource_id = aws_api_gateway_resource.ai.id
  http_method = aws_api_gateway_method.ai_post.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.ai_handler.invoke_arn
}
```

#### 4. AWS Bedrock Integration (modules/bedrock/)
```hcl
resource "aws_bedrock_model_invocation_logging_configuration" "liminal" {
  logging_config {
    embedding_data_delivery_enabled = true
    image_data_delivery_enabled     = false
    text_data_delivery_enabled      = true

    s3_config {
      bucket_name = aws_s3_bucket.bedrock_logs.id
      key_prefix  = "bedrock-logs/"
    }

    cloudwatch_config {
      log_group_name = aws_cloudwatch_log_group.bedrock.name
      role_arn       = aws_iam_role.bedrock_logging.arn
    }
  }
}

# IAM for Bedrock access
resource "aws_iam_role" "bedrock_execution" {
  name = "${var.environment}-bedrock-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "bedrock_access" {
  name = "${var.environment}-bedrock-access"
  role = aws_iam_role.bedrock_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = [
          "arn:aws:bedrock:${var.aws_region}::foundation-model/anthropic.claude-3-*",
          "arn:aws:bedrock:${var.aws_region}::foundation-model/amazon.titan-*"
        ]
      }
    ]
  })
}
```

#### 5. Lambda Functions (modules/lambda/)
```hcl
# AI Request Router
resource "aws_lambda_function" "ai_router" {
  filename      = "ai-router.zip"
  function_name = "${var.environment}-ai-router"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 30

  environment {
    variables = {
      ENVIRONMENT = var.environment
      BEDROCK_REGION = var.aws_region
      AI_PROVIDER_CONFIG = aws_ssm_parameter.ai_config.value
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.ai_router,
  ]
}

# Edge Router for A/B Testing
resource "aws_lambda_function" "edge_router" {
  filename      = "edge-router.zip"
  function_name = "${var.environment}-edge-router"
  role          = aws_iam_role.lambda_edge_execution.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 5
  publish       = true

  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }
}
```

## GitHub Actions Workflows

### 1. Comprehensive CI Pipeline (.github/workflows/ci.yml)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  TERRAFORM_VERSION: 1.6.0

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type checking
        run: pnpm typecheck
      
      - name: ESLint
        run: pnpm lint
      
      - name: Prettier check
        run: pnpm format:check
      
      - name: Unit tests
        run: pnpm test:unit --coverage
      
      - name: Integration tests
        run: pnpm test:integration
      
      - name: AI reliability tests
        run: pnpm test:ai
        env:
          TEST_AI_PROVIDER: mock
      
      - name: Build application
        run: pnpm build
      
      - name: Bundle size analysis
        run: pnpm bundle:analyze
      
      - name: Upload coverage to CodeCov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true

  terraform-validate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TERRAFORM_VERSION }}
      
      - name: Terraform Format Check
        run: terraform fmt -check -recursive
        working-directory: terraform/
      
      - name: Terraform Validation
        run: |
          cd terraform/environments/dev
          terraform init -backend=false
          terraform validate
      
      - name: TFLint
        uses: terraform-linters/setup-tflint@v3
        with:
          tflint_version: latest
      
      - name: Run TFLint
        run: tflint --recursive
        working-directory: terraform/

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Run Semgrep scan
        uses: returntocorp/semgrep-action@v1
        with:
          config: auto
      
      - name: Terraform security scan
        uses: aquasecurity/tfsec-action@v1.0.3
        with:
          working_directory: terraform/
```

### 2. AWS Deployment Pipeline (.github/workflows/deploy.yml)
```yaml
name: AWS Deployment

on:
  push:
    branches: [main]
  release:
    types: [published]

env:
  AWS_REGION: us-east-1
  TERRAFORM_VERSION: 1.6.0

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies and build
        run: |
          pnpm install --frozen-lockfile
          pnpm build
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TERRAFORM_VERSION }}
      
      - name: Deploy infrastructure to staging
        working-directory: terraform/environments/staging
        run: |
          terraform init
          terraform plan -out=tfplan
          terraform apply tfplan
        env:
          TF_VAR_environment: staging
          TF_VAR_domain_name: staging.liminal-transit.com
      
      - name: Deploy application to S3
        run: |
          aws s3 sync dist/ s3://${{ steps.terraform.outputs.s3_bucket_name }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ steps.terraform.outputs.cloudfront_distribution_id }} --paths "/*"
      
      - name: Run E2E tests against staging
        run: |
          PLAYWRIGHT_BASE_URL=https://staging.liminal-transit.com pnpm test:e2e
      
      - name: Notify deployment status
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  deploy-production:
    runs-on: ubuntu-latest
    if: github.event_name == 'release'
    needs: [deploy-staging]
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies and build
        run: |
          pnpm install --frozen-lockfile
          pnpm build
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TERRAFORM_VERSION }}
      
      - name: Deploy infrastructure to production
        working-directory: terraform/environments/production
        run: |
          terraform init
          terraform plan -out=tfplan
          terraform apply tfplan
        env:
          TF_VAR_environment: production
          TF_VAR_domain_name: liminal-transit.com
      
      - name: Deploy application to S3
        run: |
          aws s3 sync dist/ s3://${{ steps.terraform.outputs.s3_bucket_name }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ steps.terraform.outputs.cloudfront_distribution_id }} --paths "/*"
      
      - name: Smoke tests
        run: |
          PLAYWRIGHT_BASE_URL=https://liminal-transit.com pnpm test:smoke
      
      - name: Update monitoring dashboards
        run: |
          aws cloudwatch put-dashboard --dashboard-name "LiminalTransit-Production" --dashboard-body file://monitoring/dashboard.json

  rollback:
    runs-on: ubuntu-latest
    if: failure()
    environment: production
    
    steps:
      - name: Rollback deployment
        run: |
          cd terraform/environments/production
          terraform init
          terraform apply -auto-approve -var="app_version=${{ github.event.before }}"
```

### 3. AI Model Testing Pipeline (.github/workflows/ai-tests.yml)
```yaml
name: AI Model Testing

on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:

jobs:
  ai-reliability-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        ai-provider: [bedrock-claude, bedrock-titan, openai, anthropic]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Run AI reliability tests
        run: pnpm test:ai --provider=${{ matrix.ai-provider }}
        env:
          AI_TEST_PROVIDER: ${{ matrix.ai-provider }}
          AWS_REGION: us-east-1
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: ai-test-results-${{ matrix.ai-provider }}
          path: test-results/ai/
      
      - name: Update AI performance metrics
        run: |
          aws cloudwatch put-metric-data \
            --namespace "LiminalTransit/AI" \
            --metric-data MetricName=ResponseQuality,Value=${{ steps.test.outputs.quality_score }},Unit=Percent \
            --metric-data MetricName=ResponseTime,Value=${{ steps.test.outputs.avg_response_time }},Unit=Milliseconds
```

## Local Development Scripts

### Enhanced Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test": "vitest",
    "test:unit": "vitest run --coverage src/**/*.test.ts",
    "test:integration": "vitest run --coverage src/**/*.integration.test.ts",
    "test:ai": "vitest run src/lib/__tests__/ai-reliability.test.ts",
    "test:e2e": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    
    "docker:dev": "docker-compose -f docker-compose.dev.yml up",
    "docker:dev:rebuild": "docker-compose -f docker-compose.dev.yml up --build --force-recreate",
    "docker:dev:down": "docker-compose -f docker-compose.dev.yml down -v",
    "docker:prod": "docker-compose -f docker-compose.prod.yml up",
    "docker:test": "docker-compose -f docker-compose.test.yml up --abort-on-container-exit",
    "docker:clean": "docker system prune -f && docker volume prune -f",
    
    "aws:configure": "aws configure",
    "aws:whoami": "aws sts get-caller-identity",
    "aws:login": "aws sso login",
    
    "terraform:init": "cd terraform && terraform init",
    "terraform:plan": "cd terraform && terraform plan",
    "terraform:apply": "cd terraform && terraform apply",
    "terraform:destroy": "cd terraform && terraform destroy",
    "terraform:validate": "cd terraform && terraform validate && terraform fmt -check",
    "terraform:format": "cd terraform && terraform fmt -recursive",
    
    "deploy:dev": "pnpm build && cd terraform/environments/dev && terraform apply -auto-approve",
    "deploy:staging": "pnpm build && cd terraform/environments/staging && terraform apply -auto-approve",
    "deploy:prod": "pnpm build && cd terraform/environments/production && terraform apply",
    "deploy:rollback": "cd terraform/environments/production && terraform apply -var='app_version=${PREVIOUS_VERSION}'",
    
    "security:scan": "snyk test && semgrep --config=auto .",
    "security:monitor": "snyk monitor",
    "security:terraform": "tfsec terraform/",
    
    "bundle:analyze": "pnpm build && npx vite-bundle-analyzer dist",
    "bundle:size": "bundlesize",
    
    "ai:test-bedrock": "AWS_PROFILE=default pnpm test:ai --provider=bedrock",
    "ai:test-openai": "pnpm test:ai --provider=openai",
    "ai:benchmark": "pnpm test:ai --benchmark",
    
    "logs:cloudwatch": "aws logs tail /aws/lambda/liminal-ai-router --follow",
    "logs:access": "aws logs tail /aws/cloudfront/liminal-transit --follow",
    
    "clean": "rm -rf dist node_modules/.cache .terraform",
    "reset": "pnpm clean && pnpm install && pnpm terraform:init",
    "health-check": "pnpm typecheck && pnpm lint && pnpm test:unit"
  }
}
```

### Development Environment Scripts

#### scripts/dev-setup.sh
```bash
#!/bin/bash
set -e

echo "🚀 Setting up Liminal Transit development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "AWS CLI is required but not installed."; exit 1; }

# Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Setup pre-commit hooks
echo "Setting up pre-commit hooks..."
pnpm husky install

# Configure AWS (if not already configured)
if ! aws sts get-caller-identity &> /dev/null; then
    echo "AWS credentials not configured. Please run: aws configure"
    exit 1
fi

# Initialize Terraform
echo "Initializing Terraform..."
cd terraform && terraform init

# Copy environment files
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "Created .env.local - please update with your configuration"
fi

echo "✅ Development environment setup complete!"
echo "🏃 Run 'pnpm dev' to start the development server"
echo "🐳 Or run 'pnpm docker:dev' to use Docker"
```

#### scripts/deploy.sh
```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-$(git rev-parse --short HEAD)}

echo "🚀 Deploying Liminal Transit to $ENVIRONMENT (version: $VERSION)..."

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    echo "❌ Invalid environment. Use: dev, staging, or production"
    exit 1
fi

# Production deployment confirmation
if [ "$ENVIRONMENT" = "production" ]; then
    read -p "🚨 Deploy to PRODUCTION? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
fi

# Build application
echo "📦 Building application..."
pnpm build

# Run tests
echo "🧪 Running tests..."
pnpm test:unit
pnpm test:integration

# Security scan
echo "🔒 Running security scan..."
pnpm security:scan

# Terraform deployment
echo "🏗️ Deploying infrastructure..."
cd terraform/environments/$ENVIRONMENT

terraform init
terraform plan -out=tfplan -var="app_version=$VERSION"
terraform apply tfplan

# Get outputs
S3_BUCKET=$(terraform output -raw s3_bucket_name)
CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id)

# Deploy application
echo "📤 Uploading application files..."
aws s3 sync ../../../dist/ s3://$S3_BUCKET --delete

# Invalidate CloudFront
echo "🔄 Invalidating CDN cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

# Smoke test
if [ "$ENVIRONMENT" = "production" ]; then
    DOMAIN=$(terraform output -raw domain_name)
    echo "🔍 Running smoke tests..."
    curl -f https://$DOMAIN/health || { echo "❌ Smoke test failed"; exit 1; }
fi

echo "✅ Deployment to $ENVIRONMENT completed successfully!"
```

#### scripts/rollback.sh
```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-production}
PREVIOUS_VERSION=${2}

if [ -z "$PREVIOUS_VERSION" ]; then
    echo "❌ Previous version required for rollback"
    echo "Usage: ./scripts/rollback.sh [environment] [previous_version]"
    exit 1
fi

echo "🔄 Rolling back $ENVIRONMENT to version $PREVIOUS_VERSION..."

cd terraform/environments/$ENVIRONMENT

# Apply previous version
terraform apply -auto-approve -var="app_version=$PREVIOUS_VERSION"

# Get outputs
CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id)

# Invalidate cache
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

echo "✅ Rollback completed successfully!"
```

## Docker Configuration

### Development (docker-compose.dev.yml)
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_BASE_URL=http://localhost:5173
    command: pnpm dev

  test:
    build:
      context: .
      dockerfile: docker/Dockerfile.test
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=test
    command: pnpm test:watch
```

### Production (docker-compose.prod.yml)
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile.prod
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app
    restart: unless-stopped
```

## Monitoring & Observability

### Metrics Collection
- **Performance**: Core Web Vitals, bundle size, load times
- **User Behavior**: Story completion rates, choice patterns
- **AI Performance**: Response times, error rates, quality metrics
- **Infrastructure**: CDN hit rates, error rates, availability

### Alerting Rules
- **Critical**: 5xx errors > 1%, availability < 99.5%
- **Warning**: Response time > 3s, AI errors > 5%
- **Info**: Deployment notifications, daily metrics summary

### Dashboard Components
- Real-time user sessions and story interactions
- AI narrative generation performance and reliability
- Infrastructure health and cost metrics
- Security scan results and dependency updates

## Environment Management

### Development
- Local Docker with hot reload
- Mock AI services for testing
- In-memory data storage
- Debug logging enabled

### Staging
- Production-like infrastructure
- Real AI integration with rate limiting
- Persistent data storage
- Performance monitoring

### Production
- Auto-scaling infrastructure
- Full AI capabilities
- Global CDN distribution
- Comprehensive monitoring

## Security Considerations

### Infrastructure Security
- HTTPS enforcement with modern TLS
- Content Security Policy headers
- Regular security updates and patches
- Infrastructure as Code for consistency

### Application Security
- Input validation and sanitization
- Rate limiting for AI requests
- Error handling without information leakage
- Regular dependency vulnerability scans

### Deployment Security
- Secrets management via environment variables
- Least privilege access controls
- Automated security testing in CI/CD
- Infrastructure change approval workflows
