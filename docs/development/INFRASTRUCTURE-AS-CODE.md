# Infrastructure as Code (Terraform) Patterns

## Overview

Comprehensive Infrastructure as Code patterns for the AI Native Liminal Transit platform using Terraform, featuring modular AWS Well-Architected infrastructure, automated deployment pipelines, multi-environment management, and self-optimizing resource configurations with AI-driven cost optimization.

---

## 🏗️ **Terraform Architecture Principles**

### Modular Infrastructure Design
```hcl
# Root module structure
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── production/
├── modules/
│   ├── ai-infrastructure/
│   ├── api-gateway/
│   ├── cognito/
│   ├── dynamodb/
│   ├── lambda/
│   ├── s3/
│   ├── vpc/
│   └── monitoring/
├── shared/
│   ├── backend.tf
│   ├── providers.tf
│   └── versions.tf
└── scripts/
    ├── deploy.sh
    ├── destroy.sh
    └── plan.sh
```

### AWS Well-Architected Terraform Patterns
```hcl
# terraform/modules/well-architected-foundation/main.tf

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Well-Architected Foundation Module
module "well_architected_foundation" {
  source = "../../modules/well-architected-foundation"

  # Operational Excellence
  operational_excellence = {
    enable_automation     = true
    enable_monitoring     = true
    enable_ci_cd         = true
    enable_iac           = true
  }

  # Security
  security = {
    enable_encryption_at_rest     = true
    enable_encryption_in_transit  = true
    enable_waf                   = true
    enable_guardduty             = true
    enable_config                = true
    enable_cloudtrail            = true
  }

  # Reliability
  reliability = {
    multi_az                     = true
    enable_backup               = true
    enable_disaster_recovery    = true
    rto_minutes                 = 60
    rpo_minutes                 = 15
  }

  # Performance Efficiency
  performance = {
    enable_auto_scaling         = true
    enable_caching             = true
    enable_cdn                 = true
    enable_performance_monitoring = true
  }

  # Cost Optimization
  cost_optimization = {
    enable_cost_monitoring      = true
    enable_resource_tagging     = true
    enable_rightsizing         = true
    enable_reserved_instances   = var.environment == "production"
  }

  # Sustainability
  sustainability = {
    enable_green_computing      = true
    prefer_arm_instances       = true
    enable_spot_instances      = var.environment != "production"
    carbon_footprint_tracking  = true
  }

  environment = var.environment
  project     = var.project_name
  tags        = local.common_tags
}
```

---

## 🚀 **Core Infrastructure Modules**

### VPC and Networking Module
```hcl
# terraform/modules/vpc/main.tf

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.tags, {
    Name = "${var.environment}-${var.project}-vpc"
  })
}

# Multi-AZ subnets for high availability
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.environment}-${var.project}-public-${count.index + 1}"
    Type = "Public"
    Tier = "Web"
  })
}

resource "aws_subnet" "private" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.tags, {
    Name = "${var.environment}-${var.project}-private-${count.index + 1}"
    Type = "Private"
    Tier = "Application"
  })
}

resource "aws_subnet" "database" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 20)
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.tags, {
    Name = "${var.environment}-${var.project}-database-${count.index + 1}"
    Type = "Private"
    Tier = "Database"
  })
}

# Internet Gateway for public access
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.environment}-${var.project}-igw"
  })
}

# NAT Gateways for private subnet internet access
resource "aws_eip" "nat" {
  count = var.enable_nat_gateway ? length(var.availability_zones) : 0

  domain = "vpc"
  depends_on = [aws_internet_gateway.main]

  tags = merge(var.tags, {
    Name = "${var.environment}-${var.project}-nat-eip-${count.index + 1}"
  })
}

resource "aws_nat_gateway" "main" {
  count = var.enable_nat_gateway ? length(var.availability_zones) : 0

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  depends_on    = [aws_internet_gateway.main]

  tags = merge(var.tags, {
    Name = "${var.environment}-${var.project}-nat-${count.index + 1}"
  })
}

# Route tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-${var.project}-public-rt"
  })
}

resource "aws_route_table" "private" {
  count = var.enable_nat_gateway ? length(var.availability_zones) : 1

  vpc_id = aws_vpc.main.id

  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.main[count.index].id
    }
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-${var.project}-private-rt-${count.index + 1}"
  })
}

# Route table associations
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = var.enable_nat_gateway ? aws_route_table.private[count.index].id : aws_route_table.private[0].id
}

resource "aws_route_table_association" "database" {
  count = length(aws_subnet.database)

  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = var.enable_nat_gateway ? aws_route_table.private[count.index].id : aws_route_table.private[0].id
}

# VPC Flow Logs for security monitoring
resource "aws_flow_log" "vpc" {
  count = var.enable_flow_logs ? 1 : 0

  iam_role_arn    = aws_iam_role.flow_log[0].arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_log[0].arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id
}

resource "aws_cloudwatch_log_group" "vpc_flow_log" {
  count = var.enable_flow_logs ? 1 : 0

  name              = "/aws/vpc/flowlog/${var.environment}-${var.project}"
  retention_in_days = var.flow_log_retention_days

  tags = var.tags
}

resource "aws_iam_role" "flow_log" {
  count = var.enable_flow_logs ? 1 : 0

  name = "${var.environment}-${var.project}-flow-log-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "flow_log" {
  count = var.enable_flow_logs ? 1 : 0

  name = "${var.environment}-${var.project}-flow-log-policy"
  role = aws_iam_role.flow_log[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}
```

