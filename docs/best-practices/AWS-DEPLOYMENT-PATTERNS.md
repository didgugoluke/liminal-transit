# AWS Deployment Patterns for AI Native Applications

## Overview

Enterprise-grade AWS deployment patterns that implement the Well-Architected Framework with serverless-first architecture, automated compliance, and AI-optimized infrastructure for the Liminal Transit platform.

---

## Serverless-First Architecture

### 1. **Event-Driven Serverless Pattern**

```yaml
# Infrastructure as Code - Terraform Configuration
# serverless-ai-platform.tf

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "liminal-transit"
      Environment = var.environment
      ManagedBy   = "terraform"
      CostCenter  = "ai-native-development"
      Compliance  = "well-architected"
    }
  }
}

# DynamoDB for Story Persistence
resource "aws_dynamodb_table" "story_sessions" {
  name           = "liminal-transit-story-sessions-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"  # Cost-optimized
  hash_key       = "session_id"
  range_key      = "timestamp"
  
  attribute {
    name = "session_id"
    type = "S"
  }
  
  attribute {
    name = "timestamp"
    type = "N"
  }
  
  attribute {
    name = "user_id"
    type = "S"
  }
  
  global_secondary_index {
    name     = "UserStoryIndex"
    hash_key = "user_id"
    range_key = "timestamp"
    projection_type = "ALL"
  }
  
  # Point-in-time recovery for data protection
  point_in_time_recovery {
    enabled = true
  }
  
  # Encryption at rest
  server_side_encryption {
    enabled     = true
    kms_key_id  = aws_kms_key.dynamodb_key.arn
  }
  
  # TTL for automatic cleanup of old sessions
  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }
  
  tags = {
    Name = "Story Sessions Table"
    DataClassification = "internal"
  }
}

# Lambda Function for AI Story Generation
resource "aws_lambda_function" "story_generator" {
  filename         = "../lambda/story-generator.zip"
  function_name    = "liminal-transit-story-generator-${var.environment}"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 1024
  
  # Environment variables
  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.story_sessions.name
      BEDROCK_REGION = var.aws_region
      AI_PROVIDER_ENDPOINT = var.ai_provider_endpoint
      ENVIRONMENT = var.environment
    }
  }
  
  # VPC configuration for security
  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [aws_security_group.lambda_sg.id]
  }
  
  # Dead letter queue for error handling
  dead_letter_config {
    target_arn = aws_sqs_queue.dlq.arn
  }
  
  # Reserved concurrency for cost control
  reserved_concurrent_executions = 100
  
  tags = {
    Name = "AI Story Generator"
    Function = "story-generation"
  }
}

# API Gateway for RESTful API
resource "aws_api_gateway_rest_api" "story_api" {
  name        = "liminal-transit-api-${var.environment}"
  description = "AI Native Story Generation API"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
  
  # API policy for security
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = "execute-api:Invoke"
        Resource = "*"
        Condition = {
          StringEquals = {
            "aws:SourceVpce" = var.vpc_endpoint_id
          }
        }
      }
    ]
  })
}

# EventBridge for Event-Driven Architecture
resource "aws_cloudwatch_event_rule" "story_events" {
  name        = "liminal-transit-story-events-${var.environment}"
  description = "Story generation and processing events"
  
  event_pattern = jsonencode({
    source      = ["liminal-transit"]
    detail-type = [
      "Story Generation Requested",
      "Story Beat Generated", 
      "User Choice Made",
      "Story Completed"
    ]
  })
}

# EventBridge target to Lambda
resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.story_events.name
  target_id = "StoryGeneratorTarget"
  arn       = aws_lambda_function.story_generator.arn
}
```

### 2. **AI Provider Integration Pattern**

