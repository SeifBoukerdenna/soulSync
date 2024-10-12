// hooks/useFetchMedia.ts

import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebaseConfig';
import { useQuery } from '@tanstack/react-query';
import { MediaItem } from '@/interfaces/MediaItem';

const fetchMedia = async (): Promise<MediaItem[]> => {
  const imagesRef = ref(storage, 'images/');
  const videosRef = ref(storage, 'videos/');

  const imagesList = await listAll(imagesRef);
  const videosList = await listAll(videosRef);

  const imagePromises = imagesList.items.map(async item => {
    const url = await getDownloadURL(item);
    return { uri: url, type: 'image' as const };
  });

  const videoPromises = videosList.items.map(async item => {
    const url = await getDownloadURL(item);
    return { uri: url, type: 'video' as const };
  });

  const images = await Promise.all(imagePromises);
  const videos = await Promise.all(videoPromises);

  return [...images, ...videos];
};

export const useFetchMedia = () => {
  return useQuery<MediaItem[], Error>({
    queryKey: ['media'],
    queryFn: fetchMedia,
    staleTime: 10 * 1000, // 10 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent automatic refetch on mount
    // Optional: Set to true if you want to allow refetching on background updates
  });
};
