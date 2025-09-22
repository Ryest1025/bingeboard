import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface UniversalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function UniversalButton({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: UniversalButtonProps) {
  const buttonSize = size === 'md' ? 'default' : size;
  
  return (
    <Button
      variant={variant}
      size={buttonSize}
      className={cn('transition-all duration-200', className)}
      {...props}
    >
      {children}
    </Button>
  );
}