```typescript
// lambda/story-generator/src/ai-providers.ts

interface AIProviderConfig {
  name: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
  costPerToken: number;
  priority: number;
}

class AIProviderManager {
  private providers: AIProviderConfig[] = [
    {
      name: 'aws-bedrock',
      endpoint: process.env.BEDROCK_ENDPOINT!,
      model: 'anthropic.claude-3-sonnet-20240229-v1:0',
      maxTokens: 4096,
      temperature: 0.7,
      costPerToken: 0.003,
      priority: 1
    },
    {
      name: 'openai',
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4',
      maxTokens: 4096,
      temperature: 0.7,
      costPerToken: 0.03,
      priority: 2
    },
    {
      name: 'anthropic',
      endpoint: 'https://api.anthropic.com/v1',
      model: 'claude-3-haiku-20240307',
      maxTokens: 4096,
      temperature: 0.7,
      costPerToken: 0.00025,
      priority: 3
    }
  ];

  async generateStory(prompt: string, context: StoryContext): Promise<StoryGeneration> {
    const sortedProviders = this.providers.sort((a, b) => a.priority - b.priority);
    
    for (const provider of sortedProviders) {
      try {
        const startTime = Date.now();
        const result = await this.callProvider(provider, prompt, context);
        const endTime = Date.now();
        
        // Log metrics for cost and performance tracking
        await this.logProviderMetrics({
          provider: provider.name,
          responseTime: endTime - startTime,
          tokenCount: result.tokenCount,
          cost: result.tokenCount * provider.costPerToken,
          success: true
        });
        
        return result;
        
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error);
        
        await this.logProviderMetrics({
          provider: provider.name,
          responseTime: 0,
          tokenCount: 0,
          cost: 0,
          success: false,
          error: error.message
        });
        
        // Continue to next provider
        continue;
      }
    }
    
    throw new Error('All AI providers failed');
  }

  private async callProvider(
    provider: AIProviderConfig, 
    prompt: string, 
    context: StoryContext
  ): Promise<StoryGeneration> {
    switch (provider.name) {
      case 'aws-bedrock':
        return this.callBedrock(provider, prompt, context);
      case 'openai':
        return this.callOpenAI(provider, prompt, context);
      case 'anthropic':
        return this.callAnthropic(provider, prompt, context);
      default:
        throw new Error(`Unknown provider: ${provider.name}`);
    }
  }

  private async logProviderMetrics(metrics: ProviderMetrics): Promise<void> {
    // Send metrics to CloudWatch for monitoring and cost tracking
    const cloudwatch = new AWS.CloudWatch();
    
    await cloudwatch.putMetricData({
      Namespace: 'LiminalTransit/AIProviders',
      MetricData: [
        {
          MetricName: 'ResponseTime',
          Dimensions: [
            { Name: 'Provider', Value: metrics.provider },
            { Name: 'Environment', Value: process.env.ENVIRONMENT! }
          ],
          Unit: 'Milliseconds',
          Value: metrics.responseTime
        },
        {
          MetricName: 'TokenCount',
          Dimensions: [
            { Name: 'Provider', Value: metrics.provider }
          ],
          Unit: 'Count',
          Value: metrics.tokenCount
        },
        {
          MetricName: 'Cost',
          Dimensions: [
            { Name: 'Provider', Value: metrics.provider }
          ],
          Unit: 'None',
          Value: metrics.cost
        }
      ]
    }).promise();
  }
}
```

---

## Infrastructure Deployment Patterns

### 1. **Multi-Environment Strategy**

```hcl
# environments/dev/main.tf
module "liminal_transit_dev" {
  source = "../../modules/liminal-transit"
  
  environment = "dev"
  aws_region  = "us-east-1"
  
  # Development-specific configuration
  lambda_memory_size = 512
  dynamodb_billing_mode = "PAY_PER_REQUEST"
  api_gateway_stage = "dev"
  
  # Reduced security for development
  enable_waf = false
  enable_vpc = false
  
  # Cost optimization for development
  cloudwatch_log_retention = 7  # days
  
  tags = {
    Environment = "development"
    CostCenter  = "development"
  }
}

# environments/staging/main.tf
module "liminal_transit_staging" {
  source = "../../modules/liminal-transit"
  
  environment = "staging"
  aws_region  = "us-east-1"
  
  # Production-like configuration
  lambda_memory_size = 1024
  dynamodb_billing_mode = "PAY_PER_REQUEST"
  api_gateway_stage = "staging"
  
  # Enhanced security for staging
  enable_waf = true
  enable_vpc = true
  
  # Extended retention for staging
  cloudwatch_log_retention = 30  # days
  
  tags = {
    Environment = "staging"
    CostCenter  = "pre-production"
  }
}

# environments/production/main.tf
module "liminal_transit_production" {
  source = "../../modules/liminal-transit"
  
  environment = "production"
  aws_region  = "us-east-1"
  
  # Production configuration
  lambda_memory_size = 1024
  dynamodb_billing_mode = "PAY_PER_REQUEST"
  api_gateway_stage = "prod"
  
  # Maximum security for production
  enable_waf = true
  enable_vpc = true
  enable_encryption = true
  enable_monitoring = true
  
  # Long-term retention for production
  cloudwatch_log_retention = 365  # days
  
  # Production scaling
  lambda_reserved_concurrency = 1000
  api_gateway_throttle_rate = 2000
  api_gateway_throttle_burst = 5000
  
  tags = {
    Environment = "production"
    CostCenter  = "production"
    Compliance  = "required"
  }
}
```

