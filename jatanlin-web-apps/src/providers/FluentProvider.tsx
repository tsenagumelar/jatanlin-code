'use client';

import React from 'react';
import { FluentProvider as BaseFluentProvider, webLightTheme } from '@fluentui/react-components';

interface FluentProviderWrapperProps {
  children: React.ReactNode;
}

export const FluentProviderWrapper: React.FC<FluentProviderWrapperProps> = ({ children }) => {
  return (
    <BaseFluentProvider theme={webLightTheme}>
      {children}
    </BaseFluentProvider>
  );
};
