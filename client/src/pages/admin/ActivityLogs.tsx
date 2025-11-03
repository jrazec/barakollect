import { useState, useEffect } from 'react';
import CardComponent from '@/components/CardComponent';
import TableComponent from '@/components/TableComponent';
import useNotification from '@/hooks/useNotification';
import NotificationModal from '@/components/ui/NotificationModal';
import type { TableColumn } from '@/components/TableComponent';
import { 
  Search, 
  Download, 
  User, 
  Shield, 
  Database, 
  FileText,
  Clock,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import AdminService from '@/services/adminService';
import {type ActivityLog} from '@/interfaces/global';



interface Filters {
  search: string;
  userType: string;
  status: string;
  dateRange: string;
}

// Temporary data service
const getActivityLogs = async (filters: Partial<Filters> = {}): Promise<ActivityLog[]> => {
    
  const logs: ActivityLog[] = await AdminService.getActivityLogs();
  console.log("DEBUG: Fetched activity logs from AdminService filtered success status", logs.filter(log => log.status === "success"));
  
  return logs.filter(log => {
    // User type filter
    if (filters.userType && filters.userType !== 'all' && log.userType !== filters.userType) return false;
    
    // Status filter
    if (filters.status && filters.status !== 'all' && log.status !== filters.status) return false;
    
    // Search filter
    if (filters.search && !log.action.toLowerCase().includes(filters.search.toLowerCase()) && 
        !log.user.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const diffTime = now.getTime() - logDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      
      switch (filters.dateRange) {
        case '1day':
          if (diffDays > 1) return false;
          break;
        case '7days':
          if (diffDays > 7) return false;
          break;
        case '30days':
          if (diffDays > 30) return false;
          break;
      }
    }
    
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'backup' | 'confirm'>('backup');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showIndividualDeleteModal, setShowIndividualDeleteModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState<ActivityLog | null>(null);
  const [isDeletingIndividual, setIsDeletingIndividual] = useState(false);
  const logsPerPage = 10;

  // Initialize notification system
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    const fetchLogs = async () => {
      const filteredLogs = await getActivityLogs(filters);
      setLogs(filteredLogs);
    };
    fetchLogs();
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
      ['Timestamp', 'User', 'User Type', 'Action', 'Resource', 'Status', 'Details'],
      ...logs.map(log => [
        log.timestamp,
        log.user,
        log.userType,
        log.action,
        log.resource,
        log.status,
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

  const handleDeleteLogs = () => {
    setShowDeleteModal(true);
    setDeleteStep('backup');
    setDeleteConfirmText('');
  };

  const handleBackupChoice = (hasBackup: boolean) => {
    if (hasBackup) {
      setDeleteStep('confirm');
    } else {
      // Export logs first
      exportLogs();
      setDeleteStep('confirm');
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText !== 'barakollect-logs') {
      return;
    }

    setIsDeleting(true);
    try {
      await AdminService.deleteAllActivityLogs();
      setLogs([]);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      showSuccess('Delete Successful', 'All activity logs have been deleted successfully.');
    } catch (error) {
      console.error('Error deleting logs:', error);
      showError('Delete Failed', 'Failed to delete logs. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeleteStep('backup');
    setDeleteConfirmText('');
  };

  const handleIndividualDelete = (log: ActivityLog) => {
    setLogToDelete(log);
    setShowIndividualDeleteModal(true);
  };

  const handleConfirmIndividualDelete = async () => {
    if (!logToDelete) return;

    setIsDeletingIndividual(true);
    try {
      await AdminService.deleteActivityLog(logToDelete.id.toString());
      // Remove the deleted log from the current logs
      setLogs(prevLogs => prevLogs.filter(log => log.id !== logToDelete.id));
      setShowIndividualDeleteModal(false);
      setLogToDelete(null);
      showSuccess('Delete Successful', 'Activity log has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting log:', error);
      showError('Delete Failed', 'Failed to delete log. Please try again.');
    } finally {
      setIsDeletingIndividual(false);
    }
  };

  const handleCloseIndividualDeleteModal = () => {
    setShowIndividualDeleteModal(false);
    setLogToDelete(null);
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
      key: 'details',
      label: 'Details',
      render: (value) => (
        <span className="max-w-xs truncate block" title={value}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => handleIndividualDelete(row)}
          className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
          title="Delete this log"
        >
          <Trash2 className="h-3 w-3" />
          <span>Delete</span>
        </button>
      )
    }
  ];

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--espresso-black)]">Activity Logs</h1>
        <div className="flex space-x-3">
          <button 
            onClick={exportLogs} 
            className="flex items-center space-x-2 bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded-lg hover:bg-[var(--espresso-black)] transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Logs</span>
          </button>
          <button 
            onClick={handleDeleteLogs} 
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete All</span>
          </button>
        </div>
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

      {/* Individual Delete Confirmation Modal */}
      {showIndividualDeleteModal && logToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Delete Activity Log
              </h3>
              <button
                onClick={handleCloseIndividualDeleteModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-2">Are you sure you want to delete this log?</p>
                <div className="text-red-700 text-sm space-y-1">
                  <p><strong>User:</strong> {logToDelete.user}</p>
                  <p><strong>Action:</strong> {logToDelete.action}</p>
                  <p><strong>Timestamp:</strong> {logToDelete.timestamp}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseIndividualDeleteModal}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmIndividualDelete}
                  disabled={isDeletingIndividual}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeletingIndividual ? 'Deleting...' : 'Delete Log'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Delete All Activity Logs
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {deleteStep === 'backup' ? (
              <div className="space-y-4">
                <p className="text-gray-700">
                  Have you backed up your activity logs yet? This action cannot be undone.
                </p>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => handleBackupChoice(false)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    No, download backup first
                  </button>
                  <button
                    onClick={() => handleBackupChoice(true)}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Yes, I already have a backup
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium mb-2">⚠️ This action is irreversible!</p>
                  <p className="text-red-700 text-sm">
                    All activity logs will be permanently deleted from the system.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="font-mono bg-gray-100 px-1 rounded">barakollect-logs</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="barakollect-logs"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleteConfirmText !== 'barakollect-logs' || isDeleting}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete All Logs'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        mode={notification.mode}
        title={notification.title}
        message={notification.message}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        onConfirm={notification.onConfirm}
        onCancel={notification.onCancel}
        showCancel={notification.showCancel}
        autoClose={notification.autoClose}
        autoCloseDelay={notification.autoCloseDelay}
      />
    </div>
  );
}
