/**
 * Agent Status Display Component
 * Shows detailed status information for a running agent
 */

import React from 'react';

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

interface AgentStatusDisplayProps {
  activity: AgentActivity;
}

export const AgentStatusDisplay: React.FC<AgentStatusDisplayProps> = ({ activity }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🔄';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏸️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#007bff';
      case 'completed': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDuration = () => {
    if (!activity.startTime) return 'N/A';
    const endTime = activity.endTime || new Date();
    const duration = endTime.getTime() - activity.startTime.getTime();
    return `${(duration / 1000).toFixed(1)}s`;
  };

  return (
    <div className="agent-status-display">
      <div className="status-header">
        <div className="status-info">
          <span className="status-icon">{getStatusIcon(activity.status)}</span>
          <div className="status-details">
            <h3>{activity.type}</h3>
            <p className="agent-id">ID: {activity.id}</p>
          </div>
        </div>
        <div className="status-badge" style={{ backgroundColor: getStatusColor(activity.status) }}>
          {activity.status.toUpperCase()}
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span>Progress: {activity.progress}%</span>
          <span>Duration: {formatDuration()}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${activity.progress}%`,
              backgroundColor: getStatusColor(activity.status)
            }}
          />
        </div>
      </div>

      <div className="metrics-section">
        <h4>Performance Metrics</h4>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Response Time</span>
            <span className="metric-value">
              {activity.metrics.responseTime ? `${activity.metrics.responseTime.toFixed(0)}ms` : 'N/A'}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Confidence</span>
            <span className="metric-value">
              {activity.metrics.confidence ? `${(activity.metrics.confidence * 100).toFixed(1)}%` : 'N/A'}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Quality</span>
            <span className="metric-value">
              {activity.metrics.quality ? `${(activity.metrics.quality * 100).toFixed(1)}%` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="timing-section">
        <div className="timing-item">
          <span className="timing-label">Started:</span>
          <span className="timing-value">
            {activity.startTime ? activity.startTime.toLocaleTimeString() : 'N/A'}
          </span>
        </div>
        {activity.endTime && (
          <div className="timing-item">
            <span className="timing-label">Completed:</span>
            <span className="timing-value">
              {activity.endTime.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};