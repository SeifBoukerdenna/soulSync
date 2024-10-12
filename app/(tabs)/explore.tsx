// app/components/ExploreScreen.tsx

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFetchMedia } from '@/hooks/useFetchMedia';
import { useUploadMedia } from '@/hooks/useUploadMedia';
import * as ImagePicker from 'expo-image-picker';
import useZenModeStore from '@/stores/useZenModeStore';
import MediaGrid from '@/components/media/MediaGrid';
import ProgressBar from '@/components/misc/ProgressBar';
import { shuffleArray } from '@/utils/shuffleArray';
import { useDeleteMedia } from '@/hooks/useDeleteMedia';
import { useSettingsOptions } from '@/hooks/useSettingsOptions';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { getGradientColors } from '@/components/stars/utils';
import { MediaItem } from '@/interfaces/MediaItem';

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

    // State for dynamic background colors
    const [gradientColors, setGradientColors] = useState<[string, string]>(getGradientColors());

    // Determine currentColors based on Zen Mode
    const currentColors = isZenMode ? Colors.zen : Colors.default;

    // Define static background colors based on Zen Mode
    const staticBackgroundColors = isZenMode
        ? [Colors.zen.background, Colors.zen.backgroundSecondary]
        : [Colors.default.background, Colors.default.backgroundSecondary];

    // Initialize shuffled media when mediaList changes
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
    }, [limitedMediaList, refetch, gridKey, isSelectionMode, selectedItems]);

    // Update gradient colors periodically if dynamic background is enabled
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (settings?.useDynamicBackground) {
            const updateGradient = () => {
                setGradientColors(getGradientColors());
            };

            // Initial update
            updateGradient();

            // Update every 60 seconds
            interval = setInterval(updateGradient, 60000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [settings?.useDynamicBackground]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Conditional Background */}
            {settings?.useDynamicBackground ? (
                <LinearGradient colors={gradientColors as [string, string]} style={styles.gradientBackground} />
            ) : (
                <View style={[styles.staticBackground, { backgroundColor: staticBackgroundColors[0] }]} />
            )}

            {/* Overlay Content */}
            <View style={styles.contentContainer}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={[styles.title, { color: currentColors.text }]}>
                        Explore Gallery
                    </Text>
                    {/* Global Loading Indicator in Header */}
                    {isFetching && (
                        <ActivityIndicator size="small" color={currentColors.text} style={styles.headerLoader} />
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        onPress={handlePickAndUploadMedia}
                        style={[styles.uploadButton, { backgroundColor: currentColors.blue }]}
                    >
                        <Ionicons name="cloud-upload-outline" size={20} color={currentColors.buttonText} />
                        <Text style={[styles.uploadButtonText, { color: currentColors.buttonText }]}>Upload</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleRefetchMedia}
                        style={[styles.uploadButton, { backgroundColor: currentColors.blue }]}
                    >
                        <Ionicons name="refresh-outline" size={20} color={currentColors.buttonText} />
                        <Text style={[styles.uploadButtonText, { color: currentColors.buttonText }]}>Refresh</Text>
                    </TouchableOpacity>
                </View>

                {/* Selection Mode Buttons */}
                <View style={styles.selectButtonContainer}>
                    {isSelectionMode ? (
                        <>
                            <TouchableOpacity
                                onPress={handleDeleteSelected}
                                style={[styles.deleteButton, { backgroundColor: currentColors.red }]}
                            >
                                <Ionicons name="trash-outline" size={20} color={currentColors.buttonText} />
                                <Text style={[styles.uploadButtonText, { color: currentColors.buttonText }]}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCancelSelection}
                                style={[styles.cancelButton, { backgroundColor: currentColors.gray }]}
                            >
                                <Ionicons name="close-outline" size={20} color={currentColors.buttonText} />
                                <Text style={[styles.uploadButtonText, { color: currentColors.buttonText }]}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            onPress={handleSelectionModeToggle}
                            style={[styles.selectButton, { backgroundColor: currentColors.green }]}
                        >
                            <Ionicons name="checkbox-outline" size={20} color={currentColors.buttonText} />
                            <Text style={[styles.uploadButtonText, { color: currentColors.buttonText }]}>Select</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Progress Bar */}
                {progress > 0 && <ProgressBar progress={progress} />}

                {/* Media Grid */}
                <View style={styles.gridContainer}>
                    {mediaGrid}
                    {/* Optional Inline Loading Indicator within Media Grid */}
                    {/* This can be uncommented if you want an additional loader inside the grid */}
                    {/* {isFetching && (
                        <View style={styles.inlineLoading}>
                            <ActivityIndicator size="small" color={currentColors.text} />
                        </View>
                    )} */}
                </View>
            </View>
        </SafeAreaView>
    );

};

export default ExploreScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    gradientBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    staticBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333', // Will be overridden by dynamic color
        textAlign: 'center',
    },
    headerLoader: {
        marginLeft: 10,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    selectButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    uploadButton: {
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
    uploadButtonText: {
        color: '#fff', // Will be overridden by dynamic color
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 6,
    },
    gridContainer: {
        flex: 1,
        marginTop: 20,
        marginBottom: 20,
    },
    // Optional Inline Loading Indicator Style
    /*
    inlineLoading: {
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: [{ translateX: -10 }],
        zIndex: 10,
    },
    */
});
