import { Share, Platform } from 'react-native';

export async function showNativeShare(data: { url: string; title: string; text?: string }) {
  const message = data.text ? `${data.text}\n${data.url}` : data.url;

  await Share.share(
    Platform.OS === 'ios'
      ? { url: data.url, title: data.title, message: data.text || undefined }
      : { message, title: data.title },
  );
}
