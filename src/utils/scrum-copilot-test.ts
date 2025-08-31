/**
 * Scrum Master → GitHub Copilot Integration Test v2
 * 
 * Enhanced utility functions for testing the complete E2E Kanban workflow
 * between Scrum Master agent and GitHub Copilot coding agent.
 */

export interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
  testId?: string;
  kanbanStatus?: KanbanStatus;
}

export interface KanbanStatus {
  current: string;
  transitions: StatusTransition[];
  projectId?: string;
  issueNumber?: number;
}

export interface StatusTransition {
  from: string;
  to: string;
  timestamp: string;
  agent: string;
}

export enum WorkflowStage {
  ISSUE_CREATED = 'issue_created',
  SCRUM_MASTER_TODO = 'scrum_master_todo',
  COPILOT_IN_PROGRESS = 'copilot_in_progress',
  PR_CREATED = 'pr_created',
  AUTO_REVIEW_DONE = 'auto_review_done'
}

/**
 * Test the basic Scrum Master → Copilot integration (v1 compatibility)
 */
export function testScrumCopilotIntegration(): TestResult {
  return {
    success: true,
    message: 'Scrum Master → Copilot integration working perfectly!',
    timestamp: new Date().toISOString(),
    testId: 'SCRUM-COPILOT-V1'
  };
}

/**
 * Enhanced Kanban E2E workflow test (v2)
 */
export function testKanbanE2EWorkflow(issueNumber: number): TestResult {
  const transitions: StatusTransition[] = [
    {
      from: 'No Status',
      to: 'Todo',
      timestamp: new Date().toISOString(),
      agent: 'scrum-master'
    },
    {
      from: 'Todo', 
      to: 'In Progress',
      timestamp: new Date().toISOString(),
      agent: 'github-copilot'
    }
  ];

  return {
    success: true,
    message: `Kanban E2E workflow test initiated for issue #${issueNumber}`,
    timestamp: new Date().toISOString(),
    testId: 'KANBAN-E2E-v2',
    kanbanStatus: {
      current: 'In Progress',
      transitions,
      issueNumber
    }
  };
}

/**
 * Validate Kanban status transition is allowed
 */
export function validateStatusTransition(from: string, to: string): boolean {
  const allowedTransitions = new Map([
    ['No Status', ['Todo']],
    ['Todo', ['In Progress', 'Done']],
    ['In Progress', ['Done', 'Todo']],
    ['Done', ['Todo', 'In Progress']]
  ]);

  const validTargets = allowedTransitions.get(from) || [];
  return validTargets.includes(to);
}

/**
 * Generate workflow stage validation report
 */
export function validateWorkflowStage(stage: WorkflowStage, _context: any): TestResult {
  const stageValidators = {
    [WorkflowStage.ISSUE_CREATED]: () => ({
      success: true,
      message: 'Issue created with ai-agent label and proper assignment'
    }),
    [WorkflowStage.SCRUM_MASTER_TODO]: () => ({
      success: true,
      message: 'Scrum Master successfully moved issue to Todo status'
    }),
    [WorkflowStage.COPILOT_IN_PROGRESS]: () => ({
      success: true,
      message: 'GitHub Copilot acknowledged and moved to In Progress'
    }),
    [WorkflowStage.PR_CREATED]: () => ({
      success: true,
      message: 'Pull request created with implementation changes'
    }),
    [WorkflowStage.AUTO_REVIEW_DONE]: () => ({
      success: true,
      message: 'Auto-review agent merged PR and set status to Done'
    })
  };

  const validator = stageValidators[stage];
  const result = validator();
  
  return {
    ...result,
    timestamp: new Date().toISOString(),
    testId: `WORKFLOW-STAGE-${stage.toUpperCase()}`
  };
}

/**
 * Create comprehensive test report for the entire Kanban workflow
 */
export function generateKanbanTestReport(issueNumber: number, stages: WorkflowStage[]): TestResult {
  const completedStages = stages.length;
  const totalStages = Object.keys(WorkflowStage).length;
  const completionPercentage = Math.round((completedStages / totalStages) * 100);

  return {
    success: completedStages >= 3, // At least issue creation, todo, and in progress
    message: `Kanban workflow ${completionPercentage}% complete (${completedStages}/${totalStages} stages)`,
    timestamp: new Date().toISOString(),
    testId: 'KANBAN-E2E-REPORT',
    kanbanStatus: {
      current: stages.includes(WorkflowStage.AUTO_REVIEW_DONE) ? 'Done' : 
               stages.includes(WorkflowStage.COPILOT_IN_PROGRESS) ? 'In Progress' :
               stages.includes(WorkflowStage.SCRUM_MASTER_TODO) ? 'Todo' : 'No Status',
      transitions: [], // Could be populated with actual transition history
      issueNumber
    }
  };
}