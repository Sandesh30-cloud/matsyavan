import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('24h');

  const data24h = [
    { time: '00:00', temperature: 24.2, pH: 7.1, oxygen: 6.9, ammonia: 0.2 },
    { time: '04:00', temperature: 23.8, pH: 7.0, oxygen: 7.1, ammonia: 0.3 },
    { time: '08:00', temperature: 24.5, pH: 7.2, oxygen: 6.8, ammonia: 0.3 },
    { time: '12:00', temperature: 25.1, pH: 7.3, oxygen: 6.5, ammonia: 0.4 },
    { time: '16:00', temperature: 24.8, pH: 7.2, oxygen: 6.7, ammonia: 0.3 },
    { time: '20:00', temperature: 24.3, pH: 7.1, oxygen: 6.9, ammonia: 0.2 },
  ];

  const filterOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const charts = [
    {
      title: 'Temperature Trends',
      dataKey: 'temperature',
      color: '#3B82F6',
      unit: '°C'
    },
    {
      title: 'pH Levels',
      dataKey: 'pH',
      color: '#10B981',
      unit: 'pH'
    },
    {
      title: 'Dissolved Oxygen',
      dataKey: 'oxygen',
      color: '#F59E0B',
      unit: 'mg/L'
    },
    {
      title: 'Ammonia/Nitrate',
      dataKey: 'ammonia',
      color: '#EF4444',
      unit: 'ppm'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Historical data trends and insights</p>
        </div>
        
        {/* Time Filter */}
        <div className="flex gap-2 mt-4 sm:mt-0">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === option.value
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {chart.title}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data24h}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(31, 41, 55, 0.8)',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    labelFormatter={(label) => `Time: ${label}`}
                    formatter={(value: any) => [`${value} ${chart.unit}`, chart.title]}
                  />
                  <Line
                    type="monotone"
                    dataKey={chart.dataKey}
                    stroke={chart.color}
                    strokeWidth={2}
                    dot={{ fill: chart.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: chart.color, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Avg Temperature</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">24.4°C</p>
          <p className="text-sm text-green-600 dark:text-green-400">+0.2°C from yesterday</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Avg pH</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">7.2</p>
          <p className="text-sm text-green-600 dark:text-green-400">Optimal range</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Avg Oxygen</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">6.8 mg/L</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Monitor closely</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Data Points</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Last 24 hours</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;