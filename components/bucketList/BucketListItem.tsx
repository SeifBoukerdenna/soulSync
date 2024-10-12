import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BucketItem } from '@/hooks/useBucketList';
import { Colors } from '@/constants/Colors';

interface Props {
    item: BucketItem;
    onToggleCompletion: (item: BucketItem) => void;
    onEdit: (item: BucketItem) => void;
    onDelete: (id: string) => void;
    currentColors: typeof Colors.default;
}

const BucketListItem: React.FC<Props> = ({ item, onToggleCompletion, onEdit, onDelete, currentColors }) => {
    // Memoize the functions to prevent unnecessary re-renders
    const handleToggleCompletion = useCallback(() => onToggleCompletion(item), [item, onToggleCompletion]);
    const handleEdit = useCallback(() => onEdit(item), [item, onEdit]);
    const handleDelete = useCallback(() => onDelete(item.id), [item.id, onDelete]);

    return (
        <View style={[styles.itemContainer, { backgroundColor: currentColors.lightGray }]}>
            <TouchableOpacity onPress={handleToggleCompletion}>
                <Ionicons
                    name={item.completed ? 'checkbox-outline' : 'square-outline'}
                    size={24}
                    color={item.completed ? currentColors.green : currentColors.red}
                />
            </TouchableOpacity>
            <View style={styles.itemTextContainer}>
                <Text
                    style={[
                        styles.itemTitle,
                        { color: currentColors.text },
                        item.completed && { color: currentColors.gray, textDecorationLine: 'line-through' }
                    ]}
                >
                    {item.title}
                </Text>
                {item.description && (
                    <Text style={[styles.itemDescription, { color: currentColors.gray }]}>{item.description}</Text>
                )}
                <Text style={[styles.itemDate, { color: currentColors.gray }]}>
                    Added on: {new Date(item.dateAdded).toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity onPress={handleEdit} style={styles.actionButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="create-outline" size={20} color={currentColors.blue} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.actionButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="trash-outline" size={20} color={currentColors.red} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default React.memo(BucketListItem);

const styles = StyleSheet.create({
    itemContainer: {
        zIndex: 5,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginVertical: 6,
        borderRadius: 12,
        backgroundColor: Colors.default.lightGray,
        shadowRadius: 1,
    },
    itemTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemDescription: {
        fontSize: 14,
        marginTop: 4,
    },
    itemDate: {
        fontSize: 12,
        marginTop: 4,
    },
    itemActions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 12,
    },
});
