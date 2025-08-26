import React, { useState } from 'react';
import CardComponent from '@/components/CardComponent';
import { 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Globe,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    systemAlerts: boolean;
    userRegistration: boolean;
    dataValidation: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordExpiry: number;
    twoFactorAuth: boolean;
    ipWhitelist: string;
    encryptionEnabled: boolean;
  };
  email: {
    smtpServer: string;
    smtpPort: string;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  storage: {
    maxFileSize: number;
    allowedFormats: string;
    storageQuota: number;
    autoBackup: boolean;
    backupFrequency: string;
    retentionPeriod: number;
  };
}

// Temporary data service
const getSystemSettings = (): SystemSettings => ({
  general: {
    siteName: 'BaraKollect',
    siteDescription: 'Advanced Bean Classification and Collection System',
    timezone: 'UTC+8',
    language: 'en',
    maintenanceMode: false,
    debugMode: false
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    userRegistration: true,
    dataValidation: true
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    twoFactorAuth: false,
    ipWhitelist: '',
    encryptionEnabled: true
  },
  email: {
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'admin@barakollect.com',
    smtpPassword: '••••••••',
    fromEmail: 'noreply@barakollect.com',
    fromName: 'BaraKollect System'
  },
  storage: {
    maxFileSize: 10,
    allowedFormats: 'jpg,jpeg,png,tiff',
    storageQuota: 100,
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: 30
  }
});

type SaveStatus = 'success' | 'reset' | null;

export default function Settings() {
  const [settings, setSettings] = useState<SystemSettings>(getSystemSettings());
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateSetting = <T extends keyof SystemSettings>(
    category: T, 
    key: keyof SystemSettings[T], 
    value: SystemSettings[T][keyof SystemSettings[T]]
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    setSaveStatus(null);
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('success');
      setIsLoading(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings(getSystemSettings());
      setSaveStatus('reset');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description }: { 
    checked: boolean; 
    onChange: (checked: boolean) => void; 
    label: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <label className="font-medium text-[var(--espresso-black)]">{label}</label>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--arabica-brown)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--arabica-brown)]"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--espresso-black)]">System Settings</h1>
        <div className="flex space-x-2">
          <button 
            onClick={resetToDefaults}
            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button 
            onClick={saveSettings} 
            disabled={isLoading}
            className="flex items-center space-x-2 bg-[var(--arabica-brown)] text-[var(--parchment)] px-4 py-2 rounded-lg hover:bg-[var(--espresso-black)] transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
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
              ? 'Settings saved successfully!' 
              : 'Settings reset to default values.'}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-2 border-b">
          {[
            { key: 'general', label: 'General', icon: Globe },
            { key: 'notifications', label: 'Notifications', icon: Bell },
            { key: 'security', label: 'Security', icon: Shield },
            { key: 'email', label: 'Email', icon: Mail },
            { key: 'storage', label: 'Storage', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2 font-medium text-sm ${
                  activeTab === tab.key 
                    ? 'border-b-2 border-[var(--arabica-brown)] text-[var(--arabica-brown)]' 
                    : 'text-gray-600 hover:text-[var(--arabica-brown)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'general' && (
          <CardComponent
            item={{
              title: "General Settings",
              subtitle: "",
              content: (
                <div className="space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--espresso-black)]">Site Name</label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--espresso-black)]">Timezone</label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                      >
                        <option value="UTC+8">UTC+8 (Philippines)</option>
                        <option value="UTC+0">UTC+0 (GMT)</option>
                        <option value="UTC-5">UTC-5 (EST)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--espresso-black)]">Site Description</label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                    />
                  </div>
                  <ToggleSwitch
                    checked={settings.general.maintenanceMode}
                    onChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
                    label="Maintenance Mode"
                    description="Enable to prevent user access during updates"
                  />
                  <ToggleSwitch
                    checked={settings.general.debugMode}
                    onChange={(checked) => updateSetting('general', 'debugMode', checked)}
                    label="Debug Mode"
                    description="Enable detailed logging for troubleshooting"
                  />
                </div>
              )
            }}
          />
        )}

        {activeTab === 'notifications' && (
          <CardComponent
            item={{
              title: "Notification Settings",
              subtitle: "",
              content: (
                <div className="space-y-4 w-full">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <ToggleSwitch
                      key={key}
                      checked={value}
                      onChange={(checked) => updateSetting('notifications', key as keyof SystemSettings['notifications'], checked)}
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      description={
                        key === 'emailNotifications' ? 'Send notifications via email' :
                        key === 'smsNotifications' ? 'Send notifications via SMS' :
                        key === 'pushNotifications' ? 'Send browser push notifications' :
                        key === 'systemAlerts' ? 'Alert administrators of system issues' :
                        key === 'userRegistration' ? 'Notify when new users register' :
                        'Notify when data validation is complete'
                      }
                    />
                  ))}
                </div>
              )
            }}
          />
        )}

        {activeTab === 'security' && (
          <CardComponent
            item={{
              title: "Security Settings",
              subtitle: "",
              content: (
                <div className="space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--espresso-black)]">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--espresso-black)]">Max Login Attempts</label>
                      <input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--espresso-black)]">Password Expiry (days)</label>
                    <input
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                    />
                  </div>
                  <ToggleSwitch
                    checked={settings.security.twoFactorAuth}
                    onChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                    label="Two-Factor Authentication"
                    description="Require 2FA for all admin accounts"
                  />
                </div>
              )
            }}
          />
        )}

        {activeTab === 'email' && (
          <CardComponent
            item={{
              title: "Email Configuration",
              subtitle: "",
              content: (
                <div className="space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--espresso-black)]">SMTP Server</label>
                      <input
                        type="text"
                        value={settings.email.smtpServer}
                        onChange={(e) => updateSetting('email', 'smtpServer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--espresso-black)]">SMTP Port</label>
                      <input
                        type="text"
                        value={settings.email.smtpPort}
                        onChange={(e) => updateSetting('email', 'smtpPort', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--espresso-black)]">From Email</label>
                      <input
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--espresso-black)]">From Name</label>
                      <input
                        type="text"
                        value={settings.email.fromName}
                        onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                      />
                    </div>
                  </div>
                </div>
              )
            }}
          />
        )}

        {activeTab === 'storage' && (
          <CardComponent
            item={{
              title: "Storage Settings",
              subtitle: "",
              content: (
                <div className="space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--espresso-black)]">Max File Size (MB)</label>
                      <input
                        type="number"
                        value={settings.storage.maxFileSize}
                        onChange={(e) => updateSetting('storage', 'maxFileSize', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--espresso-black)]">Storage Quota (GB)</label>
                      <input
                        type="number"
                        value={settings.storage.storageQuota}
                        onChange={(e) => updateSetting('storage', 'storageQuota', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--espresso-black)]">Allowed File Formats</label>
                    <input
                      type="text"
                      value={settings.storage.allowedFormats}
                      onChange={(e) => updateSetting('storage', 'allowedFormats', e.target.value)}
                      placeholder="jpg,jpeg,png,tiff"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)]"
                    />
                  </div>
                  <ToggleSwitch
                    checked={settings.storage.autoBackup}
                    onChange={(checked) => updateSetting('storage', 'autoBackup', checked)}
                    label="Auto Backup"
                    description="Automatically backup data"
                  />
                </div>
              )
            }}
          />
        )}
      </div>
    </div>
  );
}
