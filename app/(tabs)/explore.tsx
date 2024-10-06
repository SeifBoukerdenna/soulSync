import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Dimensions } from 'react-native';
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

    return (
        <SafeAreaView style={[styles.container, isZenMode && styles.zenMode]}>
            <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Explore Media</Text>
                <Button title="Upload Photo" onPress={handlePickAndUploadImage} />
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <MediaGrid mediaList={mediaList || []} />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Make sure container can expand to full screen
        backgroundColor: 'rgba(55, 44, 65, 0.85)',
    },
    scrollViewContent: {
        paddingBottom: 20,
        flexGrow: 1, // Ensures content is scrollable and not restricted
    },
    zenMode: {
        // Zen mode background or styles
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default ExploreScreen;
