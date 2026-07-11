import React from 'react';

export const ErrorAlert = ({ message }) => (
  <div className='p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
    <p>{message}</p>
  </div>
);
