import React from 'react';
import { Field, FieldProps } from '@fluentui/react-components';

export interface CustomFormFieldProps extends FieldProps {
  children: React.ReactNode;
}

export const FormField: React.FC<CustomFormFieldProps> = ({ children, ...props }) => {
  return (
    <Field {...props}>
      {children}
    </Field>
  );
};

export default FormField;
