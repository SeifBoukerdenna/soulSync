import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebaseConfig';
import { useQuery } from '@tanstack/react-query';

const fetchMedia = async (): Promise<string[]> => {
  const imagesRef = ref(storage, 'images/');
  const imagesList = await listAll(imagesRef);
  const imagePromises = imagesList.items.map(item => getDownloadURL(item));
  return await Promise.all(imagePromises);
};

export const useFetchMedia = () => {
  return useQuery<string[], Error>({
    queryKey: ['media'], // Define queryKey here
    queryFn: fetchMedia, // Use the fetchMedia function here
  });
};