### AI Infrastructure Module
```hcl
# terraform/modules/ai-infrastructure/main.tf

# AI Model Management and Optimization
resource "aws_lambda_function" "ai_orchestrator" {
  filename         = "ai_orchestrator.zip"
  function_name    = "${var.environment}-${var.project}-ai-orchestrator"
  role            = aws_iam_role.ai_orchestrator.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 300
  memory_size     = 1024

  environment {
    variables = {
      ENVIRONMENT = var.environment
      DYNAMODB_PROMPTS_TABLE = aws_dynamodb_table.ai_prompts.name
      DYNAMODB_RESPONSES_TABLE = aws_dynamodb_table.ai_responses.name
      S3_BUCKET = aws_s3_bucket.ai_data.bucket
      OPENAI_API_ENDPOINT = var.openai_endpoint
      ANTHROPIC_API_ENDPOINT = var.anthropic_endpoint
      AWS_BEDROCK_REGION = var.aws_region
    }
  }

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [aws_security_group.ai_orchestrator.id]
  }

  tags = var.tags
}

# AI Prompt and Response Storage
resource "aws_dynamodb_table" "ai_prompts" {
  name           = "${var.environment}-${var.project}-ai-prompts"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "promptId"

  attribute {
    name = "promptId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name     = "TimestampIndex"
    hash_key = "timestamp"
  }

  global_secondary_index {
    name     = "UserIndex"
    hash_key = "userId"
  }

  # TTL for automatic data cleanup
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  # Point-in-time recovery
  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  # Server-side encryption
  server_side_encryption {
    enabled     = true
    kms_key_id  = aws_kms_key.ai_data.arn
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "ai_responses" {
  name           = "${var.environment}-${var.project}-ai-responses"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "responseId"

  attribute {
    name = "responseId"
    type = "S"
  }

  attribute {
    name = "promptId"
    type = "S"
  }

  attribute {
    name = "qualityScore"
    type = "N"
  }

  global_secondary_index {
    name     = "PromptIndex"
    hash_key = "promptId"
  }

  global_secondary_index {
    name               = "QualityIndex"
    hash_key           = "qualityScore"
    projection_type    = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  server_side_encryption {
    enabled     = true
    kms_key_id  = aws_kms_key.ai_data.arn
  }

  tags = var.tags
}

# S3 bucket for AI data archival and model artifacts
resource "aws_s3_bucket" "ai_data" {
  bucket = "${var.environment}-${var.project}-ai-data-${random_id.bucket_suffix.hex}"

  tags = var.tags
}

resource "aws_s3_bucket_versioning" "ai_data" {
  bucket = aws_s3_bucket.ai_data.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "ai_data" {
  bucket = aws_s3_bucket.ai_data.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.ai_data.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "ai_data" {
  depends_on = [aws_s3_bucket_versioning.ai_data]
  bucket     = aws_s3_bucket.ai_data.id

  rule {
    id     = "ai_data_lifecycle"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }
}

# KMS key for AI data encryption
resource "aws_kms_key" "ai_data" {
  description             = "${var.environment} ${var.project} AI data encryption key"
  deletion_window_in_days = var.environment == "production" ? 30 : 7

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow AI services"
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "dynamodb.amazonaws.com",
            "s3.amazonaws.com"
          ]
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "*"
      }
    ]
  })

  tags = var.tags
}

resource "aws_kms_alias" "ai_data" {
  name          = "alias/${var.environment}-${var.project}-ai-data"
  target_key_id = aws_kms_key.ai_data.key_id
}

# AI Cost Optimization Lambda
resource "aws_lambda_function" "cost_optimizer" {
  filename         = "cost_optimizer.zip"
  function_name    = "${var.environment}-${var.project}-cost-optimizer"
  role            = aws_iam_role.cost_optimizer.arn
  handler         = "index.handler"
  runtime         = "python3.11"
  timeout         = 900
  memory_size     = 512

  environment {
    variables = {
      COST_BUDGET_MONTHLY = var.monthly_cost_budget
      ALERT_SNS_TOPIC = aws_sns_topic.cost_alerts.arn
      DYNAMODB_COST_TABLE = aws_dynamodb_table.cost_tracking.name
    }
  }

  tags = var.tags
}

# EventBridge rule for cost optimization
resource "aws_cloudwatch_event_rule" "cost_optimization" {
  name                = "${var.environment}-${var.project}-cost-optimization"
  description         = "Trigger cost optimization every hour"
  schedule_expression = "rate(1 hour)"

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "cost_optimization" {
  rule      = aws_cloudwatch_event_rule.cost_optimization.name
  target_id = "CostOptimizationTarget"
  arn       = aws_lambda_function.cost_optimizer.arn
}

resource "aws_lambda_permission" "allow_eventbridge_cost" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cost_optimizer.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cost_optimization.arn
}

# Cost tracking DynamoDB table
resource "aws_dynamodb_table" "cost_tracking" {
  name           = "${var.environment}-${var.project}-cost-tracking"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "date"

  attribute {
    name = "date"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = var.tags
}

# SNS topic for cost alerts
resource "aws_sns_topic" "cost_alerts" {
  name = "${var.environment}-${var.project}-cost-alerts"

  tags = var.tags
}

# CloudWatch alarms for AI infrastructure
resource "aws_cloudwatch_metric_alarm" "ai_orchestrator_errors" {
  alarm_name          = "${var.environment}-${var.project}-ai-orchestrator-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors AI orchestrator errors"
  alarm_actions       = [aws_sns_topic.cost_alerts.arn]

  dimensions = {
    FunctionName = aws_lambda_function.ai_orchestrator.function_name
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "ai_orchestrator_duration" {
  alarm_name          = "${var.environment}-${var.project}-ai-orchestrator-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Average"
  threshold           = "30000"
  alarm_description   = "This metric monitors AI orchestrator duration"
  alarm_actions       = [aws_sns_topic.cost_alerts.arn]

  dimensions = {
    FunctionName = aws_lambda_function.ai_orchestrator.function_name
  }

  tags = var.tags
}

# Security groups
resource "aws_security_group" "ai_orchestrator" {
  name_prefix = "${var.environment}-${var.project}-ai-orchestrator"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS outbound for AI APIs"
  }

  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP outbound"
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-${var.project}-ai-orchestrator-sg"
  })
}

# IAM roles and policies
resource "aws_iam_role" "ai_orchestrator" {
  name = "${var.environment}-${var.project}-ai-orchestrator-role"

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

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "ai_orchestrator_vpc" {
  role       = aws_iam_role.ai_orchestrator.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "ai_orchestrator" {
  name = "${var.environment}-${var.project}-ai-orchestrator-policy"
  role = aws_iam_role.ai_orchestrator.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.ai_prompts.arn,
          aws_dynamodb_table.ai_responses.arn,
          "${aws_dynamodb_table.ai_prompts.arn}/index/*",
          "${aws_dynamodb_table.ai_responses.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.ai_data.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.ai_data.arn
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role" "cost_optimizer" {
  name = "${var.environment}-${var.project}-cost-optimizer-role"

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

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "cost_optimizer_basic" {
  role       = aws_iam_role.cost_optimizer.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "cost_optimizer" {
  name = "${var.environment}-${var.project}-cost-optimizer-policy"
  role = aws_iam_role.cost_optimizer.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ce:GetCostAndUsage",
          "ce:GetUsageReport",
          "budgets:ViewBudget",
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query"
        ]
        Resource = aws_dynamodb_table.cost_tracking.arn
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.cost_alerts.arn
      }
    ]
  })
}

# Random ID for unique resource naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Data sources
data "aws_caller_identity" "current" {}
```

