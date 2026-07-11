import React from 'react';

export const LoadingSpinner = ({ fullHeight = true, size = 12, color="primary" }) => (
  <div className={`flex justify-center items-center ${fullHeight ? 'min-h-screen' : ''}`}>
    <div className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-${color}`}></div>
  </div>
);
