import React from 'react';
import PageContainer from './PageContainer';
import EmptyStateNotice from './EmptyStateNotice';
import PageHeader from './PageHeader';

const ValidationQueue: React.FC = () => {
  return (
    <PageContainer>
      <div className="w-full max-w-6xl bg-[var(--mocha-beige)] rounded-xl shadow p-6">

        <PageHeader
          title="Validation Queue"
          subtitle="Review and validate beans submitted by farmers"
        />

        {/* Header with Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--arabica-brown)]">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by farmer or by bean type"
                className="w-full pl-10 pr-4 py-2 rounded border border-[var(--mocha-beige)] font-accent text-xs focus:outline-none bg-white text-[var(--arabica-brown)]"
              />
            </div>
          </div>
          <div className="flex-shrink-0">
            <select className="border border-[var(--mocha-beige)] rounded px-3 py-1 text-xs font-accent bg-white text-[var(--arabica-brown)] focus:outline-none">
              <option>All Notifications</option>
              <option>Pending</option>
              <option>Validated</option>
            </select>
          </div>
        </div>

        {/* Empty Notice */}
        <EmptyStateNotice message="No beans found in the validation queue" />
      </div>
    </PageContainer>
  );
};

export default ValidationQueue;
