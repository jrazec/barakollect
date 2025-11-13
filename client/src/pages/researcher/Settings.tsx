import { useState, useEffect } from 'react';
import CardComponent from '@/components/CardComponent';
import { 
  User, 
  AlertCircle,
  CheckCircle,
  Edit,
  X,
  Check,
  Mail,
  Lock,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import useNotification from '@/hooks/useNotification';
import { supabase } from '@/lib/supabaseClient';

type SaveStatus = 'success' | 'reset' | null;

interface Location {
  id: number;
  name: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  location_id?: number;
  location__name?: string;
  locations: Location[];
}

export default function ResearcherSettings() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  
  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // Load profile from backend
  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      setProfileLoading(true);
      const res = await fetch(`${import.meta.env.VITE_HOST_BE}/api/users/profile?userId=${user.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile');
      setProfile(data.data);
      setEditedProfile(data.data);
    } catch (e) {
      console.error('Failed to fetch profile', e);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!profile || !editedProfile) return;
    
    setIsLoading(true);
    setSaveStatus(null);
    
    try {
      const payload = {
        id: profile.id,
        first_name: editedProfile.first_name,
        last_name: editedProfile.last_name,
        username: editedProfile.username,
        location_id: editedProfile.location_id,
      };

      const res = await fetch(`${import.meta.env.VITE_HOST_BE}/api/users/update-profile/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update profile');
      
      setSaveStatus('success');
      setIsEditing(false);
      await fetchProfile(); // Refresh profile
    } catch (e: any) {
      setSaveStatus('reset');
      console.error(e);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleChangeEmail = async () => {
    if (!profile || !newEmail) return;
    
    setIsLoading(true);
    
    try {
      const payload = {
        id: profile.id,
        email: newEmail,
      };

      const res = await fetch(`${import.meta.env.VITE_HOST_BE}/api/users/update-profile/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        if (result.error.includes('taken') || result.error.includes('exists')) {
          throw new Error('Email is already taken');
        }
        throw new Error(result.error || 'Failed to update email');
      }
      
      setSaveStatus('success');
      setShowEmailModal(false);
      setNewEmail('');
      await fetchProfile();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!profile?.email) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        showError("Password reset failed", error.message);
        return;
      }

      showSuccess("Password reset email sent", `Reset link sent to ${profile.email}`);
      
      setShowPasswordConfirmModal(false);
    } catch (e: any) {
      showError("Password reset failed", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetClick = () => {
    setShowPasswordConfirmModal(true);
  };

  // Email Modal
  const EmailModal = () => (
    showEmailModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-semibold mb-4">Change Email</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Email</label>
              <input
                type="text"
                value={profile?.email || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                placeholder="Enter new email"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => {setShowEmailModal(false); setNewEmail('');}}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleChangeEmail}
              disabled={!newEmail || isLoading}
              className="px-4 py-2 bg-[var(--arabica-brown)] text-white rounded-md hover:bg-[var(--espresso-black)] disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Email'}
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="w-full h-full max-w-7xl bg-white p-6 mx-auto">
      <EmailModal />
      
      <div className="flex justify-between items-center">
        <PageHeader title="Settings" subtitle="" />
      </div>

      {saveStatus && (
        <div className={`flex items-center space-x-2 p-4 rounded-lg border ${
          saveStatus === 'success' ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'
        }`}>
          {saveStatus === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-sm">
            {saveStatus === 'success' 
              ? 'Settings updated successfully!' 
              : 'Settings reset to default values.'}
          </span>
        </div>
      )}

      {/* Profile Tab Only */}
      <div className="space-y-4">
        <div className="flex space-x-2 border-b">
          <div className="flex items-center space-x-2 px-4 py-2 font-medium text-sm border-b-2 border-[var(--arabica-brown)] text-[var(--arabica-brown)]">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </div>
        </div>

        {/* Profile Content */}
        <CardComponent
          item={{
            title: "Profile",
            subtitle: "View and edit your user profile",
            content: (
              <div className="space-y-6 w-full">
                {!profileLoading && profile ? (
                  <>
                    {/* Profile Fields */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium">Personal Information</h4>
                        {!isEditing ? (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center space-x-2 text-[var(--arabica-brown)] hover:text-[var(--espresso-black)]"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                setEditedProfile(profile);
                              }}
                              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                            >
                              <X className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                            <button
                              onClick={handleSaveProfile}
                              disabled={isLoading}
                              className="flex items-center space-x-1 text-[var(--arabica-brown)] hover:text-[var(--espresso-black)] disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                              <span>{isLoading ? 'Saving...' : 'Save'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--espresso-black)]">First Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedProfile.first_name || ''}
                              onChange={(e) => setEditedProfile(prev => ({ ...prev, first_name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                            />
                          ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-md">{profile.first_name}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--espresso-black)]">Last Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedProfile.last_name || ''}
                              onChange={(e) => setEditedProfile(prev => ({ ...prev, last_name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                            />
                          ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-md">{profile.last_name}</div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--espresso-black)]">Username</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedProfile.username || ''}
                              onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                            />
                          ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-md">{profile.username}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--espresso-black)]">Location</label>
                          {isEditing ? (
                            <select
                              value={editedProfile.location_id || ''}
                              onChange={(e) => setEditedProfile(prev => ({ ...prev, location_id: parseInt(e.target.value) }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                            >
                              <option value="">Select Location</option>
                              {profile.locations?.map((location) => (
                                <option key={location.id} value={location.id}>
                                  {location.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-md">{profile.location__name || 'No location'}</div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--espresso-black)]">Role</label>
                          <div className="px-3 py-2 bg-gray-50 rounded-md">{profile.role}</div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--espresso-black)]">Email</label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 px-3 py-2 bg-gray-50 rounded-md">{profile.email}</div>
                            <button
                              onClick={() => {setShowEmailModal(true); setNewEmail(profile.email);}}
                              className="flex items-center space-x-1 px-3 py-2 text-[var(--arabica-brown)] border border-[var(--arabica-brown)] rounded-md hover:bg-[var(--arabica-brown)] hover:text-white"
                            >
                              <Mail className="h-4 w-4" />
                              <span>Change</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Password Change */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--espresso-black)]">Password</label>
                        <button
                          onClick={handlePasswordResetClick}
                          className="flex items-center space-x-2 px-4 py-2 text-[var(--arabica-brown)] border border-[var(--arabica-brown)] rounded-md hover:bg-[var(--arabica-brown)] hover:text-white"
                        >
                          <Lock className="h-4 w-4" />
                          <span>Change Password</span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-600">{profileLoading ? 'Loading profile...' : 'No profile loaded.'}</div>
                )}
              </div>
            )
          }}
        />
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to change your password? We'll send a password reset link to <strong>{profile?.email}</strong>. 
                You'll need to check your email and follow the instructions to set a new password.
              </p>
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowPasswordConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--arabica-brown)] border border-transparent rounded-md hover:bg-[var(--espresso-black)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--arabica-brown)] disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}