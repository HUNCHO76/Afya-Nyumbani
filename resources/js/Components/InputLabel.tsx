import React from 'react';

interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  value?: string;
}

export default function InputLabel({ value, className = '', children, ...props }: InputLabelProps) {
  return (
    <label className={`block font-medium text-sm text-gray-700 ${className}`} {...props}>
      {value ?? children}
    </label>
  );
}
