import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type WebView from 'react-native-webview';

interface PickResult {
  base64: string;
  fileName: string;
  mimeType: string;
}

async function pickFromLibrary(multiple: boolean): Promise<PickResult[]> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Please allow photo library access in Settings.');
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: multiple,
    base64: true,
    quality: 0.8,
  });

  if (result.canceled) return [];

  return result.assets
    .filter((a) => a.base64)
    .map((a, i) => ({
      base64: a.base64!,
      fileName: a.fileName || `photo_${i}.jpg`,
      mimeType: a.mimeType || 'image/jpeg',
    }));
}

async function takePhoto(): Promise<PickResult[]> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Please allow camera access in Settings.');
    return [];
  }

  const result = await ImagePicker.launchCameraAsync({
    base64: true,
    quality: 0.8,
  });

  if (result.canceled) return [];

  return result.assets
    .filter((a) => a.base64)
    .map((a, i) => ({
      base64: a.base64!,
      fileName: a.fileName || `photo_${i}.jpg`,
      mimeType: a.mimeType || 'image/jpeg',
    }));
}

export function showImagePicker(
  webViewRef: React.RefObject<WebView | null>,
  multiple: boolean,
) {
  const options = ['Take Photo', 'Choose from Library', 'Cancel'];
  const cancelIndex = 2;

  Alert.alert('Select Image', '', [
    {
      text: options[0],
      onPress: async () => {
        const results = await takePhoto();
        injectFilesToWebView(webViewRef, results);
      },
    },
    {
      text: options[1],
      onPress: async () => {
        const results = await pickFromLibrary(multiple);
        injectFilesToWebView(webViewRef, results);
      },
    },
    { text: options[2], style: 'cancel' },
  ]);
}

function injectFilesToWebView(
  webViewRef: React.RefObject<WebView | null>,
  files: PickResult[],
) {
  if (files.length === 0) return;

  // Build JS that creates File objects from base64 and sets them on the file input
  const filesJS = files
    .map(
      (f, i) => `
      var base64_${i} = '${f.base64}';
      var byteChars_${i} = atob(base64_${i});
      var byteArray_${i} = new Uint8Array(byteChars_${i}.length);
      for (var j = 0; j < byteChars_${i}.length; j++) byteArray_${i}[j] = byteChars_${i}.charCodeAt(j);
      var blob_${i} = new Blob([byteArray_${i}], { type: '${f.mimeType}' });
      var file_${i} = new File([blob_${i}], '${f.fileName}', { type: '${f.mimeType}' });
      dt.items.add(file_${i});
    `,
    )
    .join('\n');

  const js = `
    (function() {
      try {
        var dt = new DataTransfer();
        ${filesJS}
        var input = document.querySelector('input[type="file"][data-native-pick="true"]');
        if (!input) input = document.querySelector('input[type="file"]');
        if (input) {
          input.files = dt.files;
          input.removeAttribute('data-native-pick');
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } catch(e) {
        console.error('Native image inject failed:', e);
      }
    })(); true;
  `;

  webViewRef.current?.injectJavaScript(js);
}
