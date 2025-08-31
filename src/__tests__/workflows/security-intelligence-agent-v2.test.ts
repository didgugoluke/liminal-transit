import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

interface WorkflowInput {
  description: string;
  required: boolean;
  default?: string;
  type: string;
  options?: string[];
}

interface WorkflowJob {
  'runs-on': string;
  'timeout-minutes': number;
  permissions: Record<string, string>;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  name: string;
  uses?: string;
  with?: Record<string, string>;
  env?: Record<string, string>;
  run?: string;
  if?: string;
  id?: string;
}

interface WorkflowConfig {
  name: string;
  on: {
    workflow_dispatch: {
      inputs: Record<string, WorkflowInput>;
    };
  };
  jobs: Record<string, WorkflowJob>;
}

describe('Security Intelligence Agent V2 Workflow', () => {
  const workflowPath = join(process.cwd(), '.github/workflows/security-intelligence-agent-v2.yml');
  const workflowContent = readFileSync(workflowPath, 'utf8');
  const workflow = yaml.load(workflowContent) as WorkflowConfig;

  it('should have correct workflow name', () => {
    expect(workflow.name).toBe('🔐 Security Intelligence Agent V2');
  });

  it('should have required security task inputs', () => {
    const inputs = workflow.on.workflow_dispatch.inputs;
    
    expect(inputs.security_task).toBeDefined();
    expect(inputs.security_task?.required).toBe(true);
    expect(inputs.security_task?.options).toEqual([
      'proactive-threat-detection',
      'security-vulnerability-analysis', 
      'incident-response-automation',
      'compliance-monitoring',
      'threat-pattern-analysis',
      'automated-patch-recommendations',
      'owasp-compliance-validation'
    ]);
  });

  it('should support dual AI architecture models', () => {
    const aiModelInput = workflow.on.workflow_dispatch.inputs.ai_model;
    
    expect(aiModelInput?.options).toContain('claude-4');
    expect(aiModelInput?.options).toContain('claude-4-copilot');
    expect(aiModelInput?.options).toContain('dual-ai-architecture');
    expect(aiModelInput?.default).toBe('claude-4');
  });

  it('should have comprehensive security scope options', () => {
    const scopeInput = workflow.on.workflow_dispatch.inputs.security_scope;
    
    expect(scopeInput?.options).toEqual([
      'repository',
      'dependencies', 
      'infrastructure',
      'all'
    ]);
  });

  it('should have appropriate severity threshold settings', () => {
    const severityInput = workflow.on.workflow_dispatch.inputs.severity_threshold;
    
    expect(severityInput?.options).toEqual([
      'low',
      'medium',
      'high', 
      'critical'
    ]);
    expect(severityInput?.default).toBe('medium');
  });

  it('should have required permissions for security operations', () => {
    const permissions = workflow.jobs?.['security-intelligence-v2']?.permissions;
    
    expect(permissions?.contents).toBe('read');
    expect(permissions?.['pull-requests']).toBe('write');
    expect(permissions?.issues).toBe('write');
    expect(permissions?.actions).toBe('read');
    expect(permissions?.['security-events']).toBe('read');
    expect(permissions?.checks).toBe('write');
  });

  it('should have reasonable timeout for security analysis', () => {
    const timeout = workflow.jobs?.['security-intelligence-v2']?.['timeout-minutes'];
    expect(timeout).toBe(30);
  });

  it('should include all required steps for V2 intelligence', () => {
    const steps = workflow.jobs?.['security-intelligence-v2']?.steps;
    const stepNames = steps?.map((step: WorkflowStep) => step.name);
    
    expect(stepNames).toContain('🔄 Checkout Repository');
    expect(stepNames).toContain('⚡ Setup Rate Limiting and Security Environment');
    expect(stepNames).toContain('🧠 Dual AI Architecture Security Intelligence Analysis');
    expect(stepNames).toContain('🤖 GitHub Copilot Security Code Generation');
    expect(stepNames).toContain('🚨 Automated Incident Response');
    expect(stepNames).toContain('🔄 Continuous Security Monitoring Setup');
    expect(stepNames).toContain('📊 V2 Security Intelligence Summary');
  });

  it('should use GitHub token for authentication', () => {
    const steps = workflow.jobs?.['security-intelligence-v2']?.steps;
    const checkoutStep = steps?.find((step: WorkflowStep) => step.name === '🔄 Checkout Repository');
    
    expect(checkoutStep?.with?.token).toBe('${{ secrets.GITHUB_TOKEN }}');
  });

  it('should configure environment variables for security analysis', () => {
    const steps = workflow.jobs?.['security-intelligence-v2']?.steps;
    const analysisStep = steps?.find((step: WorkflowStep) => 
      step.name === '🧠 Dual AI Architecture Security Intelligence Analysis'
    );
    
    expect(analysisStep?.env?.GITHUB_TOKEN).toBe('${{ secrets.PROJECT_TOKEN }}');
    expect(analysisStep?.env?.SECURITY_TASK).toBe('${{ github.event.inputs.security_task }}');
    expect(analysisStep?.env?.AI_MODEL).toBe('${{ github.event.inputs.ai_model }}');
    expect(analysisStep?.env?.SECURITY_SCOPE).toBe('${{ github.event.inputs.security_scope }}');
    expect(analysisStep?.env?.SEVERITY_THRESHOLD).toBe('${{ github.event.inputs.severity_threshold }}');
  });

  it('should have conditional steps for incident response', () => {
    const steps = workflow.jobs?.['security-intelligence-v2']?.steps;
    const copilotStep = steps?.find((step: WorkflowStep) => 
      step.name === '🤖 GitHub Copilot Security Code Generation'
    );
    const incidentStep = steps?.find((step: WorkflowStep) => 
      step.name === '🚨 Automated Incident Response'
    );
    
    expect(copilotStep?.if).toBe('steps.security-analysis.outputs.security_issues_found > 0');
    expect(incidentStep?.if).toBe('steps.security-analysis.outputs.critical_vulnerabilities > 0');
  });

  it('should output security metrics for downstream processing', () => {
    const steps = workflow.jobs?.['security-intelligence-v2']?.steps;
    const analysisStep = steps?.find((step: WorkflowStep) => 
      step.name === '🧠 Dual AI Architecture Security Intelligence Analysis'
    );
    
    // Check that the step includes security metric outputs
    expect(analysisStep?.run).toContain('security_issues_found=');
    expect(analysisStep?.run).toContain('critical_vulnerabilities=');
    expect(analysisStep?.run).toContain('high_priority_patches=');
    expect(analysisStep?.run).toContain('compliance_violations=');
    expect(analysisStep?.run).toContain('ai_architecture=dual-ai-claude4-copilot');
  });
});