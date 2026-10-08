import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

type PillProps = {
  children: ReactNode;
  className?: string;
};

export function Pill({ children, className }: PillProps) {
  return (
    <span className={cn('tag rounded-full', className)}>
      {children}
    </span>
  );
}