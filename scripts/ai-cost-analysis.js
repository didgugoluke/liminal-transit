#!/usr/bin/env node

/**
 * NOVELI.SH - AI Cost Analysis
 * Tracks and analyzes AI operation costs for enterprise budgeting
 */

const fs = require('fs');
const path = require('path');

class AICostAnalyzer {
  constructor() {
    this.costModels = {
      openai: {
        'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
        'gpt-3.5-turbo': { input: 0.001, output: 0.002 }
      },
      anthropic: {
        'claude-3-opus': { input: 0.015, output: 0.075 },
        'claude-3-sonnet': { input: 0.003, output: 0.015 },
        'claude-3-haiku': { input: 0.00025, output: 0.00125 }
      },
      aws_bedrock: {
        'claude-3-opus': { input: 0.015, output: 0.075 },
        'claude-3-sonnet': { input: 0.003, output: 0.015 },
        'titan-text': { input: 0.0008, output: 0.0016 }
      }
    };
    
    this.usage = this.loadUsageData();
  }

  loadUsageData() {
    // Mock usage data - replace with actual usage tracking
    return {
      daily: {
        requests: Math.floor(Math.random() * 1000) + 500,
        inputTokens: Math.floor(Math.random() * 50000) + 25000,
        outputTokens: Math.floor(Math.random() * 30000) + 15000,
        averageLatency: Math.random() * 500 + 200
      },
      monthly: {
        requests: Math.floor(Math.random() * 30000) + 15000,
        inputTokens: Math.floor(Math.random() * 1500000) + 750000,
        outputTokens: Math.floor(Math.random() * 900000) + 450000
      }
    };
  }

  calculateProviderCosts(provider, model, inputTokens, outputTokens) {
    const pricing = this.costModels[provider]?.[model];
    if (!pricing) {
      return { error: `No pricing data for ${provider}/${model}` };
    }
    
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    const totalCost = inputCost + outputCost;
    
    return {
      inputCost: inputCost.toFixed(4),
      outputCost: outputCost.toFixed(4),
      totalCost: totalCost.toFixed(4),
      costPerRequest: (totalCost / this.usage.daily.requests).toFixed(6)
    };
  }

  generateCostReport() {
    console.log('💰 AI Cost Analysis Report');
    console.log('==========================\n');
    
    // Current usage summary
    console.log('📊 CURRENT USAGE (24h):');
    console.log(`   Requests: ${this.usage.daily.requests.toLocaleString()}`);
    console.log(`   Input Tokens: ${this.usage.daily.inputTokens.toLocaleString()}`);
    console.log(`   Output Tokens: ${this.usage.daily.outputTokens.toLocaleString()}`);
    console.log(`   Avg Latency: ${Math.round(this.usage.daily.averageLatency)}ms`);
    console.log('');
    
    // Cost breakdown by provider
    console.log('💵 COST BREAKDOWN BY PROVIDER:');
    console.log('');
    
    const providers = [
      { name: 'AWS Bedrock', provider: 'aws_bedrock', model: 'claude-3-sonnet', share: 0.6 },
      { name: 'OpenAI', provider: 'openai', model: 'gpt-4', share: 0.3 },
      { name: 'Anthropic', provider: 'anthropic', model: 'claude-3-haiku', share: 0.1 }
    ];
    
    let totalDailyCost = 0;
    
    providers.forEach(({ name, provider, model, share }) => {
      const inputTokens = Math.round(this.usage.daily.inputTokens * share);
      const outputTokens = Math.round(this.usage.daily.outputTokens * share);
      const costs = this.calculateProviderCosts(provider, model, inputTokens, outputTokens);
      
      if (!costs.error) {
        const dailyCost = parseFloat(costs.totalCost);
        totalDailyCost += dailyCost;
        
        console.log(`🏷️  ${name} (${model}):`);
        console.log(`   Share: ${(share * 100)}% of traffic`);
        console.log(`   Daily Cost: $${costs.totalCost}`);
        console.log(`   Cost/Request: $${costs.costPerRequest}`);
        console.log(`   Monthly Projection: $${(dailyCost * 30).toFixed(2)}`);
        console.log('');
      }
    });
    
    // Total cost summary
    console.log('📈 COST SUMMARY:');
    console.log(`   Daily Total: $${totalDailyCost.toFixed(2)}`);
    console.log(`   Monthly Projection: $${(totalDailyCost * 30).toFixed(2)}`);
    console.log(`   Annual Projection: $${(totalDailyCost * 365).toFixed(2)}`);
    console.log('');
    
    // Efficiency metrics
    console.log('⚡ EFFICIENCY METRICS:');
    const costPerThousandTokens = (totalDailyCost / (this.usage.daily.inputTokens + this.usage.daily.outputTokens)) * 1000;
    const costPerRequest = totalDailyCost / this.usage.daily.requests;
    
    console.log(`   Cost per 1K tokens: $${costPerThousandTokens.toFixed(4)}`);
    console.log(`   Cost per request: $${costPerRequest.toFixed(4)}`);
    console.log(`   Tokens per dollar: ${Math.round(1 / costPerThousandTokens * 1000)}`);
    console.log('');
    
    // Optimization recommendations
    this.generateOptimizationRecommendations(totalDailyCost);
    
    // Save report
    this.saveCostReport({
      timestamp: new Date().toISOString(),
      usage: this.usage,
      costs: {
        daily: totalDailyCost,
        monthly: totalDailyCost * 30,
        annual: totalDailyCost * 365
      },
      efficiency: {
        costPerToken: costPerThousandTokens,
        costPerRequest: costPerRequest
      }
    });
    
    return {
      dailyCost: totalDailyCost,
      monthlyCost: totalDailyCost * 30,
      efficiency: costPerThousandTokens
    };
  }

  generateOptimizationRecommendations(dailyCost) {
    console.log('🎯 OPTIMIZATION RECOMMENDATIONS:');
    
    const recommendations = [];
    
    if (dailyCost > 100) {
      recommendations.push('💡 Consider implementing more aggressive caching');
      recommendations.push('💡 Evaluate token optimization strategies');
    }
    
    if (this.usage.daily.averageLatency > 1000) {
      recommendations.push('💡 High latency detected - consider regional optimization');
    }
    
    recommendations.push('💡 Monitor Claude 3 Haiku for cost-effective high-volume tasks');
    recommendations.push('💡 Reserve GPT-4 for complex reasoning tasks only');
    recommendations.push('💡 Implement request batching for efficiency gains');
    
    recommendations.forEach(rec => console.log(`   ${rec}`));
    console.log('');
  }

  saveCostReport(reportData) {
    const reportsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, 'ai-cost-analysis.log');
    fs.appendFileSync(reportPath, JSON.stringify(reportData) + '\n');
  }
}

// Run cost analysis if called directly
if (require.main === module) {
  const analyzer = new AICostAnalyzer();
  const results = analyzer.generateCostReport();
  
  console.log('💾 Cost analysis complete - results logged to logs/ai-cost-analysis.log');
  
  // Alert if costs are high
  if (results.dailyCost > 50) {
    console.log('⚠️  WARNING: Daily costs exceed $50 - review optimization recommendations');
  }
  
  if (results.monthlyCost > 1000) {
    console.log('🚨 ALERT: Monthly projection exceeds $1000 - immediate optimization required');
  }
}

module.exports = AICostAnalyzer;
