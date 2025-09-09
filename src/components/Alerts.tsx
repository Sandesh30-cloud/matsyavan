import React from 'react';
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const Alerts: React.FC = () => {
  const alerts = [
    {
      id: 1,
      type: 'critical',
      parameter: 'Dissolved Oxygen',
      value: '5.2 mg/L',
      threshold: '< 6.0 mg/L',
      timestamp: '2024-01-15 14:30:22',
      status: 'active',
      message: 'Oxygen levels critically low'
    },
    {
      id: 2,
      type: 'warning',
      parameter: 'pH Level',
      value: '7.8',
      threshold: '> 7.5',
      timestamp: '2024-01-15 13:15:45',
      status: 'active',
      message: 'pH approaching upper limit'
    },
    {
      id: 3,
      type: 'safe',
      parameter: 'Temperature',
      value: '24.5°C',
      threshold: '22-26°C',
      timestamp: '2024-01-15 12:45:10',
      status: 'resolved',
      message: 'Temperature normalized'
    },
    {
      id: 4,
      type: 'warning',
      parameter: 'Ammonia',
      value: '0.8 ppm',
      threshold: '> 0.5 ppm',
      timestamp: '2024-01-15 11:20:33',
      status: 'acknowledged',
      message: 'Ammonia levels elevated'
    },
    {
      id: 5,
      type: 'safe',
      parameter: 'Battery',
      value: '87%',
      threshold: '> 20%',
      timestamp: '2024-01-15 10:00:15',
      status: 'resolved',
      message: 'Battery level sufficient'
    }
  ];

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'critical': return <FiXCircle className="text-red-500" size={20} />;
      case 'warning': return <FiAlertTriangle className="text-yellow-500" size={20} />;
      case 'safe': return <FiCheckCircle className="text-green-500" size={20} />;
      default: return <FiClock className="text-gray-500" size={20} />;
    }
  };

  const getStatusBadge = (type: string) => {
    switch (type) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      case 'safe': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      case 'acknowledged': return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'resolved': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      default: return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active').length;
  const warningAlerts = alerts.filter(alert => alert.type === 'warning' && alert.status === 'active').length;
  const criticalAlerts = alerts.filter(alert => alert.type === 'critical' && alert.status === 'active').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Alerts & Notifications</h2>
        <p className="text-gray-600 dark:text-gray-400">Monitor system alerts and parameter violations</p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <FiXCircle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{criticalAlerts}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <FiAlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{warningAlerts}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Warning Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FiClock size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeAlerts}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Alerts</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Parameter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(alert.type)}
                      <span className="text-lg">{getStatusBadge(alert.type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.parameter}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {alert.message}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {alert.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {alert.threshold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {alert.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Alerts;