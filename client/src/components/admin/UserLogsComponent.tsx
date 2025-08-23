import React, { useState } from 'react';
import TableComponent from './../TableComponent';
import type { TableColumn } from './../TableComponent';
import type { UserLog } from '@/interfaces/global';

interface UserLogsComponentProps {
  data: UserLog[];
}

interface UserDetailModalProps {
  user: UserLog | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--parchment)] rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-main font-bold text-[var(--espresso-black)]">
            User Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-accent text-gray-600">Name</label>
            <p className="font-main text-[var(--espresso-black)] break-words">{user.name}</p>
          </div>
          
          <div>
            <label className="text-sm font-accent text-gray-600">Email</label>
            <p className="font-main text-[var(--espresso-black)] break-words">{user.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-accent text-gray-600">Role</label>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-accent ${
              user.role === 'Admin' ? 'bg-red-100 text-red-800' :
              user.role === 'Researcher' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user.role}
            </span>
          </div>
          
          <div>
            <label className="text-sm font-accent text-gray-600">Status</label>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-accent ${
              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {user.status}
            </span>
          </div>
          
          <div>
            <label className="text-sm font-accent text-gray-600">Join Date</label>
            <p className="font-main text-[var(--espresso-black)]">{user.joinDate}</p>
          </div>
          
          <div>
            <label className="text-sm font-accent text-gray-600">Last Active</label>
            <p className="font-main text-[var(--espresso-black)]">{user.lastActive}</p>
          </div>
          
          <div>
            <label className="text-sm font-accent text-gray-600">Total Uploads</label>
            <p className="font-main text-[var(--espresso-black)]">{user.totalUploads}</p>
          </div>
          
          <div>
            <label className="text-sm font-accent text-gray-600">Total Validations</label>
            <p className="font-main text-[var(--espresso-black)]">{user.totalValidations}</p>
          </div>
          
          <div>
            <label className="text-sm font-accent text-gray-600">Last Action</label>
            <p className="font-main text-[var(--espresso-black)] break-words">{user.action}</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--arabica-brown)] text-[var(--parchment)] rounded-lg font-accent hover:bg-opacity-90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const UserLogsComponent: React.FC<UserLogsComponentProps> = ({ data }) => {
  const [selectedUser, setSelectedUser] = useState<UserLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (row: UserLog) => {
    setSelectedUser(row);
    setIsModalOpen(true);
  };

  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      width: 'w-1/4'
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
      key: 'action',
      label: 'Action',
      width: 'w-1/4'
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      width: 'w-1/4'
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
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-main font-bold text-[var(--espresso-black)] mb-2">
          User Activity Logs
        </h3>
        <p className="text-sm font-accent text-gray-600">
          Click on any row to view detailed user information
        </p>
      </div>
      
      <div className="flex-1 min-h-0">
        <TableComponent
          columns={columns}
          data={data}
          onRowClick={handleRowClick}
          className="h-full"
        />
      </div>
      
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default UserLogsComponent;
