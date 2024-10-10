import React, { useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database } from '../../firebaseConfig';
import { ref, onValue, remove, push } from 'firebase/database';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useBucketListStore } from '@/stores/useBucketListStore';

export default function BucketListScreen() {
    const { bucketListItem, bucketList, setBucketListItem, addBucketListItem, toggleStarted, toggleCompleted, clearBucketListItem } = useBucketListStore();

    // Firebase setup to fetch items
    useEffect(() => {
        const bucketListRef = ref(database, 'bucketList');
        const unsubscribe = onValue(bucketListRef, (snapshot) => {
            const data = snapshot.val();
            const items = data ? Object.keys(data).map((key) => ({ key, ...data[key] })) : [];
            setBucketListItem(items);
        });
        return () => unsubscribe();
    }, [setBucketListItem]);

    // Press effect animation values
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(scale.value) }],
        };
    });

    const handleAddItem = () => {
        if (bucketListItem.trim()) {
            addBucketListItem(bucketListItem);
            clearBucketListItem();
        }
    };

    const handleRemoveItem = (key: string) => {
        const itemRef = ref(database, `bucketList/${key}`);
        remove(itemRef);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Bucket List</Text>
            <TextInput
                style={styles.input}
                placeholder="Add a new item"
                value={bucketListItem}
                onChangeText={setBucketListItem}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <FlatList
                data={bucketList}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                    <TouchableWithoutFeedback
                        onPressIn={() => { scale.value = 0.9; }}
                        onPressOut={() => { scale.value = 1; }}
                        onLongPress={() => toggleStarted(item.key)} // For optional actions
                    >
                        <Animated.View style={[styles.itemContainer, animatedStyle]}>
                            <View>
                                <Text style={styles.itemText}>{item.item}</Text>
                                <Text style={styles.dateText}>Created: {new Date(item.dateCreated).toLocaleString()}</Text>
                                <Text style={styles.statusText}>Started: {item.started ? 'Yes' : 'No'}</Text>
                                <Text style={styles.statusText}>Completed: {item.completed ? 'Yes' : 'No'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => toggleCompleted(item.key)}>
                                <Text style={styles.completeButtonText}>
                                    {item.completed ? 'Mark as Uncomplete' : 'Mark as Complete'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRemoveItem(item.key)}>
                                <Text style={styles.removeButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    itemText: {
        fontSize: 18,
    },
    dateText: {
        fontSize: 12,
        color: '#888',
    },
    statusText: {
        fontSize: 14,
        color: '#333',
    },
    completeButtonText: {
        color: '#007AFF',
    },
    removeButtonText: {
        color: '#FF3B30',
    },
});
