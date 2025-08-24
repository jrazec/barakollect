import React, { useState, useEffect } from 'react';
import CardComponent from '@/components/CardComponent';
import TableComponent from '@/components/TableComponent';
import type { TableColumn } from '@/components/TableComponent';
import { 
  Search, 
  Download, 
  Filter, 
  User, 
  Shield, 
  Database, 
  FileText,
  Clock
} from 'lucide-react';

interface ActivityLog {
  id: number;
  timestamp: string;
  user: string;
  userType: 'researcher' | 'admin' | 'farmer' | 'system';
  action: string;
  resource: string;
  status: 'success' | 'failed' | 'warning';
  ipAddress: string;
  details: string;
}

interface Filters {
  search: string;
  userType: string;
  status: string;
  dateRange: string;
}

// Temporary data service
const getActivityLogs = (filters: Partial<Filters> = {}): ActivityLog[] => {
  const logs: ActivityLog[] = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:25',
      user: 'john.doe@email.com',
      userType: 'researcher',
      action: 'Image Upload',
      resource: 'sample_001.jpg',
      status: 'success',
      ipAddress: '192.168.1.100',
      details: 'Uploaded bean sample image for classification'
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:28:15',
      user: 'admin@barakollect.com',
      userType: 'admin',
      action: 'User Creation',
      resource: 'user_456',
      status: 'success',
      ipAddress: '10.0.0.5',
      details: 'Created new farmer account'
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:25:10',
      user: 'jane.farmer@email.com',
      userType: 'farmer',
      action: 'Login Attempt',
      resource: 'authentication',
      status: 'failed',
      ipAddress: '203.0.113.45',
      details: 'Failed login attempt - invalid password'
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:20:05',
      user: 'researcher@email.com',
      userType: 'researcher',
      action: 'Data Export',
      resource: 'validation_results.csv',
      status: 'success',
      ipAddress: '192.168.1.102',
      details: 'Exported validation results dataset'
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:15:30',
      user: 'system',
      userType: 'system',
      action: 'Database Backup',
      resource: 'backup_20240115.sql',
      status: 'success',
      ipAddress: 'localhost',
      details: 'Automated daily database backup completed'
    }
  ];

  return logs.filter(log => {
    if (filters.userType && filters.userType !== 'all' && log.userType !== filters.userType) return false;
    if (filters.status && filters.status !== 'all' && log.status !== filters.status) return false;
    if (filters.search && !log.action.toLowerCase().includes(filters.search.toLowerCase()) && 
        !log.user.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    userType: 'all',
    status: 'all',
    dateRange: '7days'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    const filteredLogs = getActivityLogs(filters);
    setLogs(filteredLogs);
  }, [filters]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      success: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs',
      failed: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs',
      warning: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs'
    };
    return <span className={colors[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs'}>{status}</span>;
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'researcher': return <FileText className="h-4 w-4" />;
      case 'farmer': return <User className="h-4 w-4" />;
      case 'system': return <Database className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'User Type', 'Action', 'Resource', 'Status', 'IP Address', 'Details'],
      ...logs.map(log => [
        log.timestamp,
        log.user,
        log.userType,
        log.action,
        log.resource,
        log.status,
        log.ipAddress,
        log.details
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns: TableColumn[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (value) => (
        <div className="flex items-center space-x-1 font-mono text-sm">
          <Clock className="h-3 w-3 text-gray-500" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'user',
      label: 'User',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {getUserTypeIcon(row.userType)}
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-gray-500 capitalize">{row.userType}</div>
          </div>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'resource',
      label: 'Resource',
      render: (value) => <span className="font-mono text-sm">{value}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (value) => <span className="font-mono text-sm">{value}</span>
    },
    {
      key: 'details',
      label: 'Details',
      render: (value) => (
        <span className="max-w-xs truncate block" title={value}>
          {value}
        </span>
      )
    }
  ];

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--espresso-black)]">Activity Logs</h1>
        <button 
          onClick={exportLogs} 
          className="flex items-center space-x-2 bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded-lg hover:bg-[var(--espresso-black)] transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Filters */}
      <CardComponent
        item={{
          title: "Filters",
          subtitle: "",
          content: (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                />
              </div>
              <select 
                value={filters.userType} 
                onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
              >
                <option value="all">All User Types</option>
                <option value="admin">Admin</option>
                <option value="researcher">Researcher</option>
                <option value="farmer">Farmer</option>
                <option value="system">System</option>
              </select>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
              </select>
              <select 
                value={filters.dateRange} 
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
              >
                <option value="1day">Last 24 hours</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          )
        }}
      />

      {/* Logs Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--espresso-black)]">
          Activity Log Entries ({logs.length} total)
        </h2>
        <TableComponent columns={columns} data={currentLogs} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, logs.length)} of {logs.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
