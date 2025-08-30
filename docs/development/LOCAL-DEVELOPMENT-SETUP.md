# Local Development Setup

## Overview

Comprehensive local development environment for the AI Native Liminal Transit platform, featuring Docker containerization, reverse proxy CORS solutions, automated tooling, and streamlined dev/test workflows with one-liner commands for maximum developer productivity.

---

## 🚀 **Quick Start (One-Liner Setup)**

```bash
# Complete environment setup in one command
curl -fsSL https://raw.githubusercontent.com/your-org/story-time/main/scripts/setup-dev.sh | bash

# Alternative: Clone and setup
git clone https://github.com/your-org/story-time.git && cd story-time && ./scripts/setup-dev.sh
```

---

## 🛠 **Development Tools & Prerequisites**

### Essential Tools
```bash
# Install all development dependencies (macOS)
./scripts/install-dev-tools.sh

# Manual installation commands:
# Node.js (via nvm for version management)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20 && nvm use 20

# Docker Desktop
brew install --cask docker

# pnpm (preferred package manager)
npm install -g pnpm

# Development utilities
brew install jq curl httpie git-delta fzf
brew install --cask visual-studio-code

# AWS CLI for cloud integration
brew install awscli
aws configure sso # Setup AWS SSO for development

# Terraform for infrastructure
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

### Development Environment Verification
```bash
# Verify all tools are properly installed
./scripts/verify-dev-environment.sh

# Expected output:
# ✅ Node.js v20.x.x
# ✅ Docker v24.x.x  
# ✅ pnpm v8.x.x
# ✅ AWS CLI v2.x.x
# ✅ Terraform v1.x.x
# ✅ All development tools ready
```

---

## 🐳 **Docker Development Environment**

### Local Development Stack
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Main application with hot reload
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true
      - FAST_REFRESH=true
    command: pnpm dev
    depends_on:
      - reverse-proxy
      - redis
      - localstack

  # Reverse proxy for CORS and API routing
  reverse-proxy:
    image: nginx:alpine
    ports:
      - "8080:80"
      - "8443:443"
    volumes:
      - ./docker/nginx/dev.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl:/etc/ssl/certs:ro
    depends_on:
      - app
    environment:
      - NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
      - NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template

  # Redis for session storage and caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass devpassword

  # LocalStack for AWS services simulation
  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
      - "4571:4571"
    environment:
      - SERVICES=s3,dynamodb,lambda,apigateway,cognito-idp,ses
      - DEBUG=1
      - DATA_DIR=/tmp/localstack/data
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - localstack_data:/tmp/localstack
      - "/var/run/docker.sock:/var/run/docker.sock"
    privileged: true

  # Development database (PostgreSQL)
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=liminal_transit_dev
      - POSTGRES_USER=dev_user
      - POSTGRES_PASSWORD=dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql

  # Development tools container
  dev-tools:
    build:
      context: ./docker/dev-tools
    volumes:
      - .:/workspace
    command: tail -f /dev/null
    profiles:
      - tools

volumes:
  redis_data:
  localstack_data:
  postgres_data:
```

