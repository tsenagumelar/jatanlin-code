import React from 'react';
import { Badge as FluentBadge, BadgeProps } from '@fluentui/react-components';

type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'disable';

export interface CustomBadgeProps extends Omit<BadgeProps, 'color'> {
  variant?: ColorVariant;
}

const getColorStyle = (variant?: ColorVariant) => {
  if (!variant) return {};

  const colorMap = {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    disable: 'var(--color-disable)',
  };

  return {
    backgroundColor: colorMap[variant],
    color: variant === 'disable' ? '#666666' : '#FFFFFF',
  };
};

export const Badge: React.FC<CustomBadgeProps> = ({
  variant,
  style,
  children,
  ...props
}) => {
  const customStyle = variant ? { ...getColorStyle(variant), ...style } : style;

  return (
    <FluentBadge {...props} style={customStyle}>
      {children}
    </FluentBadge>
  );
};

export default Badge;
