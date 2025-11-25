/**
 * Supabase 数据库类型定义
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'editor' | 'user';
export type PostStatus = 'draft' | 'published' | 'archived';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          last_login_ip: string | null;
          last_login_device: string | null;
          last_login_device_model: string | null;
          last_login_os: string | null;
          last_login_browser: string | null;
          login_count: number;
          email?: string; // 从视图中添加的邮箱字段
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          last_login_ip?: string | null;
          last_login_device?: string | null;
          last_login_device_model?: string | null;
          last_login_os?: string | null;
          last_login_browser?: string | null;
          login_count?: number;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          last_login_ip?: string | null;
          last_login_device?: string | null;
          last_login_device_model?: string | null;
          last_login_os?: string | null;
          last_login_browser?: string | null;
          login_count?: number;
        };
      };
      user_profiles_with_email: { // 新增的视图定义
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          last_login_ip: string | null;
          last_login_device: string | null;
          last_login_device_model: string | null;
          last_login_os: string | null;
          last_login_browser: string | null;
          login_count: number;
          email: string | null; // 从auth.users表获取的邮箱
        };
        Insert: never; // 视图不支持插入
        Update: never; // 视图不支持更新
      };
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          slug: string;
          excerpt: string;
          cover_image: string;
          tags: string[];
          views: number;
          likes: number;
          created_at: string;
          updated_at: string;
          published: boolean;
          author_id: string | null;
          status: PostStatus;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          slug: string;
          excerpt: string;
          cover_image: string;
          tags?: string[];
          views?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
          published?: boolean;
          author_id?: string | null;
          status?: PostStatus;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          slug?: string;
          excerpt?: string;
          cover_image?: string;
          tags?: string[];
          views?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
          published?: boolean;
          author_id?: string | null;
          status?: PostStatus;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_name: string;
          author_email: string;
          content: string;
          created_at: string;
          user_id: string | null;
          is_approved: boolean;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_name: string;
          author_email: string;
          content: string;
          created_at?: string;
          user_id?: string | null;
          is_approved?: boolean;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_name?: string;
          author_email?: string;
          content?: string;
          created_at?: string;
          user_id?: string | null;
          is_approved?: boolean;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      post_categories: {
        Row: {
          post_id: string;
          category_id: string;
        };
        Insert: {
          post_id: string;
          category_id: string;
        };
        Update: {
          post_id?: string;
          category_id?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          details: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      comment_likes: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          comment_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      comment_replies: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string;
          author_name: string;
          content: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          user_id: string;
          author_name: string;
          content: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          comment_id?: string;
          user_id?: string;
          author_name?: string;
          content?: string;
          is_approved?: boolean;
          created_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          content: string | null;
          cover_image: string;
          tags: string[];
          github_url: string | null;
          demo_url: string | null;
          stars: number;
          forks: number;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          content?: string | null;
          cover_image: string;
          tags?: string[];
          github_url?: string | null;
          demo_url?: string | null;
          stars?: number;
          forks?: number;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          content?: string | null;
          cover_image?: string;
          tags?: string[];
          github_url?: string | null;
          demo_url?: string | null;
          stars?: number;
          forks?: number;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      about_settings: {
        Row: {
          id: string;
          avatar_icon: string;
          intro: string;
          skills: Json;
          stats: Json;
          philosophies: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          avatar_icon?: string;
          intro: string;
          skills?: Json;
          stats?: Json;
          philosophies?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          avatar_icon?: string;
          intro?: string;
          skills?: Json;
          stats?: Json;
          philosophies?: Json;
          updated_at?: string;
        };
      };
      login_history: {
        Row: {
          id: string;
          user_id: string | null;
          login_at: string;
          ip_address: string | null;
          device_type: string | null;
          device_brand: string | null;
          device_model: string | null;
          os_name: string | null;
          os_version: string | null;
          browser_name: string | null;
          browser_version: string | null;
          user_agent: string | null;
          location_country: string | null;
          location_city: string | null;
          is_successful: boolean;
          failure_reason: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          login_at?: string;
          ip_address?: string | null;
          device_type?: string | null;
          device_brand?: string | null;
          device_model?: string | null;
          os_name?: string | null;
          os_version?: string | null;
          browser_name?: string | null;
          browser_version?: string | null;
          user_agent?: string | null;
          location_country?: string | null;
          location_city?: string | null;
          is_successful?: boolean;
          failure_reason?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          login_at?: string;
          ip_address?: string | null;
          device_type?: string | null;
          device_brand?: string | null;
          device_model?: string | null;
          os_name?: string | null;
          os_version?: string | null;
          browser_name?: string | null;
          browser_version?: string | null;
          user_agent?: string | null;
          location_country?: string | null;
          location_city?: string | null;
          is_successful?: boolean;
          failure_reason?: string | null;
        };
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      post_stats: {
        Row: {
          id: string;
          title: string;
          author_id: string | null;
          author_name: string | null;
          views: number;
          likes: number;
          comment_count: number;
          created_at: string;
          status: PostStatus;
        };
      };
      user_stats: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          role: UserRole;
          post_count: number;
          comment_count: number;
          created_at: string;
        };
      };
      posts_with_likes: {
        Row: {
          id: string;
          title: string;
          content: string;
          slug: string;
          excerpt: string;
          cover_image: string;
          tags: string[];
          views: number;
          likes: number;
          created_at: string;
          updated_at: string;
          published: boolean;
          author_id: string | null;
          status: PostStatus;
          like_count: number;
          user_liked: number;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      post_status: PostStatus;
    };
  };
}