### 2. **Blue-Green Deployment Pattern**

```yaml
# .github/workflows/deploy.yml
name: Blue-Green Deployment

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  
jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        
      - name: Build Lambda packages
        run: |
          cd lambda
          npm ci
          npm run build
          npm run package
          
      - name: Deploy Blue Environment
        run: |
          cd infrastructure/terraform/environments/production
          terraform init
          terraform plan -var="deployment_color=blue"
          terraform apply -auto-approve -var="deployment_color=blue"
          
      - name: Health Check Blue Environment
        run: |
          ./scripts/health-check.sh blue
          
      - name: Switch Traffic to Blue
        run: |
          aws apigateway update-stage \
            --rest-api-id ${{ env.API_GATEWAY_ID }} \
            --stage-name prod \
            --patch-ops op=replace,path=/variables/deployment,value=blue
            
      - name: Verify Blue Deployment
        run: |
          ./scripts/integration-tests.sh
          
      - name: Cleanup Green Environment
        run: |
          cd infrastructure/terraform/environments/production
          terraform destroy -auto-approve -var="deployment_color=green"
```

### 3. **Auto-Scaling Pattern**

```hcl
# Auto-scaling configuration for Lambda
resource "aws_lambda_provisioned_concurrency_config" "story_generator" {
  count                     = var.environment == "production" ? 1 : 0
  function_name            = aws_lambda_function.story_generator.function_name
  provisioned_concurrency_units = 10
  qualifier                = aws_lambda_alias.story_generator.name
}

# Application Auto Scaling for DynamoDB
resource "aws_appautoscaling_target" "dynamodb_table_read_target" {
  count              = var.enable_autoscaling ? 1 : 0
  max_capacity       = 4000
  min_capacity       = 5
  resource_id        = "table/${aws_dynamodb_table.story_sessions.name}"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "dynamodb_table_read_policy" {
  count              = var.enable_autoscaling ? 1 : 0
  name               = "DynamoDBReadCapacityUtilization:${aws_appautoscaling_target.dynamodb_table_read_target[0].resource_id}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.dynamodb_table_read_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.dynamodb_table_read_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.dynamodb_table_read_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBReadCapacityUtilization"
    }
    target_value = 70.0
  }
}

# CloudWatch Alarms for Auto-scaling triggers
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "liminal-transit-lambda-duration-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "120"
  statistic           = "Average"
  threshold           = "25000"  # 25 seconds
  alarm_description   = "This metric monitors lambda duration"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = aws_lambda_function.story_generator.function_name
  }
}
```

---

## Security and Compliance Patterns

### 1. **Defense in Depth Security**

```hcl
# WAF for API Gateway protection
resource "aws_wafv2_web_acl" "api_protection" {
  count = var.enable_waf ? 1 : 0
  name  = "liminal-transit-waf-${var.environment}"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  # Rate limiting rule
  rule {
    name     = "RateLimitRule"
    priority = 1

    override_action {
      none {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "RateLimitRule"
      sampled_requests_enabled    = true
    }

    action {
      block {}
    }
  }

  # AWS Managed Rules for common attacks
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "CommonRuleSetMetric"
      sampled_requests_enabled    = true
    }
  }
}

# KMS Key for encryption
resource "aws_kms_key" "main" {
  description             = "KMS key for Liminal Transit ${var.environment}"
  deletion_window_in_days = var.environment == "production" ? 30 : 7
  enable_key_rotation     = true

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
      }
    ]
  })

  tags = {
    Name = "liminal-transit-key-${var.environment}"
  }
}

# VPC for network isolation
resource "aws_vpc" "main" {
  count                = var.enable_vpc ? 1 : 0
  cidr_block          = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "liminal-transit-vpc-${var.environment}"
  }
}

# Private subnets for Lambda functions
resource "aws_subnet" "private" {
  count             = var.enable_vpc ? 2 : 0
  vpc_id            = aws_vpc.main[0].id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "liminal-transit-private-${count.index + 1}-${var.environment}"
    Type = "private"
  }
}

# Security groups
resource "aws_security_group" "lambda_sg" {
  count       = var.enable_vpc ? 1 : 0
  name_prefix = "liminal-transit-lambda-${var.environment}"
  vpc_id      = aws_vpc.main[0].id

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS outbound for API calls"
  }

  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP outbound"
  }

  tags = {
    Name = "liminal-transit-lambda-sg-${var.environment}"
  }
}
```

