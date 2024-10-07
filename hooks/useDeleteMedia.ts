import { ref, deleteObject } from 'firebase/storage';
import { storage } from '@/firebaseConfig';

export const useDeleteMedia = () => {
  const deleteMedia = async (imageUri: string, refetch: () => void) => {
    try {
      const filePath = getFilePathFromUrl(imageUri);

      const imageRef = ref(storage, filePath);

      await deleteObject(imageRef);

      refetch();
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  return { deleteMedia };
};

const getFilePathFromUrl = (url: string) => {
  const decodedUrl = decodeURIComponent(url);
  const pathStartIndex = decodedUrl.indexOf('/o/') + 3;
  const pathEndIndex = decodedUrl.indexOf('?');
  const filePath = decodedUrl.substring(pathStartIndex, pathEndIndex);
  return filePath;
};
