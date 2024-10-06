import React from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, TouchableWithoutFeedback } from 'react-native';

interface MediaGridProps {
    mediaList: string[];
}

const MediaGrid: React.FC<MediaGridProps> = ({ mediaList }) => {
    // Get the screen width for responsive images
    const screenWidth = Dimensions.get('window').width;

    // Function to group images into rows of 1, 2, or 3
    const getMediaRows = (mediaList: string[]) => {
        const rows: string[][] = [];
        let currentRow: string[] = [];
        let imageCount = 0;

        // Fixed logic for grouping media into rows
        mediaList.forEach((item, index) => {
            imageCount = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3

            if (currentRow.length === 0) {
                currentRow.push(item);
            } else if (currentRow.length < imageCount) {
                currentRow.push(item);
            }

            // When the row reaches the random length or we're at the last image, push the row to rows
            if (currentRow.length === imageCount || index === mediaList.length - 1) {
                rows.push(currentRow);
                currentRow = [];
            }
        });

        return rows;
    };

    const mediaRows = getMediaRows(mediaList);

    return (
        <FlatList
            data={mediaRows}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item: row }) => (
                <View style={styles.rowContainer}>
                    {row.map((item, index) => (
                        <TouchableWithoutFeedback key={index}>
                            <Image
                                source={{ uri: item }}
                                style={[
                                    styles.image,
                                    { width: screenWidth / row.length - 10 }, // Adjust image width based on the number of images in the row
                                ]}
                            />
                        </TouchableWithoutFeedback>
                    ))}
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    image: {
        height: 150,
        marginHorizontal: 5,
        borderRadius: 10,
    },
});

export default MediaGrid;
