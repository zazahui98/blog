'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface BaseFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

interface InputFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

interface TextareaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  rows?: number;
}

// 输入框组件
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, required, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white 
            placeholder-gray-500 focus:outline-none transition-colors
            ${error 
              ? 'border-red-500/50 focus:border-red-500' 
              : 'border-slate-700/50 focus:border-cyan-500/50'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-sm text-red-400"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <p className="text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);
InputField.displayName = 'InputField';


// 文本域组件
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, required, rows = 4, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white 
            placeholder-gray-500 focus:outline-none transition-colors resize-none
            ${error 
              ? 'border-red-500/50 focus:border-red-500' 
              : 'border-slate-700/50 focus:border-cyan-500/50'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-sm text-red-400"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <p className="text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);
TextareaField.displayName = 'TextareaField';

// 选择框组件
interface SelectFieldProps extends BaseFieldProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function SelectField({
  label,
  error,
  hint,
  required,
  options,
  value,
  onChange,
  placeholder = '请选择',
}: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white 
          focus:outline-none transition-colors appearance-none cursor-pointer
          ${error 
            ? 'border-red-500/50 focus:border-red-500' 
            : 'border-slate-700/50 focus:border-cyan-500/50'
          }
        `}
      >
        <option value="" className="bg-slate-800">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-800">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-sm text-red-400"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
}
