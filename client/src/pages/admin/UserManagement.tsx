import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/TableComponent';
import type { TableColumn } from '@/components/TableComponent';
import AdminService from '@/services/adminService';
import type { UserManagementUser, PaginationData } from '@/interfaces/global';
import PageHeader from '@/components/PageHeader';



interface UserManagementProps { }

const UserManagement: React.FC<UserManagementProps> = () => {
  const [users, setUsers] = useState<UserManagementUser[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrevious: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]); 

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'farmer' | 'researcher' | 'admin'>('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagementUser | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    role: 'farmer' as 'farmer' | 'researcher' | 'admin',
    location_name: '',
    is_active: true,
    resetPassword: false,
    email: '',
    password: '',
    location_id: '',
  });

  // Fetch users data
  useEffect(() => {
    loadUsers();
  }, [pagination.currentPage]);

  // Debounced search effect for username
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, locationFilter]);

  // Load locations only once on mount
  useEffect(() => {
    loadLocations();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Build search parameters
      const searchParams: any = {};
      if (searchTerm.trim()) searchParams.search_username = searchTerm.trim();
      if (roleFilter !== 'all') searchParams.role = roleFilter;
      if (locationFilter !== 'all') searchParams.location = locationFilter;
      
      const result = await AdminService.getUsers(
        pagination.currentPage,
        pagination.itemsPerPage,
        Object.keys(searchParams).length > 0 ? searchParams : undefined
      );
      
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const locations = await AdminService.getLocations();
      setLocations(locations);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Handle search changes with pagination reset
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleRoleFilterChange = (value: 'all' | 'farmer' | 'researcher' | 'admin') => {
    setRoleFilter(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleLocationFilterChange = (value: string) => {
    setLocationFilter(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (showAddModal) {
        await AdminService.createUser({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          role: formData.role,
          location_id: formData.location_id,
          is_active: formData.is_active,
          email: formData.email,
          password: formData.password,
        });

        // Refresh only the users data
        await loadUsers();
        setShowAddModal(false);
      } else if (showEditModal && selectedUser) {
        // Edit existing user
        await AdminService.updateUser(selectedUser.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          role: formData.role,
          location_id: formData.location_id,
          reset_password: formData.resetPassword
        });

        // Refresh only the users data
        await loadUsers();
        setShowEditModal(false);
      }
      resetForm();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user. Please try again.');
    }
  };

  // Handle activate/deactivate
  const handleActivateDeactivate = async () => {
    if (!selectedUser) return;
    console.log(selectedUser.id);
    try {
      if (selectedUser.is_deleted) {
        await AdminService.activateUser(selectedUser.id);
      } else {
        await AdminService.deactivateUser(selectedUser.id);
      }

      // Update user in local state
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, is_deleted: !user.is_deleted }
          : user
      );
      setUsers(updatedUsers);
      setShowDeactivateModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedUser || deleteConfirmUsername !== selectedUser.username) return;

    try {
      await AdminService.deleteUser(selectedUser.id);
      // Refresh only the users data instead of filtering locally
      await loadUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
      setDeleteConfirmUsername('');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      username: '',
      role: 'farmer',
      location_id: '',
      location_name: '',
      is_active: true,
      resetPassword: false,
      email: '',
      password: '',
    });
  };

  // Open edit modal
  const openEditModal = (user: UserManagementUser) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      role: user.role,
      location_name: user.location__name,
      location_id: user.location_id,
      is_active: user.is_active,
      resetPassword: false,
      email: user.email,
      password: ''
    });
    setShowEditModal(true);
  };

  // Open deactivate modal
  const openDeactivateModal = (user: UserManagementUser) => {
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  // Open delete modal
  const openDeleteModal = (user: UserManagementUser) => {
    setSelectedUser(user);
    setDeleteConfirmUsername('');
    setShowDeleteModal(true);
  };

  // Open view modal
  const openViewModal = (user: UserManagementUser) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Table columns
  const columns: TableColumn[] = [
    {
      key: 'username',
      label: 'Username',
      width: 'w-1/4'
    },
    {
      key: 'first_name',
      label: 'First Name',
      width: 'w-1/5'
    },
    {
      key: 'last_name',
      label: 'Last Name',
      width: 'w-1/5'
    },
    {
      key: 'role',
      label: 'Role',
      width: 'w-1/6',
      render: (value) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-accent ${value === 'admin' ? 'bg-red-100 text-red-800' :
          value === 'researcher' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
          {value}
        </span>
      )
    },
    {
      key: 'location__name',
      label: 'Location',
      width: 'w-1/6'
    },
    {
      key: 'viewMore',
      label: '',
      width: 'w-1/6',
      render: (_, row) => (
        <button 
          onClick={() => openViewModal(row)}
          className="button-secondary hover:text-opacity-80 font-accent text-sm"
        >
          View
        </button>
      )
    },
    {
      key: 'actions',
      label: (
        <div className="flex items-center justify-between pr-2">
          <span>Actions</span>
          <button
            onClick={() => setDeleteMode(!deleteMode)}
            className={`px-2 py-1 rounded text-xs font-accent transition-colors ${
              deleteMode 
                ? '!bg-red-500 text-red-700 hover:bg-red-200' 
                : '!bg-gray-500 text-gray-700 hover:bg-gray-200'
            }`}
            title={deleteMode ? 'Switch to Deactivate mode' : 'Switch to Delete mode'}
          >
            {deleteMode ? 'Delete Mode' : 'Disable Mode'}
          </button>
        </div>
      ),
      width: 'w-1/6',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="text-blue-600 hover:text-blue-800 font-accent text-sm"
          >
            Edit
          </button>
          {deleteMode ? (
            <button
              onClick={() => openDeleteModal(row)}
              className="text-red-600 hover:text-red-800 font-accent text-sm min-w-30"
            >
              Delete
            </button>
          ) : (
            <button
              onClick={() => openDeactivateModal(row)}
              className={`font-accent text-sm min-w-30 ${
                row.is_deleted 
                  ? 'text-green-600 hover:text-green-800' 
                  : 'text-orange-600 hover:text-orange-800'
              }`}
            >
              {row.is_deleted ? 'Activate' : 'Deactivate'}
            </button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--arabica-brown)] mx-auto mb-4"></div>
          <p className="text-gray-600 font-accent">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-accent mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--arabica-brown)] text-[var(--parchment)] rounded-lg font-accent hover:bg-opacity-90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="User Management" subtitle={''} />

        {/* Search and Filters */}
        <div className="bg-[var(--parchment)] rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-accent text-gray-600 mb-2">Search by Username</label>
              <input
                type="text"
                placeholder="Search users by username..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-accent text-gray-600 mb-2">Filter by Role</label>
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="farmer">Farmer</option>
                <option value="researcher">Researcher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-accent text-gray-600 mb-2">Filter by Location</label>
              <select
                value={locationFilter}
                onChange={(e) => handleLocationFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
              >
                <option value="all">All Locations</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </div>

            {/* Add User Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="w-full px-4 py-2 bg-[var(--arabica-brown)] text-[var(--parchment)] rounded-lg font-accent hover:bg-opacity-90 transition-colors"
              >
                Add New User
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}


        {/* Users Table */}
        <div className="bg-[var(--parchment)] rounded-lg shadow overflow-hidden">
          <TableComponent
            columns={columns}
            data={users}
            className="min-h-[400px]"
            rowClassName={(row) => row.is_deleted ? 'bg-[var(--fadin-gray)]' : ''}
            pagination={{
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              totalItems: pagination.totalItems,
              itemsPerPage: pagination.itemsPerPage,
              hasNext: pagination.hasNext,
              hasPrevious: pagination.hasPrevious,
              onPageChange: handlePageChange
            }}
            showPaginationTop={true}
          />
        </div>

        {/* Add/Edit User Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--parchment)] rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-main font-bold text-[var(--espresso-black)]">
                  {showAddModal ? 'Add New User' : 'Edit User'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              {/* TODO handle submiut here  */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {(showAddModal) && (
                   <div>
                  <label className="block text-sm font-accent text-gray-600 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                  />
                </div>
                )}
                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-2">Username</label>
                  <input
                    type="username"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-2">Role</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                  >
                    <option value="3">Farmer</option>
                    <option value="2">Researcher</option>
                    <option value="1">Admin</option>
                  </select>
                </div>

                <div>
                  <select
                    required
                    value={formData.location_id}
                    onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                  >
                    <option value="">Select Location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
                {showAddModal && (
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-accent text-gray-600">Set Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                    />
                  </div>
                )}

                {showEditModal && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.resetPassword}
                      onChange={(e) => setFormData({ ...formData, resetPassword: e.target.checked })}
                      className="h-4 w-4 text-[var(--arabica-brown)] border-gray-300 rounded focus:ring-[var(--arabica-brown)]"
                    />
                    <label className="text-sm font-accent text-gray-600">Reset Password on next login</label>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[var(--arabica-brown)] text-[var(--parchment)] rounded-lg font-accent hover:bg-opacity-90 transition-colors"
                  >
                    {showAddModal ? 'Add User' : 'Update User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-accent hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deactivate/Activate User Modal */}
        {showDeactivateModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--parchment)] rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-main font-bold text-[var(--espresso-black)]">
                  {selectedUser.is_deleted ? 'Activate User' : 'Deactivate User'}
                </h3>
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              <p className="text-gray-600 font-accent mb-6">
                Are you sure you want to {selectedUser.is_deleted ? 'activate' : 'deactivate'} <strong>{selectedUser.first_name + " " + selectedUser.last_name}</strong>?
                {!selectedUser.is_deleted && ' This will prevent them from accessing the system.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleActivateDeactivate}
                  className={`flex-1 px-4 py-2 rounded-lg font-accent transition-colors text-white ${
                    selectedUser.is_deleted
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {selectedUser.is_deleted ? 'Activate' : 'Deactivate'}
                </button>
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-accent hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--parchment)] rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-main font-bold text-red-600">
                  ⚠️ Delete User Permanently
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 font-accent mb-4">
                  <strong className="text-red-600">WARNING:</strong> You are about to permanently delete <strong>{selectedUser.first_name + " " + selectedUser.last_name}</strong>.
                </p>
                <p className="text-gray-600 font-accent mb-4">
                  This action will delete ALL data associated with this user from the database, including:
                </p>
                <ul className="text-gray-600 font-accent mb-4 list-disc list-inside space-y-1">
                  <li>User profile and account information</li>
                  <li>All research data and submissions</li>
                  <li>Historical records and logs</li>
                  <li>Any associated files or documents</li>
                </ul>
                <p className="text-red-600 font-accent font-semibold mb-4">
                  This action cannot be undone!
                </p>
                
                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-2">
                    Type the username "<strong>{selectedUser.username}</strong>" to confirm deletion:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmUsername}
                    onChange={(e) => setDeleteConfirmUsername(e.target.value)}
                    placeholder={selectedUser.username}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirmUsername !== selectedUser.username}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-accent hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-accent hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View User Details Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--parchment)] rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-main font-bold text-[var(--espresso-black)]">
                  User Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-1">User ID</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm">
                    {selectedUser.id}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-1">Role</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-accent ${
                      selectedUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                      selectedUser.role === 'researcher' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-1">First Name</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {selectedUser.first_name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-1">Last Name</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {selectedUser.last_name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-1">Username</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {selectedUser.username}
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-1">Location</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {(selectedUser.location__name === '' || !selectedUser.location__name) ? 'N/A' : selectedUser.location__name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-1">Account Status</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-accent ${
                      selectedUser.is_deleted 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedUser.is_deleted ? 'Deactivated' : 'Active'}
                    </span>
                  </div>
                </div>


                {selectedUser.created_at && (
                  <div>
                    <label className="block text-sm font-accent text-gray-600 mb-1">Created At</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                      {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}

                {selectedUser.updated_at && (
                  <div>
                    <label className="block text-sm font-accent text-gray-600 mb-1">Last Updated</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                      {new Date(selectedUser.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
              </div>

              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
