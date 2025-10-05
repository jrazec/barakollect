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
      className="h-full w-full flex flex-col items-center"
      style={{ backgroundColor: bgColor }}
    >
      {children}
    </div>
  );
};

export default PageContainer;
