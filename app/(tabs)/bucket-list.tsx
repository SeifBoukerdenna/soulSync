import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import Toast from 'react-native-toast-message';
import useBucketList, { BucketItem } from '@/hooks/useBucketList';
import BucketListItem from '@/components/bucketList/BucketListItem';
import AddEditModal from '@/components/misc/AddEditModal';
import useZenModeStore from '@/stores/useZenModeStore';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { getGradientColors } from '@/components/stars/utils'; // Import the utility
import { useSettingsOptions } from '@/hooks/useSettingsOptions'; // Import useSettingsOptions
import { useDeleteMedia } from '@/hooks/useDeleteMedia';
import { shuffleArray } from '@/utils/shuffleArray';

const BucketListScreen = () => {
    const {
        bucketItems,
        addItem,
        editItem,
        deleteItem,
        toggleCompletion,
        addSampleItems,
    } = useBucketList();
    const { isZenMode } = useZenModeStore();
    const { settings } = useSettingsOptions(); // Access settings including useDynamicBackground
    const { deleteMedia } = useDeleteMedia(); // Assuming deleteMedia is part of useBucketList

    const currentColors = useMemo(() => (isZenMode ? Colors.zen : Colors.default), [isZenMode]);

    const [modalVisible, setModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<BucketItem | null>(null);

    // State for dynamic background colors
    const [gradientColors, setGradientColors] = useState<[string, string]>(getGradientColors());

    // Define static background colors based on Zen Mode
    const staticBackgroundColors = useMemo(() => {
        return isZenMode
            ? [Colors.zen.background, Colors.zen.backgroundSecondary]
            : [Colors.default.background, Colors.default.backgroundSecondary];
    }, [isZenMode]);

    // Initialize shuffled media when bucketItems changes
    // Assuming shuffleArray is relevant here; otherwise, remove
    // const shuffledBucketItems = useMemo(() => shuffleArray(bucketItems), [bucketItems]);

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

    const openAddModal = () => {
        setCurrentItem(null);
        setModalVisible(true);
    };

    const openEditModal = (item: BucketItem) => {
        setCurrentItem(item);
        setModalVisible(true);
    };

    const handleSave = (title: string, description: string) => {
        if (currentItem) {
            editItem(currentItem.id, title, description);
            Toast.show({
                type: 'success',
                text1: 'Item Updated',
                text2: `"${title}" has been updated.`,
            });
        } else {
            addItem(title, description);
            Toast.show({
                type: 'success',
                text1: 'Item Added',
                text2: `"${title}" has been added to your bucket list.`,
            });
        }
        setModalVisible(false);
    };

    const handleDelete = useCallback((id: string) => {
        deleteItem(id);
        Toast.show({
            type: 'success',
            text1: 'Item Deleted',
            text2: 'The item has been removed from your bucket list.',
        });
    }, [deleteItem]);

    const renderItem = ({ item }: { item: BucketItem }) => (
        <BucketListItem
            item={item}
            onToggleCompletion={toggleCompletion}
            onEdit={openEditModal}
            onDelete={handleDelete}
            currentColors={currentColors}
        />
    );

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={[styles.headerTitle, { color: currentColors.text }]}>Bucket List</Text>
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: currentColors.blue }]}
                onPress={openAddModal}
            >
                <Ionicons name="add" size={30} color={currentColors.buttonText} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Conditional Background */}
            {settings?.useDynamicBackground ? (
                <LinearGradient colors={gradientColors as [string, string]} style={styles.gradientBackground} />
            ) : (
                <View style={[styles.staticBackground, { backgroundColor: staticBackgroundColors[0] }]} />
            )}

            {/* Overlay Content */}
            <SafeAreaView style={styles.contentContainer}>
                {/* Header */}
                <FlatList
                    data={bucketItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: currentColors.gray }]}>No items in your bucket list.</Text>
                        </View>
                    }
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                />

                <AddEditModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSave}
                    currentItem={currentItem}
                    currentColors={currentColors}
                />
                <Toast />
            </SafeAreaView>
        </View>
    );
};

export default BucketListScreen;

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
        padding: 16,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    addButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    uploadButtonText: {
        color: '#fff', // Will be overridden by dynamic color
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 6,
    },
    flatListContentEmpty: {
        flexGrow: 1,
        justifyContent: 'center',
    },
});
