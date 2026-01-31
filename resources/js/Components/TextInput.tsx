import React, { forwardRef } from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isFocused?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ isFocused = false, className = '', ...props }, ref) => {
    return (
      <input
        {...props}
        ref={ref}
        autoFocus={isFocused}
        className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ${className}`}
      />
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