### CORS-Solving Reverse Proxy Configuration
```nginx
# docker/nginx/dev.conf
worker_processes auto;
error_log /var/log/nginx/error.log warn;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging format for development
    log_format dev_format '$remote_addr - $remote_user [$time_local] '
                         '"$request" $status $bytes_sent '
                         '"$http_referer" "$http_user_agent" '
                         'rt=$request_time uct="$upstream_connect_time" '
                         'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log dev_format;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # CORS headers for all responses
    map $http_origin $cors_origin_header {
        default "";
        "~^https?://localhost(:[0-9]+)?$" "$http_origin";
        "~^https?://127\.0\.0\.1(:[0-9]+)?$" "$http_origin";
        "~^https?://0\.0\.0\.0(:[0-9]+)?$" "$http_origin";
        "~^https?://.*\.ngrok\.io$" "$http_origin";
        "~^https?://.*\.vercel\.app$" "$http_origin";
    }

    # Upstream definitions
    upstream frontend {
        server app:3000;
        keepalive 32;
    }

    upstream api {
        server app:3000;
        keepalive 32;
    }

    upstream localstack {
        server localstack:4566;
        keepalive 16;
    }

    # Main server block
    server {
        listen 80;
        listen 443 ssl http2;
        server_name localhost dev.liminal-transit.local;

        # SSL configuration for HTTPS development
        ssl_certificate /etc/ssl/certs/dev.crt;
        ssl_certificate_key /etc/ssl/certs/dev.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # CORS headers
        add_header Access-Control-Allow-Origin $cors_origin_header always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-API-Key,X-Session-ID" always;
        add_header Access-Control-Expose-Headers "Content-Length,Content-Range,X-Total-Count" always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Max-Age 86400 always;

        # Handle preflight requests
        location ~ ^/api/ {
            if ($request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin $cors_origin_header;
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH";
                add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-API-Key,X-Session-ID";
                add_header Access-Control-Max-Age 86400;
                add_header Content-Length 0;
                add_header Content-Type text/plain;
                return 204;
            }

            # Proxy API requests to backend
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 10s;
        }

        # LocalStack proxy for AWS services
        location ~ ^/localstack/ {
            rewrite ^/localstack/(.*) /$1 break;
            proxy_pass http://localstack;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket support for hot reload
        location /sockjs-node {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Next.js hot reload
        location /_next/webpack-hmr {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Static assets with caching
        location ~ ^/(images|css|js|fonts)/ {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Main application
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 10s;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## ⚡ **One-Liner Development Commands**

### Environment Management
```bash
# Start complete development environment
npm run dev:start
# Equivalent to: docker-compose -f docker-compose.dev.yml up -d

# Stop development environment
npm run dev:stop
# Equivalent to: docker-compose -f docker-compose.dev.yml down

# Restart with clean slate
npm run dev:reset
# Equivalent to: docker-compose down -v && docker-compose up -d --build

# View logs in real-time
npm run dev:logs
# Equivalent to: docker-compose logs -f

# Shell into main container
npm run dev:shell
# Equivalent to: docker-compose exec app sh
```

### Development Workflow
```bash
# Install dependencies and setup
npm run setup
# Equivalent to: pnpm install && ./scripts/setup-local-env.sh

# Run tests with watch mode
npm run test:watch
# Equivalent to: pnpm test --watch --coverage

# Run linting and formatting
npm run lint:fix
# Equivalent to: pnpm eslint . --fix && pnpm prettier --write .

# Type checking
npm run type:check
# Equivalent to: pnpm tsc --noEmit

# Build and test production bundle
npm run build:test
# Equivalent to: pnpm build && pnpm start:prod

# Generate and view bundle analysis
npm run analyze
# Equivalent to: ANALYZE=true pnpm build && open .next/analyze/index.html
```

### Database Operations
```bash
# Reset development database
npm run db:reset
# Equivalent to: docker-compose exec postgres psql -U dev_user -c "DROP DATABASE IF EXISTS liminal_transit_dev; CREATE DATABASE liminal_transit_dev;"

# Run database migrations
npm run db:migrate
# Equivalent to: pnpm prisma migrate dev

# Seed development data
npm run db:seed
# Equivalent to: pnpm prisma db seed

# Database console
npm run db:console
# Equivalent to: docker-compose exec postgres psql -U dev_user liminal_transit_dev
```

### AWS LocalStack Operations
```bash
# Setup LocalStack services
npm run aws:setup
# Equivalent to: ./scripts/setup-localstack.sh

# Create S3 buckets for development
npm run aws:buckets
# Equivalent to: aws --endpoint-url=http://localhost:4566 s3 mb s3://dev-stories s3://dev-assets

# DynamoDB table creation
npm run aws:tables
# Equivalent to: ./scripts/create-dynamodb-tables.sh

# View LocalStack dashboard
npm run aws:dashboard
# Equivalent to: open http://localhost:4566/_localstack/health
```

### AI Development Tools
```bash
# Start AI development server with all providers
npm run ai:dev
# Equivalent to: AI_PROVIDERS=all pnpm dev

# Test AI integrations
npm run ai:test
# Equivalent to: pnpm test src/lib/ai-engine.test.ts --watch

# Generate test stories
npm run ai:stories
# Equivalent to: node scripts/generate-test-stories.js