### Lambda Deployment Module
```hcl
# terraform/modules/lambda/main.tf

resource "aws_lambda_function" "this" {
  filename         = var.filename
  function_name    = "${var.environment}-${var.project}-${var.function_name}"
  role            = aws_iam_role.lambda_role.arn
  handler         = var.handler
  runtime         = var.runtime
  timeout         = var.timeout
  memory_size     = var.memory_size
  
  source_code_hash = var.source_code_hash

  dynamic "environment" {
    for_each = length(var.environment_variables) > 0 ? [1] : []
    content {
      variables = var.environment_variables
    }
  }

  dynamic "vpc_config" {
    for_each = var.vpc_config != null ? [var.vpc_config] : []
    content {
      subnet_ids         = vpc_config.value.subnet_ids
      security_group_ids = vpc_config.value.security_group_ids
    }
  }

  dynamic "dead_letter_config" {
    for_each = var.dead_letter_config != null ? [var.dead_letter_config] : []
    content {
      target_arn = dead_letter_config.value.target_arn
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.lambda_logs,
  ]

  tags = var.tags
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.environment}-${var.project}-${var.function_name}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# IAM role for Lambda function
resource "aws_iam_role" "lambda_role" {
  name = "${var.environment}-${var.project}-${var.function_name}-role"

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

  tags = var.tags
}

# Attach basic execution role
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Attach VPC execution role if VPC config is provided
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  count      = var.vpc_config != null ? 1 : 0
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Custom IAM policy for additional permissions
resource "aws_iam_role_policy" "lambda_policy" {
  count = var.iam_policy_document != null ? 1 : 0
  name  = "${var.environment}-${var.project}-${var.function_name}-policy"
  role  = aws_iam_role.lambda_role.id

  policy = var.iam_policy_document
}

# Lambda function URL (if enabled)
resource "aws_lambda_function_url" "this" {
  count              = var.enable_function_url ? 1 : 0
  function_name      = aws_lambda_function.this.function_name
  authorization_type = var.function_url_auth_type

  dynamic "cors" {
    for_each = var.function_url_cors != null ? [var.function_url_cors] : []
    content {
      allow_credentials = cors.value.allow_credentials
      allow_headers     = cors.value.allow_headers
      allow_methods     = cors.value.allow_methods
      allow_origins     = cors.value.allow_origins
      expose_headers    = cors.value.expose_headers
      max_age          = cors.value.max_age
    }
  }
}

# Lambda alias for versioning
resource "aws_lambda_alias" "this" {
  count            = var.create_alias ? 1 : 0
  name             = var.alias_name
  description      = var.alias_description
  function_name    = aws_lambda_function.this.function_name
  function_version = aws_lambda_function.this.version
}

# CloudWatch alarms
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  count               = var.enable_error_alarm ? 1 : 0
  alarm_name          = "${var.environment}-${var.project}-${var.function_name}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.error_alarm_threshold
  alarm_description   = "This metric monitors lambda errors for ${var.function_name}"
  
  dimensions = {
    FunctionName = aws_lambda_function.this.function_name
  }

  alarm_actions = var.alarm_actions

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  count               = var.enable_duration_alarm ? 1 : 0
  alarm_name          = "${var.environment}-${var.project}-${var.function_name}-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Average"
  threshold           = var.duration_alarm_threshold
  alarm_description   = "This metric monitors lambda duration for ${var.function_name}"
  
  dimensions = {
    FunctionName = aws_lambda_function.this.function_name
  }

  alarm_actions = var.alarm_actions

  tags = var.tags
}
```

