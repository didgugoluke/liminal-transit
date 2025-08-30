# Liminal Transit - Bootstrap & Observatory Scripts

This directory contains the comprehensive bootstrap and monitoring scripts for the AI Native Liminal Transit platform.

## 🚀 Bootstrap Script

### `bootstrap-liminal-transit.sh`

The master bootstrap script that sets up the entire AI Native development environment from scratch. This is your **Day 1, Hour Zero** starting point.

**What it does:**
- ✅ Validates all prerequisites (GitHub CLI, AWS CLI, Node.js, Terraform, Docker)
- ✅ Creates GitHub repository with full AI Native infrastructure
- ✅ Sets up comprehensive directory structure
- ✅ Configures GitHub Projects, Issues, and Workflows
- ✅ Uploads all documentation and architecture frameworks
- ✅ Enables Observatory monitoring system
- ✅ Creates initial commit with complete foundation
- ✅ Sets up branch protection and CI/CD pipelines

**Usage:**
```bash
# Run from your development directory
./scripts/bootstrap-liminal-transit.sh
```

**Prerequisites:**
- GitHub CLI authenticated (`gh auth login`)
- AWS CLI configured (`aws configure`)
- Node.js 18+ installed
- pnpm package manager
- Terraform installed
- Docker installed

## 🔭 Observatory Scripts

### `observatory-monitor.js`

Real-time monitoring dashboard for HITM (Human-in-the-Middle) oversight of all AI agents.

**Features:**
- 🤖 AI Agent health monitoring (30-second intervals)
- 🏗️ Infrastructure status tracking
- 🔐 Compliance validation
- 💰 Real-time cost analysis
- ⚡ Performance metrics
- 🚨 Automatic alerting

**Usage:**
```bash
pnpm observatory:start
# or
node scripts/observatory-monitor.js
```

### `ai-health-check.js`

Comprehensive health check for all AI providers and agents.

**Monitors:**
- OpenAI API availability and response times
- Anthropic Claude API status
- AWS Bedrock service health
- Response time benchmarks
- Error rate tracking

**Usage:**
```bash
pnpm ai:health-check
# or
node scripts/ai-health-check.js
```

### `ai-cost-analysis.js`

Enterprise-grade cost tracking and optimization recommendations.

**Analyzes:**
- Per-provider cost breakdown
- Token usage efficiency
- Monthly/annual projections
- Cost-per-request metrics
- Optimization recommendations

**Usage:**
```bash
pnpm ai:cost-report
# or
node scripts/ai-cost-analysis.js
```

## 📊 Observatory Dashboard Access

Once bootstrap is complete, access your HITM Observatory dashboard:

**Local Development:**
- Observatory Monitor: `pnpm observatory:start`
- Live Dashboard: Terminal-based real-time monitoring

**Production Dashboard:**
- URL: `https://observatory.liminal-transit.com`
- Real-time AI agent monitoring
- Infrastructure health metrics
- Cost analysis and alerting
- Compliance status tracking

## 🎯 Quick Start Sequence

1. **Bootstrap Environment:**
   ```bash
   ./scripts/bootstrap-liminal-transit.sh
   ```

2. **Complete Setup:**
   ```bash
   cd liminal-transit
   pnpm bootstrap:complete
   ```

3. **Start Observatory:**
   ```bash
   pnpm observatory:start
   ```

4. **Begin Development:**
   ```bash
   pnpm dev
   ```

## 🔧 Script Customization

### Environment Variables

Set these in your environment or `.env.local`:

```bash
# GitHub Configuration
GITHUB_USER="your-username"
GITHUB_ORG="your-org"  # Optional

# AWS Configuration  
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="123456789012"

# Observatory Configuration
OBSERVATORY_DASHBOARD_URL="https://observatory.liminal-transit.com"
OBSERVATORY_REFRESH_INTERVAL="30000"  # 30 seconds

# AI Provider Settings
OPENAI_API_KEY="sk-..."  # Optional for health checks
ANTHROPIC_API_KEY="sk-ant-..."  # Optional for health checks
```

### Script Modifications

To customize the bootstrap process:

1. **Repository Settings:** Edit the configuration section in `bootstrap-liminal-transit.sh`
2. **Observatory Metrics:** Modify monitoring intervals in `observatory-monitor.js`
3. **Cost Models:** Update pricing data in `ai-cost-analysis.js`
4. **Health Checks:** Customize provider endpoints in `ai-health-check.js`

## 🚨 Troubleshooting

### Common Issues

**Bootstrap fails with authentication error:**
```bash
# Re-authenticate with GitHub
gh auth login

# Re-configure AWS
aws configure
```

**Observatory won't start:**
```bash
# Install dependencies
pnpm install

# Check Node.js version
node --version  # Should be 18+
```

**AI health checks fail:**
```bash
# Verify internet connection
# Check API keys in environment
# Review logs in logs/ai-health.log
```

### Support

For issues with bootstrap or observatory scripts:

1. Check the logs in the `logs/` directory
2. Review GitHub Actions for CI/CD pipeline issues
3. Verify all prerequisites are installed and configured
4. Create GitHub issue with detailed error information

## 📈 Monitoring & Metrics

The Observatory system tracks:

**AI Agent Metrics:**
- Response times and latency
- Success/failure rates
- Quality scores
- Resource utilization

**Infrastructure Metrics:**
- AWS service health
- Terraform state consistency
- GitHub Actions status
- Security compliance

**Cost Metrics:**
- Daily/monthly/annual projections
- Per-provider cost breakdown
- Efficiency ratios
- Optimization opportunities

**Performance Metrics:**
- Request throughput
- Error rates
- Uptime statistics
- User engagement analytics

---

**🎉 Welcome to AI Native Development!**

The future of software development starts with these scripts. Experience 100% AI-driven development with enterprise-grade observability and zero human scaffolding.

Ready to build the future? Run `./scripts/bootstrap-liminal-transit.sh` and let the AI agents take over! 🚀
