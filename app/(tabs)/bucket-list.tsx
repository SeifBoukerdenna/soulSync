// app/(tabs)/bucket-list/index.tsx
import React, { useState, useMemo } from 'react';
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

    // Select color scheme based on Zen Mode
    const currentColors = useMemo(() => (isZenMode ? Colors.zen : Colors.default), [isZenMode]);

    const [modalVisible, setModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<BucketItem | null>(null);

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
        } else {
            addItem(title, description);
        }
        setModalVisible(false);
    };

    const renderItem = ({ item }: { item: BucketItem }) => (
        <BucketListItem
            item={item}
            onToggleCompletion={toggleCompletion}
            onEdit={openEditModal}
            onDelete={deleteItem}
            currentColors={currentColors}
        />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: currentColors.text }]}>Bucket List</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: currentColors.blue }]} onPress={openAddModal}>
                        <Ionicons name="add" size={30} color={currentColors.buttonText} />
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                data={bucketItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={bucketItems.length === 0 && styles.listContentEmpty}
                ListEmptyComponent={<Text style={[styles.emptyText, { color: currentColors.gray }]}>No items in your bucket list.</Text>}
                style={{ flex: 1 }}
                contentInset={{ bottom: 100 }}
            />
            {/* Modal for Add/Edit */}
            <AddEditModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                currentItem={currentItem}
                currentColors={currentColors}
            />
            <Toast />
        </SafeAreaView>
    );
};

export default BucketListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sampleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginRight: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    sampleButtonText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    newItemButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    newItemButtonText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    listContentEmpty: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
    },
    addButton: {
        position: 'absolute',
        right: 30,
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
});
