/**
 * 错误信息映射工具
 * 将系统错误信息转换为用户友好的中文提示
 */

/**
 * 将英文错误信息转换为中文提示
 * @param error 错误对象或错误信息
 * @returns 用户友好的中文错误信息
 */
export function getErrorMessage(error: any): string {
  // 如果错误已经是中文，直接返回
  if (typeof error === 'string' && /[\u4e00-\u9fa5]/.test(error)) {
    return error;
  }

  // 获取错误消息
  let errorMessage = '';
  if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = '未知错误';
  }

  // 转换为小写以便匹配
  const lowerMessage = errorMessage.toLowerCase();

  // 认证相关错误
  if (lowerMessage.includes('invalid login credentials')) {
    return '用户名或密码错误，请检查后重试';
  }
  
  if (lowerMessage.includes('email not confirmed')) {
    return '邮箱尚未验证，请检查邮箱中的验证链接';
  }
  
  if (lowerMessage.includes('user already registered')) {
    return '该邮箱已被注册，请使用其他邮箱或尝试登录';
  }
  
  if (lowerMessage.includes('invalid email')) {
    return '邮箱格式不正确，请输入有效的邮箱地址';
  }
  
  if (lowerMessage.includes('password too short')) {
    return '密码太短，请设置至少6位密码';
  }
  
  if (lowerMessage.includes('weak password')) {
    return '密码强度不足，请包含字母、数字和特殊字符';
  }

  // 权限相关错误
  if (lowerMessage.includes('permission denied') || lowerMessage.includes('access denied')) {
    return '权限不足，无法执行此操作';
  }
  
  if (lowerMessage.includes('not authorized') || lowerMessage.includes('unauthorized')) {
    return '您尚未登录，请先登录后再试';
  }
  
  if (lowerMessage.includes('forbidden')) {
    return '您没有权限访问此资源';
  }

  // 资源相关错误
  if (lowerMessage.includes('not found')) {
    return '请求的资源不存在';
  }
  
  if (lowerMessage.includes('already exists')) {
    return '资源已存在，请勿重复创建';
  }
  
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('unique constraint')) {
    return '数据重复，该信息已存在';
  }

  // 网络相关错误
  if (lowerMessage.includes('network error') || lowerMessage.includes('fetch error')) {
    return '网络连接失败，请检查网络后重试';
  }
  
  if (lowerMessage.includes('timeout')) {
    return '请求超时，请稍后重试';
  }
  
  if (lowerMessage.includes('connection refused')) {
    return '无法连接到服务器，请稍后重试';
  }

  // 服务器相关错误
  if (lowerMessage.includes('server error') || lowerMessage.includes('internal server error')) {
    return '服务器内部错误，请稍后重试';
  }
  
  if (lowerMessage.includes('service unavailable')) {
    return '服务暂时不可用，请稍后重试';
  }

  // 数据库相关错误
  if (lowerMessage.includes('database error') || lowerMessage.includes('sql error')) {
    return '数据库操作失败，请稍后重试';
  }
  
  if (lowerMessage.includes('constraint violation')) {
    return '数据约束违反，请检查输入数据';
  }

  // 文件上传相关错误
  if (lowerMessage.includes('file too large')) {
    return '文件过大，请选择较小的文件';
  }
  
  if (lowerMessage.includes('invalid file type')) {
    return '文件类型不支持，请选择正确的文件格式';
  }
  
  if (lowerMessage.includes('upload failed')) {
    return '文件上传失败，请重试';
  }

  // 邮箱相关错误
  if (lowerMessage.includes('email send failed')) {
    return '邮件发送失败，请检查邮箱地址或稍后重试';
  }
  
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return '请求过于频繁，请稍后再试';
  }

  // 通用错误
  if (lowerMessage.includes('invalid') || lowerMessage.includes('malformed')) {
    return '输入数据格式不正确，请检查后重试';
  }
  
  if (lowerMessage.includes('required') || lowerMessage.includes('missing')) {
    return '缺少必要信息，请填写完整后重试';
  }
  
  if (lowerMessage.includes('failed')) {
    return '操作失败，请稍后重试';
  }

  // 如果没有匹配到特定错误，返回原始错误信息（如果是中文）或通用错误信息
  if (typeof error === 'string' && /[\u4e00-\u9fa5]/.test(error)) {
    return error;
  }
  
  return '操作失败，请稍后重试';
}

/**
 * 显示错误提示
 * @param error 错误对象或错误信息
 * @param callback 可选的回调函数，用于自定义错误显示方式
 */
export function showError(error: any, callback?: (message: string) => void): void {
  const message = getErrorMessage(error);
  
  if (callback) {
    callback(message);
  } else {
    // 默认使用alert显示错误
    alert(message);
  }
}

/**
 * 显示成功提示
 * @param message 成功信息
 * @param callback 可选的回调函数，用于自定义成功显示方式
 */
export function showSuccess(message: string, callback?: (message: string) => void): void {
  if (callback) {
    callback(message);
  } else {
    // 默认使用alert显示成功信息
    alert(message);
  }
}