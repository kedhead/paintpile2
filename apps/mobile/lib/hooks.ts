import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getClient, getFileUrl } from './pocketbase';
import { useAuth } from './auth-context';

// --- Feed ---
export function useDiscoverFeed() {
  const pb = getClient();
  return useInfiniteQuery({
    queryKey: ['feed', 'discover'],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await pb.collection('posts').getList(pageParam, 20, {
        sort: '-created',
        expand: 'user',
      });
      return { items: result.items, totalPages: result.totalPages };
    },
    getNextPageParam: (lastPage, pages) =>
      pages.length < lastPage.totalPages ? pages.length + 1 : undefined,
    initialPageParam: 1,
  });
}

// --- Projects ---
export function useMyProjects() {
  const pb = getClient();
  const { user } = useAuth();
  return useQuery({
    queryKey: ['projects', 'my', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const result = await pb.collection('projects').getFullList({
        filter: `user = "${user.id}"`,
        sort: '-created',
      });
      return result;
    },
    enabled: !!user,
  });
}

export function useProject(id: string) {
  const pb = getClient();
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => pb.collection('projects').getOne(id, { expand: 'user' }),
    enabled: !!id,
  });
}

export function useProjectPhotos(projectId: string) {
  const pb = getClient();
  return useQuery({
    queryKey: ['project-photos', projectId],
    queryFn: async () => {
      const result = await pb.collection('photos').getFullList({
        filter: `project = "${projectId}"`,
        sort: '-created',
      });
      return result;
    },
    enabled: !!projectId,
  });
}

// --- Notifications ---
export function useNotifications() {
  const pb = getClient();
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const result = await pb.collection('notifications').getList(1, 50, {
        filter: `user = "${user.id}"`,
        sort: '-created',
        expand: 'actor',
      });
      return result.items;
    },
    enabled: !!user,
  });
}

export function useUnreadCount() {
  const pb = getClient();
  const { user } = useAuth();
  return useQuery({
    queryKey: ['unread-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const result = await pb.collection('notifications').getList(1, 1, {
        filter: `user = "${user.id}" && read = false`,
      });
      return result.totalItems;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
}

// --- Profile ---
export function useUserProfile(userId: string) {
  const pb = getClient();
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => pb.collection('users').getOne(userId),
    enabled: !!userId,
  });
}

export { getFileUrl };
