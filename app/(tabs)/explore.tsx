import React, { useMemo } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFetchMedia } from '@/hooks/useFetchMedia';
import { useUploadMedia } from '@/hooks/useUploadMedia';
import * as ImagePicker from 'expo-image-picker';
import useZenModeStore from '@/stores/useZenModeStore';
import LoadingSpinner from '@/components/misc/LoadingSpinner';
import MediaGrid from '@/components/media/MediaGrid';

const ExploreScreen = () => {
    const { data: mediaList, isLoading, refetch } = useFetchMedia();
    const { isZenMode } = useZenModeStore();

    // Handle image picking and upload
    const handlePickAndUploadImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const { uri } = result.assets[0];
            useUploadMedia(uri, refetch);
        }
    };

    // Memoize the MediaGrid to avoid re-rendering when zen mode changes
    const mediaGrid = useMemo(() => {
        if (isLoading) {
            return <LoadingSpinner />;
        }
        return (
            <View style={styles.gridContainer}>
                <MediaGrid mediaList={mediaList || []} />
            </View>
        );
    }, [mediaList, isLoading]);

    return (
        <SafeAreaView style={[styles.container, isZenMode && styles.zenMode]}>
            <View>
                <Text style={[styles.title, isZenMode && styles.zenModeTitle]}>
                    Explore Media
                </Text>
                <Button
                    title="Upload Photo"
                    onPress={handlePickAndUploadImage}
                    color={isZenMode ? '#8BC34A' : '#007AFF'} // Softer button color in zen mode
                />
            </View>
            {/* Media grid is memoized and won't re-render based on isZenMode */}
            {mediaGrid}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1A1A1A',
    },
    gridContainer: {
        flex: 1, // Ensures it takes the full available space
        marginTop: 10,
    },
    zenMode: {
        backgroundColor: '#2E2E2E', // Softer, more muted background for zen mode
        paddingHorizontal: 10, // Reduce padding for a cleaner look
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
    zenModeTitle: {
        color: '#B0C4DE', // Softer, more muted text color in zen mode
        fontWeight: '300', // Lighter font weight for a more relaxing style
    },
});

export default ExploreScreen;