### 2. **IAM Least Privilege Pattern**

```hcl
# Lambda execution role with minimal permissions
resource "aws_iam_role" "lambda_execution_role" {
  name = "liminal-transit-lambda-role-${var.environment}"

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

# Lambda execution policy
resource "aws_iam_role_policy" "lambda_execution_policy" {
  name = "liminal-transit-lambda-policy-${var.environment}"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/liminal-transit-*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.story_sessions.arn,
          "${aws_dynamodb_table.story_sessions.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/anthropic.claude-*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "LiminalTransit/AIProviders"
          }
        }
      }
    ]
  })
}
```

---

## Monitoring and Observability Patterns

### 1. **Comprehensive Monitoring Stack**

```hcl
# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "LiminalTransit-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.story_generator.function_name],
            [".", "Errors", ".", "."],
            [".", "Invocations", ".", "."],
            [".", "Throttles", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Lambda Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", aws_dynamodb_table.story_sessions.name],
            [".", "ConsumedWriteCapacityUnits", ".", "."],
            [".", "ThrottledRequests", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "DynamoDB Metrics"
          period  = 300
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 12
        width  = 24
        height = 6

        properties = {
          query   = "SOURCE '/aws/lambda/${aws_lambda_function.story_generator.function_name}' | fields @timestamp, @message | sort @timestamp desc | limit 100"
          region  = var.aws_region
          title   = "Recent Lambda Logs"
        }
      }
    ]
  })
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "liminal-transit-lambda-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors lambda errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = aws_lambda_function.story_generator.function_name
  }
}

resource "aws_cloudwatch_metric_alarm" "dynamodb_throttles" {
  alarm_name          = "liminal-transit-dynamodb-throttles-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ThrottledRequests"
  namespace           = "AWS/DynamoDB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "This metric monitors DynamoDB throttles"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    TableName = aws_dynamodb_table.story_sessions.name
  }
}

# SNS Topic for alerts
resource "aws_sns_topic" "alerts" {
  name = "liminal-transit-alerts-${var.environment}"
  
  kms_master_key_id = aws_kms_key.main.id
}

# X-Ray tracing for distributed tracing
resource "aws_lambda_function" "story_generator" {
  # ... other configuration ...
  
  tracing_config {
    mode = "Active"
  }
}
```

### 2. **Custom Metrics for AI Operations**

```typescript
// lambda/shared/monitoring.ts

export class AIMonitoring {
  private cloudwatch: AWS.CloudWatch;
  
  constructor() {
    this.cloudwatch = new AWS.CloudWatch();
  }

  async recordStoryGeneration(metrics: {
    provider: string;
    responseTime: number;
    tokenCount: number;
    cost: number;
    qualityScore: number;
    success: boolean;
  }): Promise<void> {
    const metricData: AWS.CloudWatch.PutMetricDataInput = {
      Namespace: 'LiminalTransit/StoryGeneration',
      MetricData: [
        {
          MetricName: 'ResponseTime',
          Dimensions: [
            { Name: 'Provider', Value: metrics.provider },
            { Name: 'Environment', Value: process.env.ENVIRONMENT! }
          ],
          Unit: 'Milliseconds',
          Value: metrics.responseTime,
          Timestamp: new Date()
        },
        {
          MetricName: 'TokensGenerated',
          Dimensions: [{ Name: 'Provider', Value: metrics.provider }],
          Unit: 'Count',
          Value: metrics.tokenCount,
          Timestamp: new Date()
        },
        {
          MetricName: 'GenerationCost',
          Dimensions: [{ Name: 'Provider', Value: metrics.provider }],
          Unit: 'None',
          Value: metrics.cost,
          Timestamp: new Date()
        },
        {
          MetricName: 'QualityScore',
          Dimensions: [{ Name: 'Provider', Value: metrics.provider }],
          Unit: 'Percent',
          Value: metrics.qualityScore,
          Timestamp: new Date()
        },
        {
          MetricName: 'SuccessRate',
          Dimensions: [{ Name: 'Provider', Value: metrics.provider }],
          Unit: 'Percent',
          Value: metrics.success ? 100 : 0,
          Timestamp: new Date()
        }
      ]
    };

    try {
      await this.cloudwatch.putMetricData(metricData).promise();
    } catch (error) {
      console.error('Failed to send metrics to CloudWatch:', error);
    }
  }

  async recordUserEngagement(metrics: {
    sessionId: string;
    storyLength: number;
    completionRate: number;
    averageResponseTime: number;
  }): Promise<void> {
    const metricData: AWS.CloudWatch.PutMetricDataInput = {
      Namespace: 'LiminalTransit/UserEngagement',
      MetricData: [
        {
          MetricName: 'StoryLength',
          Unit: 'Count',
          Value: metrics.storyLength,
          Timestamp: new Date()
        },
        {
          MetricName: 'CompletionRate',
          Unit: 'Percent',
          Value: metrics.completionRate,
          Timestamp: new Date()
        },
        {
          MetricName: 'AverageResponseTime',
          Unit: 'Milliseconds',
          Value: metrics.averageResponseTime,
          Timestamp: new Date()
        }
      ]
    };

    try {
      await this.cloudwatch.putMetricData(metricData).promise();
    } catch (error) {
      console.error('Failed to send engagement metrics:', error);
    }
  }
}
```

