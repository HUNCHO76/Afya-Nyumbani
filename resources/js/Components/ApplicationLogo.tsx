import React from 'react';

interface ApplicationLogoProps {
  className?: string;
}

const ApplicationLogo: React.FC<ApplicationLogoProps> = ({ className = '' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Heart with pulse line */}
      <path
        d="M24 42C24 42 6 30 6 18C6 14.4 7.2 11.2 9.6 8.8C12 6.4 15.2 5.2 18.8 5.2C21.2 5.2 23.2 6 24.8 7.2C26.4 6 28.4 5.2 30.8 5.2C34.4 5.2 37.6 6.4 40 8.8C42.4 11.2 43.6 14.4 43.6 18C43.6 30 24 42 24 42Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M24 42C24 42 6 30 6 18C6 14.4 7.2 11.2 9.6 8.8C12 6.4 15.2 5.2 18.8 5.2C21.2 5.2 23.2 6 24.8 7.2C26.4 6 28.4 5.2 30.8 5.2C34.4 5.2 37.6 6.4 40 8.8C42.4 11.2 43.6 14.4 43.6 18C43.6 30 24 42 24 42Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pulse line */}
      <path
        d="M12 24H16L20 16L28 32L32 24H36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ApplicationLogo;