---

## 🔄 **Multi-Environment Management**

### Environment-Specific Configurations
```hcl
# terraform/environments/dev/main.tf

terraform {
  backend "s3" {
    bucket         = "liminal-transit-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "liminal-transit-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = "dev"
      Project     = "liminal-transit"
      ManagedBy   = "terraform"
      Owner       = "ai-native-development"
    }
  }
}

locals {
  environment = "dev"
  project     = "liminal-transit"
  
  common_tags = {
    Environment = local.environment
    Project     = local.project
    ManagedBy   = "terraform"
    Owner       = "ai-native-development"
  }
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"

  environment        = local.environment
  project           = local.project
  vpc_cidr          = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  enable_nat_gateway = false  # Cost optimization for dev
  enable_flow_logs   = true
  
  tags = local.common_tags
}

# AI Infrastructure Module
module "ai_infrastructure" {
  source = "../../modules/ai-infrastructure"

  environment           = local.environment
  project              = local.project
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  monthly_cost_budget  = 1000  # $1000/month for dev environment
  
  openai_endpoint      = "https://api.openai.com/v1"
  anthropic_endpoint   = "https://api.anthropic.com"
  aws_region          = var.aws_region
  
  tags = local.common_tags
}

# API Gateway Module
module "api_gateway" {
  source = "../../modules/api-gateway"

  environment        = local.environment
  project           = local.project
  lambda_function_arn = module.ai_infrastructure.ai_orchestrator_arn
  domain_name       = "dev-api.liminal-transit.local"
  
  tags = local.common_tags
}

# Monitoring Module
module "monitoring" {
  source = "../../modules/monitoring"

  environment = local.environment
  project     = local.project
  
  # Monitoring targets
  lambda_functions = [
    module.ai_infrastructure.ai_orchestrator_name,
    module.ai_infrastructure.cost_optimizer_name
  ]
  
  dynamodb_tables = [
    module.ai_infrastructure.ai_prompts_table_name,
    module.ai_infrastructure.ai_responses_table_name
  ]
  
  api_gateway_id = module.api_gateway.api_gateway_id
  
  tags = local.common_tags
}
```

