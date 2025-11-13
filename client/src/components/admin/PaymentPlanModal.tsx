import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, CreditCard, Calendar } from 'lucide-react';

interface PaymentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'free' | 'pro';
  onUpdatePlan: (planType: 'free' | 'pro', endDate?: string) => Promise<void>;
}

const PaymentPlanModal: React.FC<PaymentPlanModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onUpdatePlan,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>(currentPlan);
  const [isUpdating, setIsUpdating] = useState(false);
  const [endDate, setEndDate] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const validateDate = (date: string) => {
    if (!date) {
      setDateError('End date is required for Pro plan');
      return false;
    }
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      setDateError('End date must be in the future');
      return false;
    }
    
    setDateError('');
    return true;
  };

  const handleUpdatePlan = async () => {
    if (selectedPlan === currentPlan && selectedPlan !== 'pro') {
      onClose();
      return;
    }

    // Validate date for pro plan
    if (selectedPlan === 'pro' && !validateDate(endDate)) {
      return;
    }

    try {
      setIsUpdating(true);
      if (selectedPlan === 'pro') {
        await onUpdatePlan(selectedPlan, endDate);
      } else {
        await onUpdatePlan(selectedPlan);
      }
      onClose();
    } catch (error) {
      console.error('Error updating plan:', error);
    } finally {
      setIsUpdating(false);
      // Reload page to reflect changes TEMP
      navigate(0);
    }
  };

  const handlePlanChange = (planType: 'free' | 'pro') => {
    setSelectedPlan(planType);
    if (planType === 'free') {
      setEndDate('');
      setDateError('');
    }
  };

  const getDaysFromNow = (date: string) => {
    if (!date) return null;
    try {
      const end = new Date(date);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return null;
    }
  };

  const daysFromNow = getDaysFromNow(endDate);

  const plans = {
    free: {
      name: 'Free Plan',
      description: 'Basic features with limited storage',
      features: [
        '1 GB Storage',
        '500 MB Database'
      ]
    },
    pro: {
      name: 'Pro Plan',
      description: 'Advanced features with extended storage',
      features: [
        '100 GB Storage',
        '8 GB Database'
      ]
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-main font-bold text-[var(--espresso-black)]">
            Update Payment Plan
          </h2>
          <button
            onClick={onClose}
            className="button-accent p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 font-accent">
              Choose your subscription plan. Current plan: <span className="font-semibold text-[var(--arabica-brown)]">{plans[currentPlan].name}</span>
            </p>
          </div>

          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {(Object.keys(plans) as Array<'free' | 'pro'>).map((planType) => {
              const plan = plans[planType];
              const isSelected = selectedPlan === planType;
              const isCurrent = currentPlan === planType;

              return (
                <div
                  key={planType}
                  className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[var(--arabica-brown)] bg-[var(--parchment)]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePlanChange(planType)}
                >
                  {/* Current Plan Badge */}
                  {isCurrent && (
                    <div className="absolute -top-3 left-4 bg-[var(--mocha)] text-white px-3 py-1 rounded-full text-xs font-accent">
                      Current Plan
                    </div>
                  )}

                  {/* Selection Indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-[var(--arabica-brown)] bg-[var(--arabica-brown)]'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <h3 className="text-xl font-main font-bold text-[var(--espresso-black)]">
                        {plan.name}
                      </h3>
                    </div>
                    {planType === 'pro' && <CreditCard size={20} className="text-[var(--arabica-brown)]" />}
                  </div>

                  {/* Description */}
                  <p className="text-sm font-accent text-gray-600 mb-4">{plan.description}</p>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-main font-semibold text-[var(--espresso-black)]">
                      Features:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check size={16} className="text-green-500 flex-shrink-0" />
                          <span className="text-sm font-accent text-gray-700">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pro Plan End Date Input */}
          {selectedPlan === 'pro' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar size={20} className="text-blue-600" />
                <h4 className="font-main font-semibold text-blue-800">
                  Set Pro Plan End Date
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-accent text-blue-700 mb-2">
                    Pro plan will be active until:
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (e.target.value) validateDate(e.target.value);
                    }}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {dateError && (
                    <p className="text-red-600 text-xs mt-1">{dateError}</p>
                  )}
                </div>
                {endDate && !dateError && daysFromNow !== null && (
                  <div className="text-sm text-blue-700 bg-white p-2 rounded border">
                    Pro plan will be active for <span className="font-semibold">{daysFromNow} days</span> from today.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-accent hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdatePlan}
              disabled={isUpdating || (selectedPlan === currentPlan && selectedPlan !== 'pro') || (selectedPlan === 'pro' && !endDate)}
              className="px-6 py-2 bg-[var(--arabica-brown)] text-[var(--parchment)] rounded-lg font-accent hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>
                  {selectedPlan === currentPlan && selectedPlan !== 'pro' 
                    ? 'No Changes' 
                    : `Switch to ${plans[selectedPlan].name}`}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPlanModal;