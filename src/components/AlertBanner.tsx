import { useState } from 'react';
import { Alert } from '../types';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  ExternalLink,
  Clock,
  MapPin,
  Shield,
  Droplets,
  Flame,
  Heart,
  Newspaper
} from 'lucide-react';

interface AlertBannerProps {
  alert: Alert;
  onDismiss?: (alertId: string) => void;
}

export default function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          container: 'bg-red-100 border-red-300 text-red-900',
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700 text-white',
          badge: 'bg-red-600 text-white'
        };
      case 'high':
        return {
          container: 'bg-orange-100 border-orange-300 text-orange-900',
          icon: 'text-orange-600',
          button: 'bg-orange-600 hover:bg-orange-700 text-white',
          badge: 'bg-orange-600 text-white'
        };
      case 'medium':
        return {
          container: 'bg-yellow-100 border-yellow-300 text-yellow-900',
          icon: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          badge: 'bg-yellow-600 text-white'
        };
      case 'low':
        return {
          container: 'bg-blue-100 border-blue-300 text-blue-900',
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          badge: 'bg-blue-600 text-white'
        };
      default:
        return {
          container: 'bg-gray-100 border-gray-300 text-gray-900',
          icon: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700 text-white',
          badge: 'bg-gray-600 text-white'
        };
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'weather':
        return <Droplets className="h-5 w-5" />;
      case 'emergency':
        return <Flame className="h-5 w-5" />;
      case 'health':
        return <Heart className="h-5 w-5" />;
      case 'general':
        return <Newspaper className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: Alert['type']) => {
    switch (type) {
      case 'weather':
        return 'Weather Alert';
      case 'emergency':
        return 'Emergency Alert';
      case 'health':
        return 'Health Alert';
      case 'general':
        return 'General Alert';
      default:
        return 'Alert';
    }
  };

  const styles = getSeverityStyles(alert.severity);
  const timeAgo = getTimeAgo(alert.timestamp);

  return (
    <div className={`rounded-lg border-2 p-4 mb-4 ${styles.container} shadow-sm`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {getTypeIcon(alert.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                {getTypeLabel(alert.type)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                {alert.severity.toUpperCase()}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold mb-1">
              {alert.title}
            </h3>
            
            <p className="text-sm opacity-90 mb-2">
              {alert.description}
            </p>
            
            <div className="flex items-center space-x-4 text-xs opacity-75">
              {alert.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{alert.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors duration-200"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors duration-200"
              aria-label="Dismiss alert"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommendations */}
            {alert.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Immediate Actions</span>
                </h4>
                <ul className="space-y-1 text-sm">
                  {alert.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-xs mt-1">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preparation Steps */}
            {alert.preparationSteps.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Preparation Steps</span>
                </h4>
                <ul className="space-y-1 text-sm">
                  {alert.preparationSteps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-xs mt-1">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Emergency Contacts */}
          {alert.emergencyContacts && alert.emergencyContacts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Emergency Contacts</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {alert.emergencyContacts.map((contact, index) => (
                  <a
                    key={index}
                    href={contact.includes('000') ? 'tel:000' : `tel:${contact.replace(/\D/g, '')}`}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${styles.button} transition-colors duration-200`}
                  >
                    {contact}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Expiration */}
          {alert.expiresAt && (
            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  Alert expires: {new Date(alert.expiresAt).toLocaleString('en-AU', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return time.toLocaleDateString('en-AU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