### Production Environment
```hcl
# terraform/environments/production/main.tf

terraform {
  backend "s3" {
    bucket         = "liminal-transit-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "liminal-transit-terraform-locks"
  }
}

locals {
  environment = "production"
  project     = "liminal-transit"
  
  common_tags = {
    Environment = local.environment
    Project     = local.project
    ManagedBy   = "terraform"
    Owner       = "ai-native-development"
    CostCenter  = "engineering"
    Compliance  = "required"
  }
}

# Production-specific configurations
module "vpc" {
  source = "../../modules/vpc"

  environment        = local.environment
  project           = local.project
  vpc_cidr          = "10.1.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  enable_nat_gateway = true   # Required for production
  enable_flow_logs   = true
  
  tags = local.common_tags
}

module "ai_infrastructure" {
  source = "../../modules/ai-infrastructure"

  environment           = local.environment
  project              = local.project
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  monthly_cost_budget  = 50000  # $50,000/month for production
  
  # Production-grade configurations
  enable_multi_az       = true
  enable_backups        = true
  backup_retention_days = 30
  
  tags = local.common_tags
}

# WAF for production API protection
module "waf" {
  source = "../../modules/waf"

  environment = local.environment
  project     = local.project
  
  # Associate with API Gateway
  resource_arn = module.api_gateway.api_gateway_arn
  
  # Protection rules
  enable_rate_limiting    = true
  enable_geo_blocking     = true
  enable_ip_reputation    = true
  enable_bot_protection   = true
  
  tags = local.common_tags
}

# CloudFront distribution for global content delivery
module "cloudfront" {
  source = "../../modules/cloudfront"

  environment = local.environment
  project     = local.project
  
  origin_domain_name = module.api_gateway.api_gateway_domain_name
  
  # Cache behaviors for AI responses
  cache_behaviors = [
    {
      path_pattern     = "/api/v1/stories/*"
      ttl_min         = 0
      ttl_default     = 300     # 5 minutes
      ttl_max         = 86400   # 24 hours
      compress        = true
    }
  ]
  
  tags = local.common_tags
}
```