# AI performance benchmarks
npm run ai:benchmark
# Equivalent to: node scripts/ai-performance-benchmark.js
```

---

## 🔧 **Development Scripts**

### Main Setup Script
```bash
#!/bin/bash
# scripts/setup-dev.sh

set -euo pipefail

echo "🚀 Setting up Liminal Transit development environment..."

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required"; exit 1; }
    command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required"; exit 1; }
    command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required"; exit 1; }
    
    echo "✅ Prerequisites met"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    pnpm install
    echo "✅ Dependencies installed"
}

# Setup environment files
setup_environment() {
    echo "🔧 Setting up environment files..."
    
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
        echo "📝 Created .env.local from template"
    fi
    
    if [ ! -f docker/.env ]; then
        cp docker/.env.example docker/.env
        echo "📝 Created docker environment file"
    fi
    
    echo "✅ Environment files ready"
}

# Generate SSL certificates for local HTTPS
generate_ssl_certs() {
    echo "🔐 Generating SSL certificates for local development..."
    
    mkdir -p docker/nginx/ssl
    
    if [ ! -f docker/nginx/ssl/dev.crt ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout docker/nginx/ssl/dev.key \
            -out docker/nginx/ssl/dev.crt \
            -subj "/C=US/ST=Dev/L=Local/O=LiminalTransit/CN=localhost"
        echo "✅ SSL certificates generated"
    else
        echo "✅ SSL certificates already exist"
    fi
}

# Setup git hooks
setup_git_hooks() {
    echo "🪝 Setting up git hooks..."
    
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
npm run lint:staged && npm run type:check
EOF
    
    chmod +x .git/hooks/pre-commit
    echo "✅ Git hooks configured"
}

# Build and start development environment
start_environment() {
    echo "🐳 Building and starting development environment..."
    
    docker-compose -f docker-compose.dev.yml build
    docker-compose -f docker-compose.dev.yml up -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    # Wait for application to be ready
    timeout 60 bash -c 'until curl -f http://localhost:8080/health; do sleep 2; done'
    
    echo "✅ Development environment ready!"
}

# Display completion message
show_completion() {
    echo ""
    echo "🎉 Development environment setup complete!"
    echo ""
    echo "📍 Your application is running at:"
    echo "   • Frontend: http://localhost:8080"
    echo "   • API: http://localhost:8080/api"
    echo "   • HTTPS: https://localhost:8443"
    echo ""
    echo "🛠 Available services:"
    echo "   • PostgreSQL: localhost:5432"
    echo "   • Redis: localhost:6379"
    echo "   • LocalStack: localhost:4566"
    echo ""
    echo "📚 Common commands:"
    echo "   • npm run dev:logs    - View application logs"
    echo "   • npm run dev:shell   - Shell into container"
    echo "   • npm run dev:stop    - Stop all services"
    echo "   • npm run dev:reset   - Reset environment"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    install_dependencies
    setup_environment
    generate_ssl_certs
    setup_git_hooks
    start_environment
    show_completion
}

main "$@"
```

### Environment Verification Script
```bash
#!/bin/bash
# scripts/verify-dev-environment.sh

set -euo pipefail

echo "🔍 Verifying development environment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check_tool() {
    local tool=$1
    local version_cmd=$2
    local expected_pattern=$3
    
    if command -v "$tool" >/dev/null 2>&1; then
        local version=$($version_cmd 2>&1)
        if [[ $version =~ $expected_pattern ]]; then
            echo -e "${GREEN}✅ $tool: $version${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  $tool: $version (unexpected version)${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ $tool: Not installed${NC}"
        return 1
    fi
}

# Check Node.js
check_tool "node" "node --version" "v2[0-9]\."

# Check pnpm
check_tool "pnpm" "pnpm --version" "[8-9]\."

# Check Docker
check_tool "docker" "docker --version" "Docker version 2[4-9]\."

# Check Docker Compose
check_tool "docker-compose" "docker-compose --version" "docker-compose version"

# Check AWS CLI
check_tool "aws" "aws --version" "aws-cli/2\."

# Check Terraform
check_tool "terraform" "terraform version" "Terraform v1\."

# Check environment files
echo ""
echo "📁 Checking environment files..."

check_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        return 1
    fi
}

