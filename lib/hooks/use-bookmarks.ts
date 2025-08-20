import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, CreateBookmarkInput, UpdateBookmarkInput } from '../db';

// Fetch all bookmarks
export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async (): Promise<Bookmark[]> => {
      const response = await fetch('/api/bookmarks');
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }
      return response.json();
    },
  });
}

// Fetch parent options for dropdown
export function useParentOptions() {
  return useQuery({
    queryKey: ['bookmark-parents'],
    queryFn: async (): Promise<{ id: string; title: string; level: number }[]> => {
      const response = await fetch('/api/bookmarks/parents');
      if (!response.ok) {
        throw new Error('Failed to fetch parent options');
      }
      return response.json();
    },
  });
}

// Create bookmark
export function useCreateBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookmark: CreateBookmarkInput): Promise<Bookmark> => {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookmark),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create bookmark');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['bookmark-parents'] });
    },
  });
}

// Update bookmark
export function useUpdateBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...bookmark }: UpdateBookmarkInput & { id: string }): Promise<Bookmark> => {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookmark),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update bookmark');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['bookmark-parents'] });
    },
  });
}

// Delete bookmark
export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete bookmark');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['bookmark-parents'] });
    },
  });
}

// Reorder bookmarks
export function useReorderBookmarks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookmarkOrders: { id: string; order: number }[]): Promise<void> => {
      const response = await fetch('/api/bookmarks/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookmarkOrders }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reorder bookmarks');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

// Move bookmark to different parent
export function useMoveBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { 
      sourceId: string; 
      targetId: string; 
      newParentId?: string; 
      insertIndex?: number 
    }): Promise<void> => {
      const response = await fetch('/api/bookmarks/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move bookmark');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['bookmark-parents'] });
    },
  });
}
