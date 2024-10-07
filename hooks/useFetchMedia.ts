import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebaseConfig';
import { useQuery } from '@tanstack/react-query';
import { MediaItem } from '@/app/(tabs)/explore';

const fetchMedia = async (): Promise<MediaItem[]> => {
  const imagesRef = ref(storage, 'images/');
  const videosRef = ref(storage, 'videos/');

  const imagesList = await listAll(imagesRef);
  const videosList = await listAll(videosRef);

  const imagePromises = imagesList.items.map(async item => {
    const url = await getDownloadURL(item);
    return { uri: url, type: 'image' as const }; // Explicitly mark 'image' type
  });

  const videoPromises = videosList.items.map(async item => {
    const url = await getDownloadURL(item);
    return { uri: url, type: 'video' as const }; // Explicitly mark 'video' type
  });

  const images = await Promise.all(imagePromises);
  const videos = await Promise.all(videoPromises);

  return [...images, ...videos]; // Return combined array of MediaItems
};

export const useFetchMedia = () => {
  return useQuery<MediaItem[], Error>({
    queryKey: ['media'],
    queryFn: fetchMedia, // Your fetchMedia logic
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Do not refetch automatically when the component mounts
  });
};
