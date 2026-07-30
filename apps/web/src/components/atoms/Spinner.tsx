import React from 'react';
import { Spinner as FluentSpinner, SpinnerProps } from '@fluentui/react-components';

export interface CustomSpinnerProps extends SpinnerProps {
  message?: string;
}

export const Spinner: React.FC<CustomSpinnerProps> = ({ message, ...props }) => {
  return (
    <FluentSpinner label={message} {...props} />
  );
};

export default Spinner;
