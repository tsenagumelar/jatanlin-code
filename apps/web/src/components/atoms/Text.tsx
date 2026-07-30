import React from 'react';
import { Text as FluentText, TextProps } from '@fluentui/react-components';

export type CustomTextProps = TextProps & {
  children: React.ReactNode;
};

export const Text: React.FC<CustomTextProps> = ({ children, ...props }) => {
  return (
    <FluentText {...props}>
      {children}
    </FluentText>
  );
};

export default Text;
