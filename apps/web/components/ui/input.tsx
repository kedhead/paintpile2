import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const FIELD_CLASSES = cn(
  'w-full rounded-[10px] border-[1.5px] border-edge bg-surface-alt px-3.5 py-2.5 text-sm text-ink',
  'placeholder:text-ink-subtle',
  'transition-colors focus:border-primary focus:bg-surface-raised focus:outline-none focus:ring-[3px] focus:ring-primary/10',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(FIELD_CLASSES, className)} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(FIELD_CLASSES, 'min-h-[100px]', className)} {...props} />;
  },
);
