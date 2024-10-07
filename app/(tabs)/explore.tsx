import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFetchMedia } from '@/hooks/useFetchMedia';
import { useUploadMedia } from '@/hooks/useUploadMedia';
import * as ImagePicker from 'expo-image-picker';
import useZenModeStore from '@/stores/useZenModeStore';
import LoadingSpinner from '@/components/misc/LoadingSpinner';
import MediaGrid from '@/components/media/MediaGrid';
import ProgressBar from '@/components/misc/ProgressBar';
import useMediaStore from '@/stores/useMediaStore';
import { shuffleArray } from '@/utils/shuffleArray';

const ExploreScreen = () => {
    const { data: mediaList, isLoading, refetch } = useFetchMedia();
    const { isZenMode } = useZenModeStore();
    const { numberOfMediaItems } = useMediaStore();

    const [progress, setProgress] = useState(0);
    const [shuffledMedia, setShuffledMedia] = useState<string[]>([]);
    const [gridKey, setGridKey] = useState(0);

    const shuffleAndSetMedia = useCallback((media: string[]) => {
        const shuffled = shuffleArray([...media]);
        setShuffledMedia(shuffled);
        setGridKey(prevKey => prevKey + 1);
    }, []);

    useEffect(() => {
        if (mediaList) {
            shuffleAndSetMedia(mediaList);
        }
    }, [mediaList, shuffleAndSetMedia]);

    const limitedMediaList = useMemo(() => {
        return shuffledMedia?.slice(0, numberOfMediaItems);
    }, [shuffledMedia, numberOfMediaItems]);

    const handlePickAndUploadImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.75,
        });

        if (!result.canceled) {
            const { uri } = result.assets[0];
            useUploadMedia(uri, refetch, setProgress);
        }
    };

    const handleRefetchMedia = useCallback(async () => {
        await refetch();
        if (mediaList) {
            shuffleAndSetMedia(mediaList);
        }
    }, [refetch, shuffleAndSetMedia, mediaList]);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => {
                setProgress(0);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [progress]);

    const mediaGrid = useMemo(() => {
        if (isLoading) {
            return <LoadingSpinner />;
        }
        return (
            <MediaGrid
                key={gridKey}
                mediaList={limitedMediaList || []}
                refetchMedia={refetch}
            />
        );
    }, [limitedMediaList, isLoading, refetch, gridKey]);

    return (
        <SafeAreaView style={[styles.container, isZenMode && styles.zenMode]}>
            <View>
                <Text style={[styles.title, isZenMode && styles.zenModeTitle]}>
                    Explore Media
                </Text>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        onPress={handlePickAndUploadImage}
                        style={[styles.uploadButton, isZenMode && styles.zenModeButton]}
                    >
                        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleRefetchMedia}
                        style={[styles.refetchButton, isZenMode && styles.zenModeButton]}
                    >
                        <Ionicons name="refresh-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {progress > 0 && <ProgressBar progress={progress} />}

            <View style={styles.gridContainer}>
                {mediaGrid}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F5',
    },
    zenMode: {
        backgroundColor: '#1C1C1E',
    },
    gridContainer: {
        flex: 1,
        marginTop: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    zenModeTitle: {
        color: '#E5E5EA',
        fontWeight: '400',
    },
    buttonsContainer: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    uploadButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        flex: 0.45,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    refetchButton: {
        backgroundColor: '#FF3B30',
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        flex: 0.45,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    zenModeButton: {
        backgroundColor: '#8BC34A',
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default ExploreScreen;
