import React, { useState } from 'react';
import { Clock, Server, Database, HardDrive, Calendar, CreditCard, Settings } from 'lucide-react';
import type { SystemStatus } from '@/interfaces/global';
import PaymentPlanModal from './PaymentPlanModal';
import AdminService from '@/services/adminService';

interface SystemStatusComponentProps {
  data: SystemStatus;
  onPlanUpdate?: () => void; // Callback to refresh data after plan update
}

const SystemStatusComponent: React.FC<SystemStatusComponentProps> = ({ 
  data, 
  onPlanUpdate 
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const getDaysRemaining = (endDate: string | null | undefined) => {
    if (!endDate) return null;
    try {
      const end = new Date(endDate);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return null;
    }
  };

  const handlePlanUpdate = async (planType: 'free' | 'pro', endDate?: string) => {
    try {
      await AdminService.updatePaymentPlan(planType, endDate);
      setShowPaymentModal(false);
      onPlanUpdate?.(); // Trigger parent to refresh data

    } catch (error) {
      console.error('Failed to update payment plan:', error);
      throw error;
    }
  };

  const daysRemaining = getDaysRemaining(data.paymentPlan?.end_date);

  return (
    <>
      <div className="h-full space-y-4">
        {/* System Information Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* System Uptime */}
          <div className='grid grid-cols-2 gap-4'>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Clock size={20} className="text-[var(--arabica-brown)]" />
                <h4 className="text-sm font-main font-semibold text-[var(--espresso-black)]">
                  System Uptime
                </h4>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-lg font-main font-bold text-[var(--espresso-black)] mb-1">
              {data.systemUptime}
            </p>
            <p className="text-xs font-accent text-gray-500">Database continuous operation</p>
          </div>

          {/* Supabase Status */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Server size={20} className="text-[var(--arabica-brown)]" />
              <h4 className="text-sm font-main font-semibold text-[var(--espresso-black)]">
                Supabase Status
              </h4>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mb-3">
              {/* Database Status */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Database size={14} className="text-gray-600" />
                    <span className="text-xs font-accent text-gray-600">Database</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-accent ${getStatusColor(data.databaseStatus)}`}>
                    {data.databaseStatus}
                  </span>
                </div>
              </div>

              {/* Storage Status */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <HardDrive size={14} className="text-gray-600" />
                    <span className="text-xs font-accent text-gray-600">Storage</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-accent ${getStatusColor(data.storageStatus)}`}>
                    {data.storageStatus}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs font-accent text-gray-500">
              Last updated: {formatDate(data.lastBackup)}
            </p>
          </div>

          </div>
          {/* Payment Plan Status */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <CreditCard size={20} className="text-[var(--arabica-brown)]" />
                <h4 className="text-sm font-main font-semibold text-[var(--espresso-black)]">
                  Payment Plan
                </h4>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="button-accent p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                title="Manage Payment Plan"
              >
                <Settings size={16} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Plan Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-accent text-gray-600">Current Plan:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-accent ${
                  data.paymentPlan?.plan_type === 'pro' 
                    ? 'bg-[var(--mocha)] text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {data.paymentPlan?.plan_type === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>

              {/* Pro Plan Details */}
              {data.paymentPlan?.plan_type === 'pro' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-accent text-gray-600">Current Bill:</span>
                    <span className="text-sm font-main font-semibold text-[var(--espresso-black)]">
                      ${data.paymentPlan.current_bill}
                    </span>
                  </div>

                  {daysRemaining !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-accent text-gray-600">Days Remaining:</span>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} className="text-[var(--arabica-brown)]" />
                        <span className={`text-sm font-main font-semibold ${
                          daysRemaining <= 7 ? 'text-red-600' : 'text-[var(--espresso-black)]'
                        }`}>
                          {daysRemaining} days
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

            
            </div>

            {/* Active Subscriptions */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-accent text-gray-500">Active Subscriptions:</span>
                <span className="text-xs font-main font-semibold text-[var(--espresso-black)]">
                  {data.activeSubscriptions}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Plan Modal */}
      <PaymentPlanModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        currentPlan={data.paymentPlan?.plan_type || 'free'}
        onUpdatePlan={handlePlanUpdate}
      />
    </>
  );
};

export default SystemStatusComponent;