---

## Cost Optimization Patterns

### 1. **Intelligent Resource Sizing**

```hcl
# Lambda cost optimization with provisioned concurrency
resource "aws_lambda_provisioned_concurrency_config" "story_generator" {
  count                     = var.environment == "production" ? 1 : 0
  function_name            = aws_lambda_function.story_generator.function_name
  provisioned_concurrency_units = var.lambda_provisioned_concurrency
  qualifier                = aws_lambda_alias.story_generator.name
  
  # Scheduled scaling for predictable load patterns
  lifecycle {
    ignore_changes = [provisioned_concurrency_units]
  }
}

# Application Auto Scaling for Lambda provisioned concurrency
resource "aws_appautoscaling_target" "lambda_target" {
  count              = var.environment == "production" ? 1 : 0
  max_capacity       = 100
  min_capacity       = 10
  resource_id        = "function:${aws_lambda_function.story_generator.function_name}:provisioned"
  scalable_dimension = "lambda:function:ProvisionedConcurrency"
  service_namespace  = "lambda"
}

# DynamoDB on-demand billing for cost optimization
resource "aws_dynamodb_table" "story_sessions" {
  # ... other configuration ...
  
  billing_mode = "PAY_PER_REQUEST"  # Cost-effective for variable workloads
  
  # Global tables for multi-region with cost considerations
  dynamic "replica" {
    for_each = var.environment == "production" ? var.replica_regions : []
    content {
      region_name = replica.value
      point_in_time_recovery = true
    }
  }
}
```

### 2. **Automated Cost Monitoring**

```hcl
# Cost anomaly detection
resource "aws_ce_anomaly_detector" "service_monitor" {
  name         = "liminal-transit-cost-anomaly-${var.environment}"
  monitor_type = "DIMENSIONAL"

  specification = jsonencode({
    Dimension = "SERVICE"
    MatchOptions = ["EQUALS"]
    Values = ["Amazon DynamoDB", "AWS Lambda", "Amazon API Gateway"]
  })
}

resource "aws_ce_anomaly_subscription" "cost_alerts" {
  name      = "liminal-transit-cost-alerts-${var.environment}"
  frequency = "DAILY"
  
  monitor_arn_list = [
    aws_ce_anomaly_detector.service_monitor.arn
  ]
  
  subscriber {
    type    = "EMAIL"
    address = var.cost_alert_email
  }
  
  threshold_expression {
    and {
      dimension {
        key           = "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
        values        = ["100"]  # Alert for anomalies over $100
        match_options = ["GREATER_THAN_OR_EQUAL"]
      }
    }
  }
}

# Budget alerts
resource "aws_budgets_budget" "liminal_transit_budget" {
  name       = "liminal-transit-budget-${var.environment}"
  budget_type = "COST"
  limit_amount = var.monthly_budget_limit
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  
  cost_filters = {
    Service = [
      "Amazon DynamoDB",
      "AWS Lambda", 
      "Amazon API Gateway",
      "Amazon Bedrock"
    ]
    Tag = {
      Project = ["liminal-transit"]
    }
  }
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 80  # Alert at 80% of budget
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.cost_alert_email]
  }
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 100  # Alert at 100% of budget
    threshold_type            = "PERCENTAGE" 
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.cost_alert_email]
  }
}
```