check_file ".env.local"
check_file "docker/.env"
check_file "docker/nginx/ssl/dev.crt"
check_file "docker/nginx/ssl/dev.key"

# Check Docker services
echo ""
echo "🐳 Checking Docker services..."

if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Docker services running${NC}"
    docker-compose -f docker-compose.dev.yml ps
else
    echo -e "${YELLOW}⚠️  Docker services not running${NC}"
    echo "Run 'npm run dev:start' to start services"
fi

# Check application health
echo ""
echo "🏥 Checking application health..."

if curl -f http://localhost:8080/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Application healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Application not responding${NC}"
fi

echo ""
echo "🎯 Environment verification complete!"
```

### LocalStack Setup Script
```bash
#!/bin/bash
# scripts/setup-localstack.sh

set -euo pipefail

echo "☁️  Setting up LocalStack AWS services..."

# Wait for LocalStack to be ready
wait_for_localstack() {
    echo "⏳ Waiting for LocalStack to be ready..."
    timeout 60 bash -c 'until curl -f http://localhost:4566/_localstack/health; do sleep 2; done'
    echo "✅ LocalStack is ready"
}

# Create S3 buckets
create_s3_buckets() {
    echo "🪣 Creating S3 buckets..."
    
    local buckets=(
        "liminal-transit-dev-stories"
        "liminal-transit-dev-assets"
        "liminal-transit-dev-user-data"
        "liminal-transit-dev-telemetry"
    )
    
    for bucket in "${buckets[@]}"; do
        aws --endpoint-url=http://localhost:4566 s3 mb "s3://$bucket" || true
        echo "✅ Created bucket: $bucket"
    done
}

# Create DynamoDB tables
create_dynamodb_tables() {
    echo "📊 Creating DynamoDB tables..."
    
    # Users table
    aws --endpoint-url=http://localhost:4566 dynamodb create-table \
        --table-name Users \
        --attribute-definitions \
            AttributeName=userId,AttributeType=S \
        --key-schema \
            AttributeName=userId,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST || true
    
    # Stories table
    aws --endpoint-url=http://localhost:4566 dynamodb create-table \
        --table-name Stories \
        --attribute-definitions \
            AttributeName=storyId,AttributeType=S \
            AttributeName=userId,AttributeType=S \
        --key-schema \
            AttributeName=storyId,KeyType=HASH \
        --global-secondary-indexes \
            IndexName=UserIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL} \
        --billing-mode PAY_PER_REQUEST || true
    
    # AI Prompts table
    aws --endpoint-url=http://localhost:4566 dynamodb create-table \
        --table-name AIPrompts \
        --attribute-definitions \
            AttributeName=promptId,AttributeType=S \
            AttributeName=timestamp,AttributeType=N \
        --key-schema \
            AttributeName=promptId,KeyType=HASH \
        --global-secondary-indexes \
            IndexName=TimestampIndex,KeySchema=[{AttributeName=timestamp,KeyType=HASH}],Projection={ProjectionType=ALL} \
        --billing-mode PAY_PER_REQUEST || true
    
    echo "✅ DynamoDB tables created"
}

# Setup Cognito User Pool
create_cognito_resources() {
    echo "👤 Creating Cognito resources..."
    
    # Create User Pool
    local user_pool_id=$(aws --endpoint-url=http://localhost:4566 cognito-idp create-user-pool \
        --pool-name "liminal-transit-dev" \
        --policies '{"PasswordPolicy":{"MinimumLength":8}}' \
        --query 'UserPool.Id' --output text)
    
    # Create User Pool Client
    aws --endpoint-url=http://localhost:4566 cognito-idp create-user-pool-client \
        --user-pool-id "$user_pool_id" \
        --client-name "liminal-transit-dev-client" \
        --explicit-auth-flows ADMIN_NO_SRP_AUTH USER_PASSWORD_AUTH || true
    
    echo "✅ Cognito resources created"
    echo "📝 User Pool ID: $user_pool_id"
}

# Main execution
main() {
    wait_for_localstack
    create_s3_buckets
    create_dynamodb_tables
    create_cognito_resources
    
    echo ""
    echo "🎉 LocalStack setup complete!"
    echo "📍 LocalStack dashboard: http://localhost:4566/_localstack/health"
}

