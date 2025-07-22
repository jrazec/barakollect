import React from 'react';
import PageContainer from './PageContainer';
import PageHeaderWithFilter from './PageHeaderWithFilter';
import EmptyStateNotice from './EmptyStateNotice';

const BeanDatabase: React.FC = () => {
  return (
    <PageContainer>
      <div className="w-full max-w-6xl bg-[var(--mocha-beige)] rounded-xl shadow p-6">
        
        {/* Header */}
        <PageHeaderWithFilter
          title="Bean Database"
          subtitle="Review and validate bean samples uploaded by farmers"
          filterOptions={['By Date', 'By Farm', 'By Bean Type']}
        />

        {/* Validation Queue Empty State */}
        <EmptyStateNotice message="No beans found in the validation queue" />

      </div>
    </PageContainer>
  );
};

export default BeanDatabase;
