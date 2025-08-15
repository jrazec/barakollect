import React from 'react';

interface EmptyStateNoticeProps {
  icon?: React.ReactNode;
  message: string;
  bgColor?: string;
}

const EmptyStateNotice: React.FC<EmptyStateNoticeProps> = ({
  icon = <span className="text-4xl">&#9888;</span>,
  message,
  bgColor = '#FDE9DD',
}) => {
  return (
    <div className={`rounded-lg flex flex-col items-center justify-center py-12 px-4 mb-4`} style={{ backgroundColor: bgColor }}>
      <div className="text-[var(--espresso-black)] mb-2">{icon}</div>
      <span className="text-[var(--espresso-black)] text-sm font-accent">{message}</span>
    </div>
  );
};

export default EmptyStateNotice;
