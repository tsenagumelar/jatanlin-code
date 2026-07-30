import React from 'react';
import { Input as FluentInput, InputProps } from '@fluentui/react-components';

export interface CustomInputProps extends InputProps {
  fullWidth?: boolean;
}

export const Input: React.FC<CustomInputProps> = ({ fullWidth, ...props }) => {
  return (
    <FluentInput
      {...props}
      style={fullWidth ? { width: '100%' } : undefined}
    />
  );
};

export default Input;
