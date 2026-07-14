import React from 'react';
import { Card as FluentCard, CardHeader, CardPreview, CardProps } from '@fluentui/react-components';

export interface CustomCardProps extends CardProps {
  title?: string;
  preview?: React.ReactNode;
  children: React.ReactNode;
}

export const Card: React.FC<CustomCardProps> = ({ title, preview, children, ...props }) => {
  return (
    <FluentCard {...props}>
      {preview && <CardPreview>{preview}</CardPreview>}
      {title && <CardHeader header={title} />}
      {children}
    </FluentCard>
  );
};

export default Card;
