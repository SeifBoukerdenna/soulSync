// app/(tabs)/bucket-list/index.tsx
import React, { useEffect, useState } from 'react';
import {
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Modal,
    Alert,
    View,
} from 'react-native';
import { database } from '@/firebaseConfig';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors'; // Ensure you have a Colors constant defined
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message'; // For user feedback
import AsyncStorage from '@react-native-async-storage/async-storage';

type BucketItem = {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    dateAdded: string; // ISO date string
};

const BucketListScreen = () => {
    const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<BucketItem | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const bucketRef = ref(database, 'bucketList');

        const unsubscribe = onValue(bucketRef, (snapshot) => {
            const data = snapshot.val();
            const items: BucketItem[] = data
                ? Object.keys(data).map((key) => ({
                    id: key,
                    title: data[key].title,
                    description: data[key].description || '',
                    completed: data[key].completed || false,
                    dateAdded: data[key].dateAdded || new Date().toISOString(), // Ensure dateAdded exists
                }))
                : [];
            setBucketItems(items);
        });

        // Initialize bucket list with default items on first launch
        initializeBucketList();

        return () => unsubscribe();
    }, []);

    const initializeBucketList = async () => {
        try {
            const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
            if (isFirstLaunch === null) {
                // This is the first launch
                const defaultItems = [
                    { title: 'Travel to Japan', description: 'Explore Tokyo and Kyoto.' },
                    { title: 'Learn to Play Guitar', description: 'Take lessons and practice daily.' },
                    { title: 'Start a Blog', description: 'Write about your experiences.' },
                ];

                const bucketRef = ref(database, 'bucketList');
                const promises = defaultItems.map(item => {
                    const newItemRef = push(bucketRef);
                    return set(newItemRef, {
                        ...item,
                        completed: false,
                        dateAdded: new Date().toISOString() // Add dateAdded
                    });
                });
                await Promise.all(promises);

                await AsyncStorage.setItem('isFirstLaunch', 'false');
                Toast.show({
                    type: 'success',
                    text1: 'Welcome!',
                    text2: 'Default bucket list items have been added.',
                });
            }
        } catch (error) {
            console.error('Error initializing bucket list:', error);
        }
    };

    const handleAddItem = () => {
        if (!title.trim()) {
            Alert.alert('Validation', 'Title is required');
            return;
        }

        const bucketRef = ref(database, 'bucketList');
        const newItemRef = push(bucketRef);

        set(newItemRef, {
            title,
            description,
            completed: false,
            dateAdded: new Date().toISOString(), // Add dateAdded
        })
            .then(() => {
                setTitle('');
                setDescription('');
                setModalVisible(false);
                Toast.show({
                    type: 'success',
                    text1: 'Item Added',
                    text2: `"${title}" has been added to your bucket list.`,
                });
            })
            .catch((error) => {
                console.error(error);
                Alert.alert('Error', 'Failed to add item');
            });
    };

    const handleEditItem = () => {
        if (!currentItem) return;
        if (!title.trim()) {
            Alert.alert('Validation', 'Title is required');
            return;
        }

        const itemRef = ref(database, `bucketList/${currentItem.id}`);
        update(itemRef, {
            title,
            description,
            // Optionally, you can update dateAdded if needed
        })
            .then(() => {
                setCurrentItem(null);
                setTitle('');
                setDescription('');
                setModalVisible(false);
                Toast.show({
                    type: 'success',
                    text1: 'Item Updated',
                    text2: `"${title}" has been updated.`,
                });
            })
            .catch((error) => {
                console.error(error);
                Alert.alert('Error', 'Failed to update item');
            });
    };

    const handleDeleteItem = (id: string) => {
        Alert.alert(
            'Delete Confirmation',
            'Are you sure you want to delete this item?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        remove(ref(database, `bucketList/${id}`))
                            .then(() => {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Item Deleted',
                                    text2: 'The item has been removed from your bucket list.',
                                });
                            })
                            .catch((error) => {
                                console.error(error);
                                Alert.alert('Error', 'Failed to delete item');
                            });
                    },
                },
            ]
        );
    };

    const openAddModal = () => {
        setCurrentItem(null);
        setTitle('');
        setDescription('');
        setModalVisible(true);
    };

    const openEditModal = (item: BucketItem) => {
        setCurrentItem(item);
        setTitle(item.title);
        setDescription(item.description || '');
        setModalVisible(true);
    };

    const toggleCompletion = (item: BucketItem) => {
        update(ref(database, `bucketList/${item.id}`), {
            completed: !item.completed,
        }).catch((error) => {
            console.error(error);
            Alert.alert('Error', 'Failed to update item');
        });
    };

    const addSampleItems = () => {
        Alert.alert(
            'Add Sample Items',
            'Are you sure you want to add sample items to your bucket list?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Add',
                    onPress: async () => {
                        const sampleItems = [
                            { title: 'Visit the Grand Canyon', description: 'Experience the vastness of nature.' },
                            { title: 'Learn a New Language', description: 'Become fluent in Spanish.' },
                            { title: 'Run a Marathon', description: 'Complete a full marathon.' },
                            { title: 'Write a Book', description: 'Share your stories with the world.' },
                        ];

                        const bucketRef = ref(database, 'bucketList');
                        try {
                            const promises = sampleItems.map(item => {
                                const newItemRef = push(bucketRef);
                                return set(newItemRef, {
                                    ...item,
                                    completed: false,
                                    dateAdded: new Date().toISOString() // Add dateAdded
                                });
                            });
                            await Promise.all(promises);
                            Toast.show({
                                type: 'success',
                                text1: 'Sample Items Added',
                                text2: 'Your bucket list has been populated with sample items.',
                            });
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'Failed to add sample items.');
                        }
                    },
                },
            ]
        );
    };

    const isValid = title.trim().length > 0;

    const renderItem = ({ item }: { item: BucketItem }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity onPress={() => toggleCompletion(item)}>
                <Ionicons
                    name={item.completed ? 'checkbox-outline' : 'square-outline'}
                    size={24}
                    color={item.completed ? Colors.green : Colors.red}
                />
            </TouchableOpacity>
            <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitle, item.completed && styles.completedText]}>
                    {item.title}
                </Text>
                {item.description ? (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                ) : null}
                <Text style={styles.itemDate}>
                    Added on: {new Date(item.dateAdded).toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
                    <Ionicons name="create-outline" size={20} color={Colors.blue} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={20} color={Colors.red} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={bucketItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>No items in your bucket list.</Text>}
            />
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.batchAddButton} onPress={addSampleItems}>
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.batchAddButtonText}>Add Samples</Text>
            </TouchableOpacity>

            {/* Modal for Add/Edit */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{currentItem ? 'Edit Item' : 'Add New Item'}</Text>
                        <Ionicons
                            name="close-circle-outline"
                            size={24}
                            color="#ccc"
                            style={styles.modalCloseIcon}
                            onPress={() => setModalVisible(false)}
                        />
                        <Text style={styles.inputLabel}>Title *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter the title"
                            value={title}
                            onChangeText={setTitle}
                        />
                        {!isValid && (
                            <Text style={styles.errorText}>Title is required.</Text>
                        )}
                        <Text style={styles.inputLabel}>Description (optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter the description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.saveButton,
                                    { opacity: !isValid ? 0.6 : 1 },
                                ]}
                                onPress={currentItem ? handleEditItem : handleAddItem}
                                disabled={!isValid}
                            >
                                <Text style={styles.buttonText}>{currentItem ? 'Save' : 'Add'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Toast />
        </SafeAreaView>
    );
};

export default BucketListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    listContent: {
        paddingBottom: 50, // Adjusted to accommodate both buttons
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 6,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        elevation: 1,
    },
    itemTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#A8A8A8',
    },
    itemDescription: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    itemDate: {
        fontSize: 12,
        color: '#777',
        marginTop: 4,
    },
    itemActions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 12,
    },
    addButton: {
        position: 'absolute',
        bottom: 120, // Adjusted from 100 to 120 to move it higher
        right: 30,
        backgroundColor: Colors.blue,
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    batchAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 200, // Adjusted from 100 to 120 to move it higher
        right: 30,
        backgroundColor: Colors.green,
        padding: 10,
        borderRadius: 30,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    batchAddButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#A8A8A8',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 16,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        position: 'relative',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalCloseIcon: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    inputLabel: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    saveButton: {
        backgroundColor: Colors.blue,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 12,
    },
});
