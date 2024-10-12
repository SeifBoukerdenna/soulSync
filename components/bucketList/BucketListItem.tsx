// app/components/bucketList/BucketListItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BucketItem } from '@/hooks/useBucketList';
import { Colors } from '@/constants/Colors';

interface Props {
    item: BucketItem;
    onToggleCompletion: (item: BucketItem) => void;
    onEdit: (item: BucketItem) => void;
    onDelete: (id: string) => void;
    currentColors: typeof Colors.default; // Adjust type as needed
}

const BucketListItem: React.FC<Props> = ({ item, onToggleCompletion, onEdit, onDelete, currentColors }) => {
    return (
        <View style={[styles.itemContainer, { backgroundColor: currentColors.lightGray }]}>
            <TouchableOpacity onPress={() => onToggleCompletion(item)}>
                <Ionicons
                    name={item.completed ? 'checkbox-outline' : 'square-outline'}
                    size={24}
                    color={item.completed ? currentColors.green : currentColors.red}
                />
            </TouchableOpacity>
            <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitle, { color: currentColors.text }, item.completed && { color: currentColors.gray, textDecorationLine: 'line-through' }]}>
                    {item.title}
                </Text>
                {item.description ? (
                    <Text style={[styles.itemDescription, { color: currentColors.gray }]}>{item.description}</Text>
                ) : null}
                <Text style={[styles.itemDate, { color: currentColors.gray }]}>
                    Added on: {new Date(item.dateAdded).toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                    <Ionicons name="create-outline" size={20} color={currentColors.blue} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={20} color={currentColors.red} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default BucketListItem;

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginVertical: 6,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
