import React, { useState } from 'react';
import { FiDownload, FiFileText, FiCalendar, FiFilter } from 'react-icons/fi';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState('last-7-days');

  const reports = [
    {
      id: 1,
      name: 'Daily Water Quality Report',
      date: '2024-01-15',
      type: 'daily',
      size: '2.3 MB',
      parameters: ['Temperature', 'pH', 'Dissolved Oxygen', 'Ammonia'],
      status: 'completed'
    },
    {
      id: 2,
      name: 'Weekly System Performance',
      date: '2024-01-14',
      type: 'weekly',
      size: '5.7 MB',
      parameters: ['All Parameters', 'System Health', 'Alerts Summary'],
      status: 'completed'
    },
    {
      id: 3,
      name: 'Monthly Analytics Summary',
      date: '2024-01-01',
      type: 'monthly',
      size: '12.4 MB',
      parameters: ['Trends', 'Recommendations', 'Cost Analysis'],
      status: 'completed'
    },
    {
      id: 4,
      name: 'Custom Parameter Report',
      date: '2024-01-12',
      type: 'custom',
      size: '1.8 MB',
      parameters: ['Temperature', 'pH'],
      status: 'generating'
    }
  ];

  const quickStats = [
    { label: 'Reports Generated', value: '47', change: '+12%' },
    { label: 'Data Points Analyzed', value: '15.2K', change: '+8%' },
    { label: 'Alerts Documented', value: '23', change: '-15%' },
    { label: 'System Uptime', value: '99.7%', change: '+0.2%' }
  ];

  const handleExport = (format: string) => {
    // Simulate export functionality
    console.log(`Exporting report in ${format} format`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'generating': return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'failed': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default: return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reports & Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400">Generate and export comprehensive system reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  stat.change.startsWith('+') 
                    ? 'text-green-600 dark:text-green-400' 
                    : stat.change.startsWith('-')
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {stat.change}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">vs last month</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Generation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate New Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Analysis</option>
              <option value="custom">Custom Report</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="last-7-days">Last 7 Days</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-90-days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <FiFileText size={16} />
              Generate Report
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiDownload size={16} />
            Export CSV
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiDownload size={16} />
            Export PDF
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiDownload size={16} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {report.parameters.join(', ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {report.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {report.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {report.status === 'completed' && (
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                        <FiDownload size={16} />
                      </button>
                    )}
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

export default Reports;