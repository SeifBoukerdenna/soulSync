import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebaseConfig';

export const useUploadMedia = async (
  uri: string,
  refetch: () => void,
  setProgress: (progress: number) => void // Accept progress callback
) => {
  const response = await fetch(uri);
  const blob = await response.blob();

  // Determine media type by the MIME type or file extension
  const isVideo =
    blob.type.startsWith('video/') ||
    uri.endsWith('.mp4') ||
    uri.endsWith('.mov');
  const fileType = isVideo ? 'video' : 'image';

  // Save video files in a separate folder
  const mediaRef = ref(
    storage,
    `${fileType}s/${new Date().getTime()}-${fileType}.jpg`
  );

  const uploadTask = uploadBytesResumable(mediaRef, blob);

  uploadTask.on(
    'state_changed',
    snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setProgress(progress); // Update progress
    },
    error => console.error(`Error uploading ${fileType}:`, error),
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      refetch(); // Call refetch to update the media list after upload
      setProgress(100); // Complete the progress
    }
  );
};
