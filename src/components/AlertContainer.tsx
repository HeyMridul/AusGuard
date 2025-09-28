import { useState } from 'react';
import { Alert, GeminiAnalysis } from '../types';
import AlertBanner from './AlertBanner';
import { AlertTriangle, Brain, RefreshCw, CheckCircle } from 'lucide-react';

interface AlertContainerProps {
  analysis: GeminiAnalysis | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function AlertContainer({ analysis, loading, onRefresh }: AlertContainerProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const activeAlerts = analysis?.alerts.filter(alert => !dismissedAlerts.has(alert.id)) || [];

  // Sort alerts by severity (critical first, then high, medium, low)
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedAlerts = activeAlerts.sort((a, b) => 
    severityOrder[a.severity] - severityOrder[b.severity]
  );

  const getRiskLevelColor = (riskLevel: GeminiAnalysis['riskLevel']) => {
    switch (riskLevel) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <h2 className="text-lg font-semibold text-gray-900">Analyzing Safety Data...</h2>
        </div>
        <p className="text-gray-600 text-sm">
          AI is reviewing weather conditions and news alerts to identify potential threats.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Analysis Summary */}
      <div className={`rounded-lg border p-4 mb-4 ${getRiskLevelColor(analysis.riskLevel)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {analysis.riskLevel === 'low' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <div>
                <h3 className="font-semibold">
                  {analysis.riskLevel === 'low' ? 'All Clear' : 'Safety Analysis Complete'}
                </h3>
                <p className="text-sm opacity-90">
                  {analysis.summary}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium">
                Risk Level: {analysis.riskLevel.toUpperCase()}
              </div>
              <div className="text-xs opacity-75">
                Confidence: {Math.round(analysis.confidence * 100)}%
              </div>
            </div>
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                title="Refresh analysis"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <div className="flex items-center space-x-2 text-sm">
            <Brain className="h-4 w-4" />
            <span>
              AI Analysis • {new Date(analysis.analysisTimestamp).toLocaleString('en-AU', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {sortedAlerts.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Active Alerts ({sortedAlerts.length})</span>
          </h2>
          
          <div className="space-y-4">
            {sortedAlerts.map((alert) => (
              <AlertBanner
                key={alert.id}
                alert={alert}
                onDismiss={handleDismissAlert}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            No Active Alerts
          </h3>
          <p className="text-green-700 text-sm">
            No immediate threats or safety concerns detected in your area.
          </p>
        </div>
      )}

      {/* Dismissed Alerts Count */}
      {dismissedAlerts.size > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setDismissedAlerts(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Restore {dismissedAlerts.size} dismissed alert{dismissedAlerts.size !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
