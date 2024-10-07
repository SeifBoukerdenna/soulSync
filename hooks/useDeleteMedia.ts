import { ref, deleteObject } from 'firebase/storage';
import { storage } from '@/firebaseConfig';

export const useDeleteMedia = () => {
  const deleteMedia = async (imageUri: string, refetch: () => void) => {
    try {
      // Extract the correct file path from the download URL
      const filePath = getFilePathFromUrl(imageUri); // Use the helper function below

      // Create a reference to the file in Firebase Storage
      const imageRef = ref(storage, filePath);

      // Delete the file from Firebase Storage
      await deleteObject(imageRef);

      // Refetch the media list after deletion
      refetch();
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  return { deleteMedia };
};

// Helper function to extract the file path from the download URL
const getFilePathFromUrl = (url: string) => {
  // Example URL: https://firebasestorage.googleapis.com/v0/b/soulsync-db4ba.appspot.com/o/images%2F1728248498175-photo.jpg?alt=media&token=xyz
  const decodedUrl = decodeURIComponent(url); // Decode the URL first
  const pathStartIndex = decodedUrl.indexOf('/o/') + 3; // Find the start of the file path
  const pathEndIndex = decodedUrl.indexOf('?'); // Find the end of the file path before query parameters
  const filePath = decodedUrl.substring(pathStartIndex, pathEndIndex); // Extract the path
  return filePath; // Return the correct file path, e.g., "images/1728248498175-photo.jpg"
};
