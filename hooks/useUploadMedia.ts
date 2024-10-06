import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebaseConfig';

export const useUploadMedia = async (
  uri: string,
  refetch: () => void // Accept the refetch function from React Query
) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const imageRef = ref(storage, `images/${new Date().getTime()}-photo.jpg`);

  const uploadTask = uploadBytesResumable(imageRef, blob);

  uploadTask.on(
    'state_changed',
    () => {
      // progress tracking logic (optional)
    },
    error => console.error('Error uploading image:', error),
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      refetch(); // Call refetch to update the media list after upload
    }
  );
};
