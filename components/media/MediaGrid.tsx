import React, { useState, useMemo } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, TouchableOpacity, Alert } from 'react-native';
import useZenModeStore from '@/stores/useZenModeStore';
import CustomModal from '../misc/CustomModal';
import { useDeleteMedia } from '@/hooks/useDeleteMedia';
import Modal from 'react-native-modal';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useFetchMedia } from '@/hooks/useFetchMedia';

interface MediaGridProps {
    mediaList: string[];
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isFullScreen, setFullScreen] = useState(false);

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

    const getMediaRows = (mediaList: string[]) => {
        const rows: string[][] = [];
        let currentRow: string[] = [];
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

    const handleLongPress = (uri: string) => {
        if (!isSelectionMode) {
            setSelectedImage(uri);
            setModalVisible(true);
        }
    };

    const handlePress = (uri: string) => {
        if (isSelectionMode) {
            onSelectItem(uri);
        } else {
            setSelectedImage(uri);
            setFullScreen(true);
        }
    };

    const handleCancelModal = () => {
        setModalVisible(false);
        setSelectedImage(null);
    };

    const handleDeleteImage = async () => {
        if (selectedImage) {
            try {
                await deleteMedia(selectedImage, refetch);

                handleCancelModal();
            } catch (error) {
                console.error('Error deleting image:', error);
                Alert.alert('Error', 'There was a problem deleting the image.');
            }
        }
    };

    const handleSwipeClose = () => {
        setFullScreen(false);
        setSelectedImage(null);
    };

    return (
        <>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={mediaRows}
                contentContainerStyle={styles.contentContainer}
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
                                    <Image
                                        source={{ uri: item }}
                                        style={[
                                            styles.image,
                                            {
                                                width: imageWidth,
                                                marginRight: index !== row.length - 1 ? imageMargin : 0,
                                                borderColor: selectedItems.includes(item) ? isZenMode ? '#34C759' : '#007AFF' : 'transparent',
                                                borderWidth: selectedItems.includes(item) ? 3 : 0,
                                            },
                                        ]}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    );
                }}
            />

            <CustomModal
                isVisible={isModalVisible}
                imageUrl={selectedImage}
                onCancel={handleCancelModal}
                onDelete={handleDeleteImage}
            />

            <Modal
                isVisible={isFullScreen}
                style={styles.fullScreenModal}
                onBackdropPress={handleSwipeClose}
                onSwipeComplete={handleSwipeClose}
                swipeDirection={['down', 'up']}
                backdropOpacity={1}
            >
                <PanGestureHandler onGestureEvent={handleSwipeClose}>
                    <View style={styles.fullScreenContainer}>
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.fullScreenImage}
                                resizeMode="contain"
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
    },
    image: {
        height: 250,
        resizeMode: 'cover',
        borderRadius: 10,
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
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
});

export default React.memo(MediaGrid);