---

## Disaster Recovery Patterns

### 1. **Multi-Region Backup Strategy**

```hcl
# Cross-region backup for DynamoDB
resource "aws_dynamodb_table" "story_sessions_backup" {
  count          = var.enable_cross_region_backup ? 1 : 0
  provider       = aws.backup_region
  name           = "liminal-transit-story-sessions-backup-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "session_id"
  range_key      = "timestamp"
  
  # Same schema as primary table
  attribute {
    name = "session_id"
    type = "S"
  }
  
  attribute {
    name = "timestamp"
    type = "N"
  }
  
  # Point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }
  
  tags = {
    Name = "Story Sessions Backup Table"
    Purpose = "disaster-recovery"
  }
}

# Lambda backup in secondary region
resource "aws_lambda_function" "story_generator_backup" {
  count            = var.enable_cross_region_backup ? 1 : 0
  provider         = aws.backup_region
  filename         = "../lambda/story-generator.zip"
  function_name    = "liminal-transit-story-generator-backup-${var.environment}"
  role            = aws_iam_role.lambda_execution_role_backup[0].arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 1024
  
  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.story_sessions_backup[0].name
      BEDROCK_REGION = var.backup_region
      ENVIRONMENT = var.environment
      IS_BACKUP_REGION = "true"
    }
  }
}

# Route 53 health checks and failover
resource "aws_route53_health_check" "api_health" {
  count                           = var.enable_cross_region_backup ? 1 : 0
  fqdn                           = "${aws_api_gateway_rest_api.story_api.id}.execute-api.${var.aws_region}.amazonaws.com"
  port                           = 443
  type                           = "HTTPS"
  resource_path                  = "/health"
  failure_threshold              = "3"
  request_interval               = "30"
  cloudwatch_alarm_region        = var.aws_region
  cloudwatch_alarm_name          = aws_cloudwatch_metric_alarm.api_health[0].alarm_name
}

resource "aws_route53_record" "api_primary" {
  count   = var.enable_cross_region_backup ? 1 : 0
  zone_id = var.route53_zone_id
  name    = "api.liminal-transit.com"
  type    = "CNAME"
  ttl     = "60"
  
  set_identifier = "primary"
  
  failover_routing_policy {
    type = "PRIMARY"
  }
  
  health_check_id = aws_route53_health_check.api_health[0].id
  records         = ["${aws_api_gateway_rest_api.story_api.id}.execute-api.${var.aws_region}.amazonaws.com"]
}

resource "aws_route53_record" "api_secondary" {
  count   = var.enable_cross_region_backup ? 1 : 0
  zone_id = var.route53_zone_id
  name    = "api.liminal-transit.com"
  type    = "CNAME"
  ttl     = "60"
  
  set_identifier = "secondary"
  
  failover_routing_policy {
    type = "SECONDARY"
  }
  
  records = ["${aws_api_gateway_rest_api.story_api_backup[0].id}.execute-api.${var.backup_region}.amazonaws.com"]
}
```

### 2. **Automated Backup and Recovery**

```yaml
# .github/workflows/backup.yml
name: Automated Backup and Recovery Testing

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  backup-verification:
    runs-on: ubuntu-latest
    
    steps:
      - name: Verify DynamoDB Backup
        run: |
          aws dynamodb describe-continuous-backups \
            --table-name liminal-transit-story-sessions-production
            
      - name: Test Backup Restore Process
        run: |
          # Create test restore to verify backup integrity
          aws dynamodb restore-table-from-backup \
            --target-table-name test-restore-$(date +%s) \
            --backup-arn $(aws dynamodb list-backups \
              --table-name liminal-transit-story-sessions-production \
              --query 'BackupSummaries[0].BackupArn' --output text)
              
      - name: Cleanup Test Resources
        run: |
          # Clean up test restore table
          aws dynamodb delete-table \
            --table-name test-restore-$(date +%s)
            
      - name: Verify Cross-Region Replication
        run: |
          # Check that backup region is in sync
          aws dynamodb describe-table \
            --table-name liminal-transit-story-sessions-backup-production \
            --region us-west-2
```

---

These AWS deployment patterns provide a comprehensive foundation for enterprise-grade, serverless AI Native applications with automated compliance, cost optimization, and disaster recovery capabilities built into the infrastructure from day one.
