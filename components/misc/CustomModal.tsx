import useZenModeStore from '@/stores/useZenModeStore';
import React from 'react';
import { View, Image, StyleSheet, Text, Pressable, Dimensions } from 'react-native';
import Modal from 'react-native-modal';

interface CustomModalProps {
    isVisible: boolean;
    imageUrl: string | null;
    onCancel: () => void;
    onDelete: () => void;
}

const CustomModal = ({ isVisible, imageUrl, onCancel, onDelete }: CustomModalProps) => {
    const { isZenMode } = useZenModeStore();

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onCancel}
            style={styles.modal}
            backdropOpacity={0.4} // Subtle dark backdrop
        >
            <View style={[styles.modalContainer, isZenMode && styles.zenModeContainer]}>
                {imageUrl && (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.fullImage}
                        resizeMode="contain"
                    />
                )}
                <View style={styles.modalButtonContainer}>
                    <Pressable
                        onPress={onCancel}
                        style={({ pressed }) => [
                            styles.cancelButton,
                            pressed && styles.buttonPressed,
                            isZenMode && styles.zenCancelButton,
                        ]}
                    >
                        <Text style={[styles.cancelButtonText, isZenMode && styles.zenCancelButtonText]}>
                            Cancel
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={onDelete}
                        style={({ pressed }) => [
                            styles.deleteButton,
                            pressed && styles.buttonPressed,
                            isZenMode && styles.zenDeleteButton,
                        ]}
                    >
                        <Text style={[styles.deleteButtonText, isZenMode && styles.zenDeleteButtonText]}>
                            Delete
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16, // Softer, more rounded corners
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000', // iOS-like shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5, // Add elevation for Android
    },
    zenModeContainer: {
        backgroundColor: '#2E2E2E',
    },
    fullImage: {
        width: '100%',
        height: Dimensions.get('window').height * 0.6,
        borderRadius: 12,
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#F7F7F7', // Light background, iOS-like
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10, // iOS-like rounded buttons
        marginRight: 10,
        borderWidth: 1, // Subtle border to match iOS button styles
        borderColor: '#DADADA',
    },
    zenCancelButton: {
        backgroundColor: '#333333',
    },
    cancelButtonText: {
        color: '#007AFF', // iOS blue for neutral actions
        fontSize: 17, // iOS font size
        fontWeight: '500', // Medium weight for buttons
    },
    zenCancelButtonText: {
        color: '#A0A0A0',
    },
    deleteButton: {
        backgroundColor: '#FF3B30', // iOS red for destructive actions
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10, // iOS-like rounded buttons
    },
    zenDeleteButton: {
        backgroundColor: '#FF6347',
    },
    deleteButtonText: {
        color: '#FFFFFF', // White text for destructive actions
        fontSize: 17,
        fontWeight: '500',
    },
    zenDeleteButtonText: {
        color: '#FFDDDD',
    },
    buttonPressed: {
        opacity: 0.7, // Light pressed effect
    },
});

export default CustomModal;
