// app/components/misc/AddEditModal.tsx
import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { BucketItem } from '@/hooks/useBucketList';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (title: string, description: string) => void;
    currentItem: BucketItem | null;
    currentColors: typeof Colors.default; // Adjust type as needed
}

const AddEditModal: React.FC<Props> = ({ visible, onClose, onSave, currentItem, currentColors }) => {
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const isValid = title.trim().length > 0;

    useEffect(() => {
        if (currentItem) {
            setTitle(currentItem.title);
            setDescription(currentItem.description || '');
        } else {
            setTitle('');
            setDescription('');
        }
    }, [currentItem]);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalOverlay}
            >
                <View style={[styles.modalContainer, {
                    backgroundColor: currentColors.modalBackground,
                    borderWidth: 1,
                    borderColor: currentColors.gray
                }]}>
                    <Text style={[styles.modalTitle, { color: currentColors.text }]}>
                        {currentItem ? 'Edit Item' : 'Add New Item'}
                    </Text>
                    <Ionicons
                        name="close-circle-outline"
                        size={24}
                        color={currentColors.gray}
                        style={styles.modalCloseIcon}
                        onPress={onClose}
                    />
                    <Text style={[styles.inputLabel, { color: currentColors.text }]}>Title *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                borderColor: currentColors.gray,
                                color: currentColors.text,
                                backgroundColor: currentColors.background
                            }
                        ]}
                        placeholder="Enter the title"
                        placeholderTextColor={currentColors.gray}
                        value={title}
                        onChangeText={setTitle}
                    />
                    {!isValid && (
                        <Text style={styles.errorText}>Title is required.</Text>
                    )}
                    <Text style={[styles.inputLabel, { color: currentColors.text }]}>Description (optional)</Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea,
                            {
                                borderColor: currentColors.gray,
                                color: currentColors.text,
                                backgroundColor: currentColors.background
                            },
                        ]}
                        placeholder="Enter the description"
                        placeholderTextColor={currentColors.gray}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.cancelButton,
                                { backgroundColor: currentColors.gray }
                            ]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.saveButton,
                                {
                                    backgroundColor: currentColors.blue,
                                    opacity: !isValid ? 0.6 : 1
                                },
                            ]}
                            onPress={() => onSave(title, description)}
                            disabled={!isValid}
                        >
                            <Text style={styles.buttonText}>{currentItem ? 'Save' : 'Add'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default AddEditModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 16,
    },
    modalContainer: {
        borderRadius: 12,
        padding: 20,
        position: 'relative',
        // Borders are dynamically set based on currentColors
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
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
        // Background color is dynamically set based on currentColors
    },
    saveButton: {
        // Background color and opacity are dynamically set based on currentColors
    },
    buttonText: {
        color: Colors.default.buttonText, // Assuming white text
        fontWeight: '600',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 12,
    },
});
