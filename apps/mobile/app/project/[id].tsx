import { View, Text, ScrollView, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useProject, useProjectPhotos, getFileUrl } from '@/lib/hooks';
import type { RecordModel } from 'pocketbase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - 32 - 8) / 3; // 3 columns with gaps

function PhotoGrid({ photos }: { photos: RecordModel[] }) {
  if (!photos.length) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground">No photos yet</Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-1">
      {photos.map((photo) => {
        const url = photo.image ? getFileUrl(photo, photo.image, '300x300') : null;
        if (!url) return null;
        return (
          <Image
            key={photo.id}
            source={{ uri: url }}
            style={{ width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 6 }}
            contentFit="cover"
          />
        );
      })}
    </View>
  );
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id);
  const { data: photos = [] } = useProjectPhotos(id);

  if (isLoading || !project) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#006bcd" />
      </View>
    );
  }

  const coverUrl = project.cover_photo
    ? getFileUrl(project, project.cover_photo, '800x600')
    : null;
  const author = project.expand?.user;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-8">
      {/* Cover */}
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} className="h-56 w-full" contentFit="cover" />
      ) : (
        <View className="h-40 items-center justify-center bg-card">
          <Text style={{ fontSize: 48 }}>🎨</Text>
        </View>
      )}

      <View className="px-4 pt-4 gap-4">
        {/* Title + Status */}
        <View>
          <Text className="text-2xl font-bold text-foreground">{project.name}</Text>
          <View className="mt-2 flex-row items-center gap-3">
            {author && (
              <Text className="text-sm text-muted-foreground">by {author.name}</Text>
            )}
            <View
              className={`rounded-full px-2 py-0.5 ${
                project.status === 'completed' ? 'bg-green-900/30' : 'bg-primary/10'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  project.status === 'completed' ? 'text-green-400' : 'text-primary'
                }`}
              >
                {project.status || 'in progress'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {project.description ? (
          <Text className="text-sm leading-5 text-foreground">{project.description}</Text>
        ) : null}

        {/* Stats */}
        <View className="flex-row gap-4">
          <Text className="text-xs text-muted-foreground">❤️ {project.like_count || 0} likes</Text>
          <Text className="text-xs text-muted-foreground">💬 {project.comment_count || 0} comments</Text>
          <Text className="text-xs text-muted-foreground">📷 {photos.length} photos</Text>
        </View>

        {/* Photos */}
        <View>
          <Text className="mb-3 text-sm font-semibold text-foreground">Progress Photos</Text>
          <PhotoGrid photos={photos} />
        </View>
      </View>
    </ScrollView>
  );
}
