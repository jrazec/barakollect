import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/TableComponent';
import type { TableColumn } from '@/components/TableComponent';
import AdminService from '@/services/adminService';
import type { UserManagementUser } from '@/interfaces/global';



interface UserManagementProps { }

const UserManagement: React.FC<UserManagementProps> = () => {
  const [users, setUsers] = useState<UserManagementUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserManagementUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'farmer' | 'researcher' | 'admin'>('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

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
    location: '',
    is_active: true,
    resetPassword: false,
    email: '',
    password: '',
  });

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const users = await AdminService.getUsers();
        setUsers(users);
        setFilteredUsers(users);
        console.log(users)
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by location
    if (locationFilter !== 'all') {
      filtered = filtered.filter(user => user.location === locationFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [users, searchTerm, roleFilter, locationFilter]);

  // Get unique locations for filter
  const uniqueLocations = Array.from(new Set(users.map(user => user.location)));

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
          location: formData.location,
          is_active: formData.is_active,
          email: formData.email
        });

        // Refresh the users list after creating a new user
        const updatedUsers = await AdminService.getUsers();
        setUsers(updatedUsers);
        setShowAddModal(false);
      } else if (showEditModal && selectedUser) {
        // Edit existing user
        await AdminService.updateUser(selectedUser.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          role: formData.role,
          location: formData.location,
          reset_password: formData.resetPassword
        });

        // Refresh user lists after editing
        const updatedUsers = await AdminService.getUsers();
        setUsers(updatedUsers);
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
      const updatedUsers = users.filter(user => user.id !== selectedUser.id);
      setUsers(updatedUsers);
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
      location: '',
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
      location: user.location,
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
      key: 'location',
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
          className="text-[var(--arabica-brown)] hover:text-opacity-80 font-accent text-sm"
        >
          View More
        </button>
      )
    },
    {
      key: 'actions',
      label: (
        <div className="flex items-center gap-2">
          <span>Actions</span>
          <button
            onClick={() => setDeleteMode(!deleteMode)}
            className={`px-2 py-1 rounded text-xs font-accent transition-colors ${
              deleteMode 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={deleteMode ? 'Switch to Deactivate mode' : 'Switch to Delete mode'}
          >
            {deleteMode ? 'Delete' : 'Disable'}
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
              className="text-red-600 hover:text-red-800 font-accent text-sm"
            >
              Delete
            </button>
          ) : (
            <button
              onClick={() => openDeactivateModal(row)}
              className={`font-accent text-sm ${
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
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-main font-bold text-[var(--espresso-black)] mb-2">
            User Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-accent">
            Manage users, roles, and permissions across the platform
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-[var(--parchment)] rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-accent text-gray-600 mb-2">Search by Name</label>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-accent text-gray-600 mb-2">Filter by Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
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
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
              >
                <option value="all">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
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
        <div className="mb-4">
          <p className="text-sm font-accent text-gray-600">
            Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-[var(--parchment)] rounded-lg shadow overflow-hidden">
          <TableComponent
            columns={columns}
            data={currentUsers}
            className="min-h-[400px]"
            rowClassName={(row) => row.is_deleted ? 'bg-amber-900 bg-opacity-20' : ''}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-lg text-sm font-accent ${currentPage === page
                    ? 'bg-[var(--arabica-brown)] text-[var(--parchment)] border-[var(--arabica-brown)]'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

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
                  <label className="block text-sm font-accent text-gray-600 mb-2">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                  />
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
                    {selectedUser.location}
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
