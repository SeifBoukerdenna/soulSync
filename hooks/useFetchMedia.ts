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
    return { uri: url, type: 'image' as const }; // Specify type as 'image'
  });

  const videoPromises = videosList.items.map(async item => {
    const url = await getDownloadURL(item);
    return { uri: url, type: 'video' as const }; // Specify type as 'video'
  });

  const images = await Promise.all(imagePromises);
  const videos = await Promise.all(videoPromises);

  return [...images, ...videos]; // Merge both images and videos into one array
};

export const useFetchMedia = () => {
  return useQuery<MediaItem[], Error>({
    queryKey: ['media'],
    queryFn: fetchMedia,
    staleTime: 0, // Ensures data is never considered stale
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });
};
