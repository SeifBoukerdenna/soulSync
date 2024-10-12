// app/components/media/MediaGrid.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Ionicons } from '@expo/vector-icons';
import useZenModeStore from '@/stores/useZenModeStore';
import CustomModal from '../misc/CustomModal';
import { useDeleteMedia } from '@/hooks/useDeleteMedia';
import Modal from 'react-native-modal';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useFetchMedia } from '@/hooks/useFetchMedia';
import { debounce } from 'lodash';

interface MediaItem {
    uri: string;
    type: 'image' | 'video';
}

interface MediaGridProps {
    mediaList: MediaItem[];
    refetchMedia: () => void;
    isSelectionMode: boolean;
    selectedItems: string[];
    onSelectItem: (uri: string) => void;
}

const MediaGrid = ({
    mediaList,
    refetchMedia,
    isSelectionMode,
    selectedItems,
    onSelectItem,
}: MediaGridProps) => {
    const { isZenMode } = useZenModeStore();
    const { deleteMedia } = useDeleteMedia();
    const { refetch } = useFetchMedia();

    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [isFullScreen, setFullScreen] = useState(false);
    const [videoThumbnails, setVideoThumbnails] = useState<{ [uri: string]: string }>({});

    const screenWidth = Dimensions.get('window').width;
    const imageMargin = 5;

    const getRandomImageCount = () => {
        const randomValue = Math.random();
        if (randomValue < 0.15) {
            return 1;
        } else if (randomValue < 0.5) {
            return 2;
        } else {
            return 3;
        }
    };

    const getMediaRows = (mediaList: MediaItem[]) => {
        const rows: MediaItem[][] = [];
        let currentRow: MediaItem[] = [];
        mediaList.forEach((item, index) => {
            const imageCount = getRandomImageCount();
            if (currentRow.length === 0) {
                currentRow.push(item);
            } else if (currentRow.length < imageCount) {
                currentRow.push(item);
            }

            if (currentRow.length === imageCount || index === mediaList.length - 1) {
                rows.push(currentRow);
                currentRow = [];
            }
        });
        return rows;
    };

    const mediaRows = useMemo(() => getMediaRows(mediaList), [mediaList]);

    const generateThumbnail = async (uri: string) => {
        try {
            const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
                uri,
                {
                    time: 1000,
                }
            );
            setVideoThumbnails((prevThumbnails) => ({
                ...prevThumbnails,
                [uri]: thumbnailUri,
            }));
        } catch (e) {
            console.warn('Could not generate thumbnail', e);
        }
    };

    useEffect(() => {
        mediaList.forEach((item) => {
            if (item.type === 'video' && !videoThumbnails[item.uri]) {
                generateThumbnail(item.uri);
            }
        });
    }, [mediaList]);

    useEffect(() => {
        const debounceGenerateThumbnails = debounce(() => {
            mediaList.forEach((item) => {
                if (item.type === 'video' && !videoThumbnails[item.uri]) {
                    generateThumbnail(item.uri);
                }
            });
        }, 500);

        debounceGenerateThumbnails();

        return () => {
            debounceGenerateThumbnails.cancel();
        };
    }, [mediaList]);

    const handleLongPress = (item: MediaItem) => {
        if (!isSelectionMode) {
            setSelectedItem(item);
            setModalVisible(true);
        }
    };

    const handlePress = (item: MediaItem) => {
        if (isSelectionMode) {
            onSelectItem(item.uri);
        } else {
            setSelectedItem(item);
            setFullScreen(true);
        }
    };

    const handleCancelModal = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };

    const handleDeleteMedia = async () => {
        if (selectedItem) {
            try {
                await deleteMedia(selectedItem.uri, refetch);
                handleCancelModal();
            } catch (error) {
                console.error('Error deleting media:', error);
                Alert.alert('Error', 'There was a problem deleting the media.');
            }
        }
    };

    const handleSwipeClose = () => {
        setFullScreen(false);
        setSelectedItem(null);
    };

    const renderMediaThumbnail = (item: MediaItem, imageWidth: number) => {
        if (item.type === 'image') {
            return (
                <Image
                    source={{ uri: item.uri }}
                    style={[
                        styles.media,
                        {
                            width: imageWidth,
                            borderColor: selectedItems.includes(item.uri) ? (isZenMode ? '#34C759' : '#007AFF') : 'transparent',
                            borderWidth: selectedItems.includes(item.uri) ? 3 : 0,
                        },
                    ]}
                />
            );
        } else {
            return (
                <View>
                    {videoThumbnails[item.uri] ? (
                        <Image
                            source={{ uri: videoThumbnails[item.uri] }}
                            style={[
                                styles.media,
                                {
                                    width: imageWidth,
                                    borderColor: selectedItems.includes(item.uri) ? (isZenMode ? '#34C759' : '#007AFF') : 'transparent',
                                    borderWidth: selectedItems.includes(item.uri) ? 3 : 0,
                                },
                            ]}
                        />
                    ) : (
                        <View style={[styles.media, { width: imageWidth, justifyContent: 'center', alignItems: 'center' }]}>
                            <ActivityIndicator size="small" color="#fff" />
                        </View>
                    )}
                    <Ionicons
                        name="play-circle-outline"
                        size={40}
                        color="#fff"
                        style={styles.playIcon}
                    />
                </View>
            );
        }
    };

    return (
        <>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={mediaRows}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={5}
                contentContainerStyle={styles.contentContainer}
                ListEmptyComponent={() => <ActivityIndicator size="large" color="#007AFF" />}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item: row }) => {
                    const totalMarginSpace = (row.length - 1) * imageMargin;
                    const imageWidth = row.length === 1
                        ? screenWidth - imageMargin * 2
                        : (screenWidth - totalMarginSpace - imageMargin * 2) / row.length;

                    return (
                        <View style={styles.rowContainer}>
                            {row.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handlePress(item)}
                                    onLongPress={() => handleLongPress(item)}
                                    activeOpacity={0.8}
                                >
                                    {renderMediaThumbnail(item, imageWidth)}
                                </TouchableOpacity>
                            ))}
                        </View>
                    );
                }}
            />

            {/* Custom modal for image or video */}
            <CustomModal
                isVisible={isModalVisible && selectedItem !== null}
                mediaItem={selectedItem}
                onCancel={handleCancelModal}
                onDelete={handleDeleteMedia}
            />

            {/* Full-screen video or image modal */}
            <Modal
                isVisible={isFullScreen}
                style={styles.fullScreenModal}
                onBackdropPress={handleSwipeClose}
                onSwipeComplete={handleSwipeClose}
                swipeDirection={['down', 'up', 'left', 'right']}
                backdropOpacity={1}
            >
                <PanGestureHandler onGestureEvent={handleSwipeClose}>
                    <View style={styles.fullScreenContainer}>
                        {selectedItem?.type === 'image' && (
                            <Image
                                source={{ uri: selectedItem.uri }}
                                style={styles.fullScreenMedia}
                                resizeMode="contain"
                            />
                        )}
                        {selectedItem?.type === 'video' && (
                            <Video
                                source={{ uri: selectedItem.uri }}
                                style={styles.fullScreenMedia}
                                shouldPlay={true}
                                useNativeControls={true}
                                isLooping={false}
                            />
                        )}
                    </View>
                </PanGestureHandler>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: 5,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 10,
        gap: 5,
    },
    media: {
        height: 250,
        resizeMode: 'cover',
        borderRadius: 10,
    },
    playIcon: {
        position: 'absolute',
        top: '40%',
        left: '40%',
    },
    fullScreenModal: {
        margin: 0,
    },
    fullScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    fullScreenMedia: {
        width: '100%',
        height: '100%',
    },
});

export default React.memo(MediaGrid);