---

## 🤖 **Automation Scripts**

### Deployment Script
```bash
#!/bin/bash
# terraform/scripts/deploy.sh

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENTS=("dev" "staging" "production")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS] ENVIRONMENT

Deploy Terraform infrastructure for Liminal Transit

ARGUMENTS:
    ENVIRONMENT    Target environment (dev, staging, production)

OPTIONS:
    -p, --plan-only     Run terraform plan only (no apply)
    -d, --destroy       Destroy infrastructure
    -a, --auto-approve  Auto-approve changes (skip confirmation)
    -v, --verbose       Enable verbose output
    -h, --help          Show this help message

EXAMPLES:
    $0 dev                          # Deploy to dev environment
    $0 --plan-only production       # Plan production deployment
    $0 --destroy dev               # Destroy dev environment
    $0 --auto-approve staging      # Deploy staging with auto-approval

EOF
}

# Validate environment
validate_environment() {
    local env=$1
    
    if [[ ! " ${ENVIRONMENTS[@]} " =~ " ${env} " ]]; then
        log_error "Invalid environment: $env"
        log_info "Valid environments: ${ENVIRONMENTS[*]}"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check required tools
    local tools=("terraform" "aws" "jq")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is required but not installed"
            exit 1
        fi
    done
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured or invalid"
        exit 1
    fi
    
    # Check Terraform version
    local tf_version=$(terraform version -json | jq -r '.terraform_version')
    log_info "Using Terraform version: $tf_version"
    
    log_success "Prerequisites check passed"
}

# Initialize Terraform
terraform_init() {
    local env_dir=$1
    
    log_info "Initializing Terraform for $env_dir..."
    
    cd "$PROJECT_ROOT/environments/$env_dir"
    
    # Initialize with backend configuration
    terraform init \
        -backend-config="bucket=liminal-transit-terraform-state" \
        -backend-config="key=$env_dir/terraform.tfstate" \
        -backend-config="region=us-east-1" \
        -backend-config="encrypt=true" \
        -backend-config="dynamodb_table=liminal-transit-terraform-locks"
    
    log_success "Terraform initialized"
}

# Validate Terraform configuration
terraform_validate() {
    log_info "Validating Terraform configuration..."
    
    terraform validate
    
    if [ $? -eq 0 ]; then
        log_success "Terraform configuration is valid"
    else
        log_error "Terraform configuration validation failed"
        exit 1
    fi
}

# Run Terraform plan
terraform_plan() {
    local env=$1
    local plan_file="$env.tfplan"
    
    log_info "Running Terraform plan for $env..."
    
    terraform plan \
        -var-file="terraform.tfvars" \
        -out="$plan_file" \
        -detailed-exitcode
    
    local exit_code=$?
    
    case $exit_code in
        0)
            log_info "No changes detected"
            return 0
            ;;
        1)
            log_error "Terraform plan failed"
            exit 1
            ;;
        2)
            log_warning "Changes detected in plan"
            return 2
            ;;
    esac
}

# Apply Terraform changes
terraform_apply() {
    local env=$1
    local plan_file="$env.tfplan"
    local auto_approve=$2
    
    log_info "Applying Terraform changes for $env..."
    
    if [ "$auto_approve" = true ]; then
        terraform apply "$plan_file"
    else
        terraform apply "$plan_file"
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Terraform apply completed successfully"
    else
        log_error "Terraform apply failed"
        exit 1
    fi
}

# Destroy infrastructure
terraform_destroy() {
    local env=$1
    local auto_approve=$2
    
    log_warning "This will DESTROY all infrastructure in $env environment!"
    
    if [ "$auto_approve" != true ]; then
        read -p "Are you sure you want to continue? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            log_info "Destruction cancelled"
            exit 0
        fi
    fi
    
    log_info "Destroying infrastructure for $env..."
    
    if [ "$auto_approve" = true ]; then
        terraform destroy -var-file="terraform.tfvars" -auto-approve
    else
        terraform destroy -var-file="terraform.tfvars"
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Infrastructure destroyed successfully"
    else
        log_error "Infrastructure destruction failed"
        exit 1
    fi
}

# Get outputs
terraform_outputs() {
    local env=$1
    
    log_info "Retrieving Terraform outputs for $env..."
    
    terraform output -json > "${env}_outputs.json"
    
    log_success "Outputs saved to ${env}_outputs.json"
}

# Main deployment function
deploy() {
    local environment=$1
    local plan_only=$2
    local destroy=$3
    local auto_approve=$4
    local verbose=$5
    
    if [ "$verbose" = true ]; then
        set -x
    fi
    
    validate_environment "$environment"
    check_prerequisites
    
    local env_dir="$PROJECT_ROOT/environments/$environment"
    
    if [ ! -d "$env_dir" ]; then
        log_error "Environment directory not found: $env_dir"
        exit 1
    fi
    
    terraform_init "$environment"
    terraform_validate
    
    if [ "$destroy" = true ]; then
        terraform_destroy "$environment" "$auto_approve"
    else
        terraform_plan "$environment"
        local plan_exit_code=$?
        
        if [ "$plan_only" = true ]; then
            log_info "Plan-only mode: skipping apply"
        elif [ $plan_exit_code -eq 2 ]; then
            terraform_apply "$environment" "$auto_approve"
            terraform_outputs "$environment"
        fi
    fi
}

# Parse command line arguments
ENVIRONMENT=""
PLAN_ONLY=false
DESTROY=false
AUTO_APPROVE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--plan-only)
            PLAN_ONLY=true
            shift
            ;;
        -d|--destroy)
            DESTROY=true
            shift
            ;;
        -a|--auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        -*)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
        *)
            if [ -z "$ENVIRONMENT" ]; then
                ENVIRONMENT=$1
            else
                log_error "Multiple environments specified"
                usage
                exit 1
            fi
            shift
            ;;
    esac
done

if [ -z "$ENVIRONMENT" ]; then
    log_error "Environment argument is required"
    usage
    exit 1
fi

# Execute deployment
deploy "$ENVIRONMENT" "$PLAN_ONLY" "$DESTROY" "$AUTO_APPROVE" "$VERBOSE"
```

