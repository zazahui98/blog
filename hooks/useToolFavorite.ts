'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  favoriteTool, 
  unfavoriteTool, 
  checkToolFavorite,
  getUserFavoriteTools,
  recordToolUsage
} from '@/lib/supabase-helpers';
import { getCurrentUser } from '@/lib/auth';

interface UseToolFavoriteReturn {
  isFavorited: boolean;
  isLoading: boolean;
  toggleFavorite: () => Promise<void>;
  recordUsage: () => Promise<void>;
}

export function useToolFavorite(toolId: string): UseToolFavoriteReturn {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      setUserId(user?.id || null);
      
      if (user?.id) {
        const { isFavorited: favorited } = await checkToolFavorite(toolId, user.id);
        setIsFavorited(favorited);
      }
      setIsLoading(false);
    };
    
    init();
  }, [toolId]);

  const toggleFavorite = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      if (isFavorited) {
        await unfavoriteTool(toolId, userId);
        setIsFavorited(false);
      } else {
        await favoriteTool(toolId, userId);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toolId, userId, isFavorited]);

  const recordUsage = useCallback(async () => {
    if (!userId) return;
    
    try {
      await recordToolUsage(toolId, userId);
    } catch (error) {
      console.error('Failed to record usage:', error);
    }
  }, [toolId, userId]);

  return {
    isFavorited,
    isLoading,
    toggleFavorite,
    recordUsage,
  };
}

// 获取用户所有收藏的工具
export function useUserFavoriteTools() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      const user = await getCurrentUser();
      if (user?.id) {
        const { data } = await getUserFavoriteTools(user.id);
        if (data) {
          setFavorites(data.map(f => f.tool_id));
        }
      }
      setIsLoading(false);
    };
    
    loadFavorites();
  }, []);

  return { favorites, isLoading };
}
