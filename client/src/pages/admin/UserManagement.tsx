import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/TableComponent';
import type { TableColumn } from '@/components/TableComponent';
import AdminService from '@/services/adminService';
import type { UserLog } from '@/interfaces/global';

interface UserManagementUser extends Omit<UserLog, 'action' | 'lastActive' | 'totalUploads' | 'totalValidations'> {
  location: string;
}

interface UserManagementProps {}

const UserManagement: React.FC<UserManagementProps> = () => {
  const [users, setUsers] = useState<UserManagementUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserManagementUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Farmer' | 'Researcher' | 'Admin'>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagementUser | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Farmer' as 'Farmer' | 'Researcher' | 'Admin',
    location: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const userLogs = await AdminService.getUserLogs();
        const userManagementUsers: UserManagementUser[] = userLogs.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          joinDate: user.joinDate,
          location: getRandomLocation() // Temporary - replace with actual location data
        }));
        setUsers(userManagementUsers);
        setFilteredUsers(userManagementUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Temporary function to generate random locations
  const getRandomLocation = () => {
    const locations = ['Kenya', 'Brazil', 'Ethiopia', 'Colombia', 'Uganda', 'Philippines', 'Vietnam', 'Indonesia'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (showAddModal) {
        // Add new user
        const newUser: UserManagementUser = {
          id: Date.now().toString(),
          ...formData,
          joinDate: new Date().toISOString().split('T')[0]
        };
        setUsers([...users, newUser]);
        setShowAddModal(false);
      } else if (showEditModal && selectedUser) {
        // Edit existing user
        const updatedUsers = users.map(user =>
          user.id === selectedUser.id ? { ...user, ...formData } : user
        );
        setUsers(updatedUsers);
        setShowEditModal(false);
      }
      resetForm();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      const updatedUsers = users.filter(user => user.id !== selectedUser.id);
      setUsers(updatedUsers);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'Farmer',
      location: '',
      status: 'active'
    });
  };

  // Open edit modal
  const openEditModal = (user: UserManagementUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      status: user.status
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (user: UserManagementUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Table columns
  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      width: 'w-1/5'
    },
    {
      key: 'role',
      label: 'Role',
      width: 'w-1/6',
      render: (value) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-accent ${
          value === 'Admin' ? 'bg-red-100 text-red-800' :
          value === 'Researcher' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      width: 'w-1/4'
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
      render: () => (
        <button className="text-[var(--arabica-brown)] hover:text-opacity-80 font-accent text-sm">
          View More
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-1/6',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="text-blue-600 hover:text-blue-800 font-accent text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="text-red-600 hover:text-red-800 font-accent text-sm"
          >
            Delete
          </button>
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
                <option value="Farmer">Farmer</option>
                <option value="Researcher">Researcher</option>
                <option value="Admin">Admin</option>
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
                  className={`px-3 py-2 border rounded-lg text-sm font-accent ${
                    currentPage === page
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
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                  />
                </div>
                
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
                
                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-2">Role</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                  >
                    <option value="Farmer">Farmer</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Admin">Admin</option>
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
                
                <div>
                  <label className="block text-sm font-accent text-gray-600 mb-2">Status</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--parchment)] rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-main font-bold text-[var(--espresso-black)]">
                  Delete User
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <p className="text-gray-600 font-accent mb-6">
                Are you sure you want to delete <strong>{selectedUser.name}</strong>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-accent hover:bg-red-700 transition-colors"
                >
                  Delete
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
      </div>
    </div>
  );
};

export default UserManagement;
