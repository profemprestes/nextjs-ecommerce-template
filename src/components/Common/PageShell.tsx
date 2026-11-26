import React from "react";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

const PageShell = ({ children, className = "" }: PageShellProps) => {
  return (
    <div
      className={`w-[min(1180px,calc(100%-32px))] max-w-[1400px] mx-auto pt-24 pb-16 lg:pt-28 lg:pb-24 ${className}`}
    >
      {children}
    </div>
  );
};

export default PageShell;
