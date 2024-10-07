import React, { useState, useMemo } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import CustomModal from '@/components/misc/CustomModal';
import { useDeleteMedia } from '@/hooks/useDeleteMedia';
import useZenModeStore from '@/stores/useZenModeStore';

interface MediaGridProps {
    mediaList: string[];
    refetchMedia: () => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ mediaList, refetchMedia }) => {
    const { isZenMode } = useZenModeStore(); // Access Zen Mode state here

    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [pressedImage, setPressedImage] = useState<string | null>(null);

    const { deleteMedia } = useDeleteMedia();

    const screenWidth = Dimensions.get('window').width;
    const imageMargin = 5; // Adjust margin value

    // Adjust the probability to make rows with 2 or 3 images more common
    const getRandomImageCount = () => {
        const randomValue = Math.random();
        if (randomValue < 0.15) {
            return 1; // 15% chance of a row with 1 image
        } else if (randomValue < 0.5) {
            return 2; // 45% chance of a row with 2 images
        } else {
            return 3; // 40% chance of a row with 3 images
        }
    };

    const getMediaRows = (mediaList: string[]) => {
        const rows: string[][] = [];
        let currentRow: string[] = [];
        mediaList.forEach((item, index) => {
            const imageCount = getRandomImageCount(); // Random number based on the weighted probability

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

    const handleLongPress = (imageUri: string) => {
        setSelectedImage(imageUri);
        setModalVisible(true);
    };

    const handleDeleteImage = async () => {
        if (selectedImage) {
            await deleteMedia(selectedImage, refetchMedia);
            setModalVisible(false);
        }
    };

    const renderFlatList = useMemo(() => {
        return (
            <FlatList
                showsVerticalScrollIndicator={false}
                data={mediaRows}
                contentContainerStyle={styles.contentContainer} // Add padding to ensure images align properly
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item: row }) => {
                    const totalMarginSpace = (row.length - 1) * imageMargin; // Margin between images
                    const imageWidth = row.length === 1
                        ? screenWidth - imageMargin * 2 // Full width for a single image
                        : (screenWidth - totalMarginSpace - imageMargin * 2) / row.length; // Dynamically calculate width for each image in a row with multiple images

                    return (
                        <View style={styles.rowContainer}>
                            {row.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onLongPress={() => handleLongPress(item)}
                                    onPressIn={() => setPressedImage(item)} // Set the pressed image on press
                                    onPressOut={() => setPressedImage(null)} // Clear the pressed image when the press is released
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={{ uri: item }}
                                        style={[
                                            styles.image,
                                            {
                                                width: imageWidth, // Dynamically calculated width
                                                marginRight: index !== row.length - 1 ? imageMargin : 0, // No margin on the right for the last image
                                            },
                                            pressedImage === item && {
                                                borderWidth: 3,
                                                borderColor: isZenMode ? '#8BC34A' : '#007AFF',
                                                opacity: 0.8,
                                            }, // Dynamically apply the pressed style based on Zen Mode
                                        ]}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    );
                }}
            />
        );
    }, [mediaRows, screenWidth, pressedImage, isZenMode]);

    return (
        <View>
            {renderFlatList}

            <CustomModal
                isVisible={isModalVisible}
                imageUrl={selectedImage}
                onCancel={() => setModalVisible(false)}
                onDelete={handleDeleteImage}
            />
        </View>
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
});

export default React.memo(MediaGrid);
