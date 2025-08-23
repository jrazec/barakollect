import React from 'react';
import type { SystemStatus } from '@/interfaces/global';

interface SystemStatusComponentProps {
  data: SystemStatus;
}

const SystemStatusComponent: React.FC<SystemStatusComponentProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStoragePercentage = () => {
    const used = parseFloat(data.storageUsed.replace(/[^\d.]/g, ''));
    const total = parseFloat(data.storageTotal.replace(/[^\d.]/g, ''));
    return Math.round((used / total) * 100);
  };

  const storagePercentage = getStoragePercentage();

  return (
    <div className="h-full space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* System Uptime */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs sm:text-sm font-main font-semibold text-[var(--espresso-black)]">
              System Uptime
            </h4>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-base sm:text-lg font-main font-bold text-[var(--espresso-black)]">
            {data.systemUptime}
          </p>
          <p className="text-xs font-accent text-gray-500">Continuous operation</p>
        </div>

        {/* Server Status */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs sm:text-sm font-main font-semibold text-[var(--espresso-black)]">
              Server Status
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-accent ${getStatusColor(data.serverStatus)}`}>
              {data.serverStatus}
            </span>
          </div>
          <p className="text-xs font-accent text-gray-500 break-words">Last updated: {data.lastBackup}</p>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
        <h4 className="text-xs sm:text-sm font-main font-semibold text-[var(--espresso-black)] mb-3">
          Payment Status
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <p className="text-xs font-accent text-gray-500">Pending</p>
            <p className="text-sm sm:text-lg font-main font-bold text-orange-600 break-words">
              ${data.pendingPayments.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-accent text-gray-500">Due</p>
            <p className="text-sm sm:text-lg font-main font-bold text-red-600 break-words">
              ${data.duePayments.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-accent text-gray-500">Total Revenue</p>
            <p className="text-sm sm:text-lg font-main font-bold text-green-600 break-words">
              {data.totalRevenue}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xs font-accent text-gray-500">
            Active Subscriptions: {data.activeSubscriptions}
          </p>
        </div>
      </div>

      {/* Storage Information */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs sm:text-sm font-main font-semibold text-[var(--espresso-black)]">
            Storage Usage
          </h4>
          <span className="text-xs font-accent text-gray-500">
            {storagePercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              storagePercentage > 80 ? 'bg-red-500' : 
              storagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${storagePercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs font-accent text-gray-500">
          <span className="break-words">{data.storageUsed} used</span>
          <span className="break-words">{data.storageTotal} total</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
        <h4 className="text-xs sm:text-sm font-main font-semibold text-[var(--espresso-black)] mb-3">
          Quick Actions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button className="px-3 py-2 bg-[var(--arabica-brown)] text-[var(--parchment)] rounded-lg text-xs font-accent hover:bg-opacity-90 transition-colors">
            Backup System
          </button>
          <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-accent hover:bg-gray-300 transition-colors">
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusComponent;