main "$@"
```

---

## 📋 **Package.json Scripts**

```json
{
  "scripts": {
    "// === Development Environment ===": "",
    "dev": "next dev",
    "dev:start": "docker-compose -f docker-compose.dev.yml up -d",
    "dev:stop": "docker-compose -f docker-compose.dev.yml down",
    "dev:reset": "docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up -d --build",
    "dev:logs": "docker-compose -f docker-compose.dev.yml logs -f",
    "dev:shell": "docker-compose -f docker-compose.dev.yml exec app sh",
    "dev:status": "docker-compose -f docker-compose.dev.yml ps",
    
    "// === Setup and Verification ===": "",
    "setup": "pnpm install && ./scripts/setup-local-env.sh",
    "verify": "./scripts/verify-dev-environment.sh",
    "install:tools": "./scripts/install-dev-tools.sh",
    
    "// === Code Quality ===": "",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "lint:staged": "lint-staged",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type:check": "tsc --noEmit",
    
    "// === Testing ===": "",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "e2e": "playwright test",
    "e2e:headed": "playwright test --headed",
    
    "// === Building ===": "",
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "build:test": "pnpm build && pnpm start:prod",
    "start": "next start",
    "start:prod": "NODE_ENV=production next start",
    
    "// === Database ===": "",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:reset": "docker-compose exec postgres psql -U dev_user -c \"DROP DATABASE IF EXISTS liminal_transit_dev; CREATE DATABASE liminal_transit_dev;\"",
    "db:console": "docker-compose exec postgres psql -U dev_user liminal_transit_dev",
    "db:studio": "prisma studio",
    
    "// === AWS LocalStack ===": "",
    "aws:setup": "./scripts/setup-localstack.sh",
    "aws:buckets": "aws --endpoint-url=http://localhost:4566 s3 mb s3://dev-stories s3://dev-assets",
    "aws:tables": "./scripts/create-dynamodb-tables.sh",
    "aws:dashboard": "open http://localhost:4566/_localstack/health",
    
    "// === AI Development ===": "",
    "ai:dev": "AI_PROVIDERS=all pnpm dev",
    "ai:test": "pnpm test src/lib/ai-engine.test.ts --watch",
    "ai:stories": "node scripts/generate-test-stories.js",
    "ai:benchmark": "node scripts/ai-performance-benchmark.js",
    
    "// === Utilities ===": "",
    "clean": "rm -rf .next dist node_modules/.cache",
    "clean:all": "rm -rf .next dist node_modules",
    "analyze": "ANALYZE=true pnpm build && open .next/analyze/index.html",
    "docker:clean": "docker system prune -f && docker volume prune -f"
  }
}
```

---

## 🔍 **Troubleshooting**

### Common Issues and Solutions

**CORS Issues:**
```bash
# Restart reverse proxy with fresh configuration
docker-compose restart reverse-proxy

# Check nginx configuration
docker-compose exec reverse-proxy nginx -t

# View nginx logs
docker-compose logs reverse-proxy
```

**Port Conflicts:**
```bash
# Check what's using ports
lsof -i :3000,8080,5432,6379

# Kill processes on specific ports
npx kill-port 3000 8080

# Use alternative ports
PORT=3001 npm run dev
```

**Container Issues:**
```bash
# Rebuild containers from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Check container health
docker-compose ps
docker-compose logs app
```

**Permission Issues:**
```bash
# Fix file permissions
sudo chown -R $(whoami):$(whoami) .

# Fix Docker socket permissions (Linux)
sudo chmod 666 /var/run/docker.sock
```

---

## 📱 **Mobile Development**

### iOS Testing
```bash
# Install iOS Simulator (requires Xcode)
xcrun simctl list devices

# Start iOS simulator
open -a Simulator

# Tunnel localhost to device
npx localtunnel --port 8080 --subdomain liminal-transit-dev
```

### Android Testing
```bash
# Setup Android emulator
$ANDROID_HOME/emulator/emulator -avd Pixel_4_API_30

# Port forwarding for Android
adb reverse tcp:8080 tcp:8080
```

---

This comprehensive local development setup provides everything needed for efficient development of the AI Native Liminal Transit platform, with zero-configuration Docker environment, CORS-solving reverse proxy, and streamlined one-liner commands for all common development tasks.
