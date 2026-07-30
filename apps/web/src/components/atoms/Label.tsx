import React from 'react';
import { Label as FluentLabel, LabelProps } from '@fluentui/react-components';

export interface CustomLabelProps extends LabelProps {
  children: React.ReactNode;
}

export const Label: React.FC<CustomLabelProps> = ({ children, ...props }) => {
  return (
    <FluentLabel {...props}>
      {children}
    </FluentLabel>
  );
};

export default Label;
