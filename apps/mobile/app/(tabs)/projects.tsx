import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMyProjects, getFileUrl } from '@/lib/hooks';
import type { RecordModel } from 'pocketbase';

function ProjectCard({ project }: { project: RecordModel }) {
  const coverUrl = project.cover_photo
    ? getFileUrl(project, project.cover_photo, '400x300')
    : null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/project/${project.id}`)}
      className="mb-3 overflow-hidden rounded-xl border border-border bg-card"
      activeOpacity={0.7}
    >
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} className="h-40 w-full" contentFit="cover" />
      ) : (
        <View className="h-40 items-center justify-center bg-card">
          <Text style={{ fontSize: 32 }}>🎨</Text>
        </View>
      )}
      <View className="p-3">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {project.name}
        </Text>
        {project.description ? (
          <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={2}>
            {project.description}
          </Text>
        ) : null}
        <View className="mt-2 flex-row items-center gap-3">
          <Text className="text-xs text-muted-foreground">
            📷 {project.photo_count || 0} photos
          </Text>
          <View
            className={`rounded-full px-2 py-0.5 ${
              project.status === 'completed' ? 'bg-green-900/30' : 'bg-primary/10'
            }`}
          >
            <Text
              className={`text-[10px] font-medium ${
                project.status === 'completed' ? 'text-green-400' : 'text-primary'
              }`}
            >
              {project.status || 'in progress'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProjectsScreen() {
  const { data: projects, isLoading, refetch, isRefetching } = useMyProjects();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#006bcd" />
      </View>
    );
  }

  return (
    <FlatList
      data={projects || []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProjectCard project={item} />}
      contentContainerClassName="px-4 py-3"
      className="bg-background"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#006bcd" />
      }
      ListEmptyComponent={
        <View className="items-center py-20">
          <Text className="text-lg text-muted-foreground">No projects yet</Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Create your first project on the web app
          </Text>
        </View>
      }
    />
  );
}
