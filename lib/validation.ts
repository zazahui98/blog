/**
 * 输入验证模块
 * 使用简单的验证函数，无需额外依赖
 */

// 验证结果类型
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// 评论验证
export function validateComment(data: { content: string; post_id?: string }): ValidationResult {
  const errors: string[] = [];

  if (!data.content || data.content.trim().length === 0) {
    errors.push('评论内容不能为空');
  } else if (data.content.length > 5000) {
    errors.push('评论内容不能超过5000字');
  }

  if (data.post_id && !isValidUUID(data.post_id)) {
    errors.push('无效的文章ID');
  }

  return { isValid: errors.length === 0, errors };
}

// 用户名验证
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];

  if (!username || username.trim().length === 0) {
    errors.push('用户名不能为空');
  } else if (username.length < 2) {
    errors.push('用户名至少需要2个字符');
  } else if (username.length > 30) {
    errors.push('用户名不能超过30个字符');
  } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    errors.push('用户名只能包含字母、数字、下划线和中文');
  }

  return { isValid: errors.length === 0, errors };
}

// 邮箱验证
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.trim().length === 0) {
    errors.push('邮箱不能为空');
  } else if (!emailRegex.test(email)) {
    errors.push('请输入有效的邮箱地址');
  }

  return { isValid: errors.length === 0, errors };
}


// 密码验证
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push('密码不能为空');
  } else {
    if (password.length < 8) {
      errors.push('密码至少需要8个字符');
    }
    if (password.length > 100) {
      errors.push('密码不能超过100个字符');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('密码需要包含至少一个大写字母');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('密码需要包含至少一个小写字母');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('密码需要包含至少一个数字');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// URL验证
export function validateURL(url: string): ValidationResult {
  const errors: string[] = [];

  if (url && url.trim().length > 0) {
    try {
      new URL(url);
    } catch {
      errors.push('请输入有效的URL');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// UUID验证
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 文章验证
export function validatePost(data: {
  title: string;
  content: string;
  slug?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('标题不能为空');
  } else if (data.title.length > 200) {
    errors.push('标题不能超过200个字符');
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push('内容不能为空');
  }

  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug只能包含小写字母、数字和连字符');
  }

  return { isValid: errors.length === 0, errors };
}

// 项目验证
export function validateProject(data: {
  title: string;
  description: string;
  github_url?: string;
  demo_url?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('项目名称不能为空');
  } else if (data.title.length > 100) {
    errors.push('项目名称不能超过100个字符');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('项目描述不能为空');
  } else if (data.description.length > 500) {
    errors.push('项目描述不能超过500个字符');
  }

  if (data.github_url) {
    const urlResult = validateURL(data.github_url);
    if (!urlResult.isValid) {
      errors.push('GitHub URL无效');
    }
  }

  if (data.demo_url) {
    const urlResult = validateURL(data.demo_url);
    if (!urlResult.isValid) {
      errors.push('演示URL无效');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// XSS 防护 - 简单的HTML转义
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// 清理用户输入
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // 多个空格替换为单个
    .slice(0, 10000); // 限制长度
}
