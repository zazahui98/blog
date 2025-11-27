'use client';

import { useState, useCallback } from 'react';

// 验证规则类型
type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

// 通用表单验证 Hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});

  // 验证单个字段
  const validateField = useCallback((name: keyof T, value: T[keyof T]): string | undefined => {
    const fieldRules = rules[name];
    if (!fieldRules) return undefined;

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
    return undefined;
  }, [rules]);

  // 验证所有字段
  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors<T> = {};
    let isValid = true;

    for (const key of Object.keys(values) as (keyof T)[]) {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // 设置字段值
  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 如果字段已被触摸，立即验证
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // 设置多个字段值
  const setMultipleValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // 处理字段失焦
  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  // 重置表单
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // 检查表单是否有效
  const isValid = Object.keys(errors).every(key => !errors[key as keyof T]);

  return {
    values,
    errors,
    touched,
    setValue,
    setMultipleValues,
    handleBlur,
    validateAll,
    reset,
    isValid,
  };
}

// 常用验证规则
export const validationRules = {
  required: (message = '此字段为必填项'): ValidationRule<any> => ({
    validate: (value) => value !== undefined && value !== null && value !== '',
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length >= min,
    message: message || `至少需要 ${min} 个字符`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length <= max,
    message: message || `最多 ${max} 个字符`,
  }),

  email: (message = '请输入有效的邮箱地址'): ValidationRule<string> => ({
    validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  url: (message = '请输入有效的URL'): ValidationRule<string> => ({
    validate: (value) => !value || /^https?:\/\/.+/.test(value),
    message,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value) => !value || regex.test(value),
    message,
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value === undefined || value >= min,
    message: message || `最小值为 ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value === undefined || value <= max,
    message: message || `最大值为 ${max}`,
  }),
};