### State Management Script
```bash
#!/bin/bash
# terraform/scripts/manage-state.sh

set -euo pipefail

# Configuration
TERRAFORM_BUCKET="liminal-transit-terraform-state"
TERRAFORM_LOCK_TABLE="liminal-transit-terraform-locks"
AWS_REGION="us-east-1"

# Setup Terraform backend resources
setup_backend() {
    echo "🏗️  Setting up Terraform backend resources..."
    
    # Create S3 bucket for state
    aws s3api create-bucket \
        --bucket "$TERRAFORM_BUCKET" \
        --region "$AWS_REGION" || true
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "$TERRAFORM_BUCKET" \
        --versioning-configuration Status=Enabled
    
    # Enable encryption
    aws s3api put-bucket-encryption \
        --bucket "$TERRAFORM_BUCKET" \
        --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'
    
    # Block public access
    aws s3api put-public-access-block \
        --bucket "$TERRAFORM_BUCKET" \
        --public-access-block-configuration \
            BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
    
    # Create DynamoDB table for locking
    aws dynamodb create-table \
        --table-name "$TERRAFORM_LOCK_TABLE" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$AWS_REGION" || true
    
    echo "✅ Terraform backend resources ready"
}

# Import existing resources
import_resources() {
    local environment=$1
    local resource_type=$2
    local resource_id=$3
    local terraform_address=$4
    
    echo "📥 Importing $resource_type: $resource_id"
    
    cd "environments/$environment"
    terraform import "$terraform_address" "$resource_id"
    
    echo "✅ Resource imported successfully"
}

# Backup state files
backup_state() {
    local environment=$1
    local backup_suffix=$(date +%Y%m%d_%H%M%S)
    
    echo "💾 Backing up state for $environment..."
    
    aws s3 cp \
        "s3://$TERRAFORM_BUCKET/$environment/terraform.tfstate" \
        "s3://$TERRAFORM_BUCKET/backups/$environment/terraform.tfstate.$backup_suffix"
    
    echo "✅ State backed up with suffix: $backup_suffix"
}

# Restore state from backup
restore_state() {
    local environment=$1
    local backup_suffix=$2
    
    echo "🔄 Restoring state for $environment from backup: $backup_suffix"
    
    aws s3 cp \
        "s3://$TERRAFORM_BUCKET/backups/$environment/terraform.tfstate.$backup_suffix" \
        "s3://$TERRAFORM_BUCKET/$environment/terraform.tfstate"
    
    echo "✅ State restored successfully"
}

case "$1" in
    setup)
        setup_backend
        ;;
    import)
        import_resources "$2" "$3" "$4" "$5"
        ;;
    backup)
        backup_state "$2"
        ;;
    restore)
        restore_state "$2" "$3"
        ;;
    *)
        echo "Usage: $0 {setup|import|backup|restore}"
        exit 1
        ;;
esac
```

