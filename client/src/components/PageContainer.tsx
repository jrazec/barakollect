import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  bgColor?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  bgColor = 'var(--parchment)',
}) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center py-8 px-2 md:px-8"
      style={{ backgroundColor: bgColor }}
    >
      {children}
    </div>
  );
};

export default PageContainer;
