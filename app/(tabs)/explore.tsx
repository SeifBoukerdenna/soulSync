import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFetchMedia } from '@/hooks/useFetchMedia';
import { useUploadMedia } from '@/hooks/useUploadMedia';
import * as ImagePicker from 'expo-image-picker';
import useZenModeStore from '@/stores/useZenModeStore';
import LoadingSpinner from '@/components/misc/LoadingSpinner';
import MediaGrid from '@/components/media/MediaGrid';
import ProgressBar from '@/components/misc/ProgressBar';
import { shuffleArray } from '@/utils/shuffleArray';
import { useDeleteMedia } from '@/hooks/useDeleteMedia';
import { useSettingsOptions } from '@/hooks/useSettingsOptions';

export interface MediaItem {
    uri: string;
    type: 'image' | 'video';
}

const ExploreScreen = () => {
    const { data: mediaList, isLoading, isFetching, refetch } = useFetchMedia();
    const { isZenMode } = useZenModeStore();
    const { settings } = useSettingsOptions();
    const { deleteMedia } = useDeleteMedia();

    const [progress, setProgress] = useState(0);
    const [shuffledMedia, setShuffledMedia] = useState<MediaItem[]>([]);
    const [gridKey, setGridKey] = useState(0);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const shuffleAndSetMedia = useCallback((media: MediaItem[]) => {
        const shuffled = shuffleArray(media);
        setShuffledMedia(shuffled);
        setGridKey(prevKey => prevKey + 1);
    }, []);

    useEffect(() => {
        if (mediaList) {
            shuffleAndSetMedia(mediaList);
        }
    }, [mediaList, shuffleAndSetMedia]);

    const limitedMediaList = useMemo(() => {
        return shuffledMedia?.slice(0, settings?.numberOfMediaItems);
    }, [shuffledMedia, settings?.numberOfMediaItems]);

    console.log('limitedMediaList:', limitedMediaList.length);

    const handlePickAndUploadMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 0.75,
        });

        if (!result.canceled) {
            const { uri, type } = result.assets[0];
            const isVideo = type === 'video';

            await useUploadMedia(uri, isVideo, () => {
                refetch();
            }, setProgress);
        }
    };

    const handleRefetchMedia = useCallback(async () => {
        await refetch();
        if (mediaList) {
            shuffleAndSetMedia(mediaList);
        }
    }, [refetch, shuffleAndSetMedia, mediaList]);

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) {
            Alert.alert('No Selection', 'Please select items to delete.');
            return;
        }

        const confirmed = await new Promise(resolve => {
            Alert.alert(
                'Delete Selected Photos',
                'Are you sure you want to delete the selected photos?',
                [
                    { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                    { text: 'Delete', onPress: () => resolve(true), style: 'destructive' }
                ],
                { cancelable: true }
            );
        });

        if (confirmed) {
            for (const uri of selectedItems) {
                await deleteMedia(uri, refetch);
            }
            setSelectedItems([]);
            setIsSelectionMode(false);
        }
    };

    const handleSelectionModeToggle = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedItems([]);
    };

    const handleCancelSelection = () => {
        setSelectedItems([]);
        setIsSelectionMode(false);
    };

    const handleSelectItem = (uri: string) => {
        if (selectedItems.includes(uri)) {
            setSelectedItems(selectedItems.filter(item => item !== uri));
        } else {
            setSelectedItems([...selectedItems, uri]);
        }
    };

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => {
                setProgress(0);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [progress]);

    const mediaGrid = useMemo(() => {
        if (isLoading || isFetching) {
            return <LoadingSpinner />;
        }
        return (
            <MediaGrid
                key={gridKey}
                mediaList={limitedMediaList || []}
                refetchMedia={refetch}
                isSelectionMode={isSelectionMode}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
            />
        );
    }, [limitedMediaList, isLoading, isFetching, refetch, gridKey, isSelectionMode, selectedItems]);

    return (
        <SafeAreaView style={[styles.container, isZenMode && styles.zenMode]}>
            <View>
                <Text style={[styles.title, isZenMode && styles.zenModeTitle]}>
                    Explore Media
                </Text>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        onPress={handlePickAndUploadMedia}
                        style={[styles.uploadButton, isZenMode && styles.zenModeButton]}
                    >
                        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                        <Text style={styles.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleRefetchMedia}
                        style={[styles.uploadButton, isZenMode && styles.zenModeButton]}
                    >
                        <Ionicons name="refresh-outline" size={20} color="#fff" />
                        <Text style={styles.uploadButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.selectButtonContainer}>
                    {isSelectionMode ? (
                        <>
                            <TouchableOpacity
                                onPress={handleDeleteSelected}
                                style={[styles.deleteButton, isZenMode && styles.zenModeButton]}
                            >
                                <Ionicons name="trash-outline" size={20} color="#fff" />
                                <Text style={styles.uploadButtonText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCancelSelection}
                                style={[styles.cancelButton, isZenMode && styles.zenModeButton]}
                            >
                                <Ionicons name="close-outline" size={20} color="#fff" />
                                <Text style={styles.uploadButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            onPress={handleSelectionModeToggle}
                            style={[styles.selectButton, isZenMode && styles.zenModeButton]}
                        >
                            <Ionicons name="checkbox-outline" size={20} color="#fff" />
                            <Text style={styles.uploadButtonText}>Select</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {progress > 0 && <ProgressBar progress={progress} />}

            <View style={styles.gridContainer}>
                {mediaGrid}
                {isFetching && (
                    <View style={styles.loadingOverlay}>
                        <LoadingSpinner />
                    </View>
                )}
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
    selectButtonContainer: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    uploadButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flex: 0.45,
    },
    selectButton: {
        backgroundColor: '#34C759',
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flex: 0.45,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flex: 0.45,
    },
    cancelButton: {
        backgroundColor: '#FF9500',
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flex: 0.45,
    },
    zenModeButton: {
        backgroundColor: '#34C759',
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 6,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay
    },
});

export default ExploreScreen;