---

## 📊 **Cost Optimization Patterns**

### Intelligent Resource Sizing
```hcl
# terraform/modules/cost-optimization/main.tf

# Lambda cost optimization
resource "aws_lambda_function" "cost_optimizer" {
  filename      = "cost_optimizer.zip"
  function_name = "${var.environment}-cost-optimizer"
  role         = aws_iam_role.cost_optimizer.arn
  handler      = "index.handler"
  runtime      = "python3.11"
  
  # Dynamic memory sizing based on environment
  memory_size = var.environment == "production" ? 1024 : 512
  timeout     = var.environment == "production" ? 900 : 300
  
  # Reserved concurrency for production
  reserved_concurrent_executions = var.environment == "production" ? 10 : null

  environment {
    variables = {
      ENVIRONMENT = var.environment
      COST_BUDGET = var.monthly_budget
    }
  }

  tags = var.tags
}

# DynamoDB auto-scaling
resource "aws_appautoscaling_target" "dynamodb_read" {
  max_capacity       = var.environment == "production" ? 100 : 25
  min_capacity       = var.environment == "production" ? 5 : 1
  resource_id        = "table/${aws_dynamodb_table.main.name}"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "dynamodb_read" {
  name               = "${var.environment}-read-scaling-policy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.dynamodb_read.resource_id
  scalable_dimension = aws_appautoscaling_target.dynamodb_read.scalable_dimension
  service_namespace  = aws_appautoscaling_target.dynamodb_read.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBReadCapacityUtilization"
    }
    target_value = 70.0
  }
}

# S3 intelligent tiering
resource "aws_s3_bucket_intelligent_tiering_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  name   = "EntireBucket"

  status = "Enabled"

  optional_fields = ["BucketKeyStatus", "AccessControlList"]
}

# CloudWatch cost anomaly detection
resource "aws_ce_anomaly_detector" "service_monitor" {
  name = "${var.environment}-service-cost-anomaly"
  
  monitor_specification {
    dimension_key = "SERVICE"
    match_options = ["EQUALS"]
    values        = ["Lambda", "DynamoDB", "S3"]
  }
}

resource "aws_ce_anomaly_subscription" "cost_alerts" {
  name      = "${var.environment}-cost-anomaly-alerts"
  frequency = "DAILY"
  
  monitor_arn_list = [
    aws_ce_anomaly_detector.service_monitor.arn,
  ]
  
  subscriber {
    type    = "EMAIL"
    address = var.cost_alert_email
  }

  threshold_expression {
    and {
      dimension {
        key           = "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
        values        = ["100"]
        match_options = ["GREATER_THAN_OR_EQUAL"]
      }
    }
  }
}
```

---

This comprehensive Infrastructure as Code framework provides enterprise-grade Terraform patterns with AWS Well-Architected principles, automated deployment pipelines, multi-environment management, and intelligent cost optimization for the AI Native Liminal Transit platform.
