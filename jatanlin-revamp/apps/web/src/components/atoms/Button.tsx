import React from "react";
import {
  Button as FluentButton,
  ButtonProps,
} from "@fluentui/react-components";

type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'disable';

export type CustomButtonProps = ButtonProps & {
  label?: string;
  variant?: ColorVariant;
};

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
    border: 'none',
  };
};

export const Button: React.FC<CustomButtonProps> = ({
  label,
  children,
  variant,
  style,
  ...props
}) => {
  const customStyle = variant ? { ...getColorStyle(variant), ...style } : style;

  return (
    <FluentButton {...props} style={customStyle}>
      {label || children}
    </FluentButton>
  );
};

export default Button;
