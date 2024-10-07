import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebaseConfig';

export const useUploadMedia = async (
  uri: string,
  refetch: () => void,
  setProgress: (progress: number) => void // Accept progress callback
) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const imageRef = ref(storage, `images/${new Date().getTime()}-photo.jpg`);

  const uploadTask = uploadBytesResumable(imageRef, blob);

  uploadTask.on(
    'state_changed',
    snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setProgress(progress); // Update progress
    },
    error => console.error('Error uploading image:', error),
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      refetch(); // Call refetch to update the media list after upload
      setProgress(100); // Complete the progress
    }
  );
};
