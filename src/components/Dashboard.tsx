import React from 'react';
import { FiThermometer, FiDroplet, FiWifi, FiBatteryCharging, FiActivity } from 'react-icons/fi';

const Dashboard: React.FC = () => {
  const metrics = [
    {
      label: 'Temperature',
      value: '24.5°C',
      status: 'safe',
      icon: FiThermometer,
      gauge: 82
    },
    {
      label: 'pH Level',
      value: '7.2',
      status: 'safe',
      icon: FiDroplet,
      gauge: 72
    },
    {
      label: 'Dissolved Oxygen',
      value: '6.8 mg/L',
      status: 'warning',
      icon: FiActivity,
      gauge: 68
    },
    {
      label: 'Ammonia/Nitrate',
      value: '0.3 ppm',
      status: 'safe',
      icon: FiDroplet,
      gauge: 30
    },
    {
      label: 'Battery Status',
      value: '87%',
      status: 'safe',
      icon: FiBatteryCharging,
      gauge: 87
    },
    {
      label: 'Signal Strength',
      value: 'Strong',
      status: 'safe',
      icon: FiWifi,
      gauge: 95
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getGaugeColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 h-full overflow-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Overview</h2>
        <p className="text-gray-600 dark:text-gray-400">Real-time aquaculture monitoring dashboard</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Icon size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{metric.label}</h3>
                    <p className={`text-sm ${getStatusColor(metric.status)}`}>
                      {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                </div>
              </div>
              
              {/* Gauge */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getGaugeColor(metric.status)}`}
                  style={{ width: `${metric.gauge}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feeding System</h3>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Last feeding: 2 hours ago • Next: 4 hours
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">All Systems Operational</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            4 sensors connected • Data updated 30s ago
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;