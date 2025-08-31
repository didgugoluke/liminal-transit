#!/usr/bin/env node

/**
 * MetaAgent V2 CLI - Enhanced Orchestration Integration
 * Command-line interface for GitHub Actions workflow integration
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Dynamic imports for ESM compatibility
async function main() {
  try {
    const { metaAgentOrchestrator } = await import('../dist/metaagent-orchestration.js');
    const { program } = require('commander');

    program
      .name('metaagent-v2')
      .description('MetaAgent V2 Enhanced Orchestration CLI')
      .version('2.0.0');

    program
      .command('orchestrate')
      .description('Orchestrate epic with enhanced AI analysis')
      .requiredOption('-n, --issue-number <number>', 'GitHub issue number')
      .requiredOption('-t, --title <title>', 'Issue title')
      .requiredOption('-b, --body <body>', 'Issue body')
      .option('-l, --labels <labels>', 'Comma-separated labels', '')
      .option('-a, --assignees <assignees>', 'Comma-separated assignees', '')
      .option('-m, --mode <mode>', 'Analysis mode', 'full-orchestration')
      .action(async (options) => {
        try {
          console.log('🧠 Starting MetaAgent V2 Enhanced Orchestration...');
          
          const request = {
            issueNumber: parseInt(options.issueNumber),
            title: options.title,
            body: options.body,
            labels: options.labels ? options.labels.split(',').map(l => l.trim()) : [],
            assignees: options.assignees ? options.assignees.split(',').map(a => a.trim()) : [],
            analysisMode: options.mode
          };

          const result = await metaAgentOrchestrator.orchestrateEpic(request);
          
          // Output results for GitHub Actions
          console.log('📊 ORCHESTRATION_RESULTS_START');
          console.log(JSON.stringify(result, null, 2));
          console.log('📊 ORCHESTRATION_RESULTS_END');
          
          // Output summary
          console.log('\n' + metaAgentOrchestrator.generateOrchestrationSummary(result));
          
          // Set GitHub Actions outputs
          if (process.env.GITHUB_OUTPUT) {
            const fs = require('fs');
            const outputs = [
              `epic_type=${result.epicAnalysis.epicType}`,
              `confidence=${result.epicAnalysis.confidence}`,
              `complexity=${result.epicAnalysis.complexityLevel}`,
              `primary_agent=${result.routingRecommendation.primary}`,
              `execution_strategy=${result.routingRecommendation.executionStrategy}`,
              `accuracy=${result.aiInsights.interpretationAccuracy}`,
              `processing_time=${result.orchestrationMetrics.processingTime}`,
              `success_prediction=${result.epicAnalysis.successPrediction}`
            ];
            
            fs.appendFileSync(process.env.GITHUB_OUTPUT, outputs.join('\n') + '\n');
          }

          // Exit with success code based on confidence
          const exitCode = result.epicAnalysis.confidence >= 0.95 ? 0 : 1;
          process.exit(exitCode);
          
        } catch (error) {
          console.error('❌ Orchestration failed:', error);
          process.exit(1);
        }
      });

    program
      .command('analyze')
      .description('Analyze epic without full orchestration')
      .requiredOption('-t, --title <title>', 'Issue title')
      .requiredOption('-b, --body <body>', 'Issue body')
      .action(async (options) => {
        try {
          const { NaturalLanguageEpicInterpreter } = await import('../dist/metaagent-v2-intelligence.js');
          const interpreter = new NaturalLanguageEpicInterpreter();
          
          const context = {
            issueNumber: 0,
            title: options.title,
            body: options.body,
            labels: [],
            assignees: [],
            analysisTimestamp: new Date()
          };

          const analysis = await interpreter.analyzeEpic(context);
          console.log('📊 Epic Analysis:', JSON.stringify(analysis, null, 2));
          
        } catch (error) {
          console.error('❌ Analysis failed:', error);
          process.exit(1);
        }
      });

    program
      .command('health')
      .description('Check AI provider health status')
      .action(async () => {
        try {
          const { AIProviderService } = await import('../dist/ai-provider-service.js');
          const provider = AIProviderService.getInstance();
          
          const health = provider.getProviderHealth();
          const metrics = provider.getUsageMetrics();
          
          console.log('🏥 AI Provider Health Status:');
          console.log(JSON.stringify(health, null, 2));
          console.log('\n📊 Usage Metrics:');
          console.log(JSON.stringify(metrics, null, 2));
          
        } catch (error) {
          console.error('❌ Health check failed:', error);
          process.exit(1);
        }
      });

    await program.parseAsync(process.argv);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});