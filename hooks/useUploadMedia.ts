import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebaseConfig';

/**
 * Uploads media (image or video) to Firebase storage.
 *
 * @param {string} uri - The URI of the media file.
 * @param {boolean} isVideo - Whether the media is a video.
 * @param {Function} refetch - Function to refetch the media list after uploading.
 * @param {Function} setProgress - Function to update upload progress.
 */
export const useUploadMedia = async (
  uri: string,
  isVideo: boolean,
  refetch: () => void,
  setProgress: (progress: number) => void
) => {
  try {
    // Determine storage path based on media type (image or video)
    const folder = isVideo ? 'videos/' : 'images/';
    const fileExtension = isVideo ? '.mp4' : '.jpg';
    const mediaRef = ref(
      storage,
      `${folder}${new Date().getTime()}-media${fileExtension}`
    );

    // Fetch the file blob from the URI
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload the media file to Firebase storage
    const uploadTask = uploadBytesResumable(mediaRef, blob);

    // Track upload progress
    uploadTask.on(
      'state_changed',
      snapshot => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress); // Update progress
      },
      error => {
        console.error('Error uploading media:', error);
      },
      async () => {
        // Upload complete: get download URL and refetch media
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        refetch(); // Refetch the media list
        setProgress(100); // Mark progress as complete
      }
    );
  } catch (error) {
    console.error('Error during media upload:', error);
  }
};
