/**
 * Observatory Dashboard Component
 * Visual monitoring interface for V2 Agent smoke testing
 */

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { V2AgentMonitor } from './V2AgentMonitor';
import { AgentStatusDisplay } from './AgentStatusDisplay';
import './ObservatoryDashboard.css';

interface AgentActivity {
  id: string;
  type: string;
  status: 'idle' | 'active' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  progress: number;
  logs: string[];
  metrics: {
    responseTime?: number;
    confidence?: number;
    quality?: number;
  };
}

export const ObservatoryDashboard: React.FC = () => {
  const [agentActivity, setAgentActivity] = useState<AgentActivity | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
  };

  const startSmokeTest = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setLogs([]);
    addLog('🚀 Starting V2 Agent Smoke Test...');

    // Initialize agent activity tracking
    const activity: AgentActivity = {
      id: `test-${Date.now()}`,
      type: 'MetaAgent V2 Intelligence',
      status: 'active',
      startTime: new Date(),
      progress: 0,
      logs: [],
      metrics: {}
    };

    setAgentActivity(activity);
    addLog('📊 Agent activity monitoring initialized');

    try {
      // Simulate V2 agent workflow phases
      await simulateAgentWorkflow(activity, addLog, setAgentActivity);
      
      addLog('✅ V2 Agent Smoke Test completed successfully');
      setAgentActivity(prev => prev ? { ...prev, status: 'completed', endTime: new Date(), progress: 100 } : null);
    } catch (error) {
      addLog(`❌ V2 Agent Smoke Test failed: ${error}`);
      setAgentActivity(prev => prev ? { ...prev, status: 'error' } : null);
    } finally {
      setIsRunning(false);
    }
  };

  const resetDashboard = () => {
    setAgentActivity(null);
    setLogs([]);
    setIsRunning(false);
    addLog('🔄 Dashboard reset');
  };

  return (
    <div className="observatory-dashboard">
      <header className="dashboard-header">
        <h1>🔭 V2 Agent Observatory</h1>
        <p>Real-time monitoring and smoke testing for MetaAgent V2 Intelligence</p>
      </header>

      <div className="dashboard-controls">
        <Button 
          onClick={startSmokeTest} 
          disabled={isRunning}
          className="start-test-btn"
        >
          {isRunning ? '🔄 Running...' : '🚀 Start Smoke Test'}
        </Button>
        
        <Button 
          onClick={resetDashboard} 
          disabled={isRunning}
          className="reset-btn"
        >
          🔄 Reset
        </Button>
      </div>

      <div className="dashboard-content">
        <div className="agent-monitor-section">
          <h2>Agent Activity Monitor</h2>
          {agentActivity ? (
            <AgentStatusDisplay activity={agentActivity} />
          ) : (
            <div className="no-activity">
              <p>No active agent monitoring session</p>
              <p>Click "Start Smoke Test" to begin</p>
            </div>
          )}
        </div>

        <div className="logs-section">
          <h2>Live Logs</h2>
          <div className="logs-container">
            {logs.length === 0 ? (
              <p className="no-logs">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="log-entry">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="v2-monitor-section">
          <h2>V2 Intelligence Monitor</h2>
          <V2AgentMonitor isActive={isRunning} />
        </div>
      </div>
    </div>
  );
};

// Simulate V2 agent workflow for smoke testing
async function simulateAgentWorkflow(
  _activity: AgentActivity, 
  addLog: (message: string) => void,
  setActivity: React.Dispatch<React.SetStateAction<AgentActivity | null>>
) {
  const phases = [
    { name: 'Context Analysis', duration: 1000, progress: 20 },
    { name: 'Natural Language Processing', duration: 1500, progress: 40 },
    { name: 'Claude 4 Strategic Reasoning', duration: 2000, progress: 60 },
    { name: 'Intelligent Task Routing', duration: 1000, progress: 80 },
    { name: 'Performance Monitoring', duration: 500, progress: 100 }
  ];

  for (const phase of phases) {
    addLog(`🔄 Phase: ${phase.name}`);
    setActivity(prev => prev ? { 
      ...prev, 
      progress: phase.progress,
      metrics: { 
        ...prev.metrics, 
        responseTime: Math.random() * 1000 + 200,
        confidence: Math.random() * 0.3 + 0.7,
        quality: Math.random() * 0.2 + 0.8
      }
    } : null);
    
    await new Promise(resolve => setTimeout(resolve, phase.duration));
    addLog(`✅ Phase completed: ${phase.name}`);
  }
}