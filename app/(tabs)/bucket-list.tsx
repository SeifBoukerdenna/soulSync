import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // SafeAreaView import
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import Toast from 'react-native-toast-message';
import useBucketList, { BucketItem } from '@/hooks/useBucketList';
import BucketListItem from '@/components/bucketList/BucketListItem';
import AddEditModal from '@/components/misc/AddEditModal';
import useZenModeStore from '@/stores/useZenModeStore';
import { LinearGradient } from 'expo-linear-gradient';
import { getGradientColors } from '@/components/stars/utils';
import { useSettingsOptions } from '@/hooks/useSettingsOptions';
import { useDeleteMedia } from '@/hooks/useDeleteMedia';

const BucketListScreen = () => {
    const {
        bucketItems,
        addItem,
        editItem,
        deleteItem,
        toggleCompletion,
    } = useBucketList();
    const { isZenMode } = useZenModeStore();
    const { settings } = useSettingsOptions();

    const currentColors = useMemo(() => (isZenMode ? Colors.zen : Colors.default), [isZenMode]);

    const [modalVisible, setModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<BucketItem | null>(null);
    const [gradientColors, setGradientColors] = useState<[string, string]>(getGradientColors());

    const staticBackgroundColors = useMemo(() => {
        return isZenMode
            ? [Colors.zen.background, Colors.zen.backgroundSecondary]
            : [Colors.default.background, Colors.default.backgroundSecondary];
    }, [isZenMode]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (settings?.useDynamicBackground) {
            const updateGradient = () => {
                setGradientColors(getGradientColors());
            };

            updateGradient();
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
        <SafeAreaView style={styles.container}>
            {settings?.useDynamicBackground ? (
                <LinearGradient colors={gradientColors as [string, string]} style={styles.gradientBackground} />
            ) : (
                <View style={[styles.staticBackground, { backgroundColor: staticBackgroundColors[0] }]} />
            )}

            <>
                {renderHeader()}

                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    nestedScrollEnabled={true}
                    scrollEventThrottle={16}
                >
                    {bucketItems.length > 0 ? (
                        bucketItems.map((item) => (
                            <BucketListItem
                                key={item.id}
                                item={item}
                                onToggleCompletion={toggleCompletion}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                                currentColors={currentColors}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: currentColors.gray }]}>
                                No items in your bucket list.
                            </Text>
                        </View>
                    )}
                </ScrollView>

                <AddEditModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSave}
                    currentItem={currentItem}
                    currentColors={currentColors}
                />
                <Toast />
            </>
        </SafeAreaView>
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
        paddingHorizontal: 5,
        paddingBottom: 60, // Increased padding to add space at the bottom
        flexGrow: 1,
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
});
