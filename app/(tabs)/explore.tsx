import { useState } from 'react';
import { Button, Image, View, StyleSheet, Alert, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function S3ImageUploader() {
    const [image, setImage] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const pickedImageUri = result.assets[0].uri;
            setImage(pickedImageUri);
            await uploadImageToS3(pickedImageUri);
        }
    };

    const uploadImageToS3 = async (uri: string) => {
        try {
            const fileName = uri.split('/').pop(); // Extract file name
            const fileType = fileName?.split('.').pop(); // Get file extension

            // Read the file as binary data (not base64)
            const fileContent = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Convert the base64 string back to a binary buffer
            const binaryData = Buffer.from(fileContent, 'base64');

            // Directly specify the correct upload URL (no JSON.stringify)
            const uploadUrl = `https://${process.env.EXPO_PUBLIC_S3_ENDPOINT}/uploads/${fileName}`;
            console.log('Upload URL:', uploadUrl);

            // Send a PUT request with binary data in the body
            const responseUpload = await fetch(uploadUrl, {
                method: 'PUT',
                body: binaryData, // Send the binary data directly
                headers: {
                    'Content-Type': `image/${fileType}`,
                    'x-amz-acl': 'public-read', // Optional: make the uploaded file public
                },
            });

            if (responseUpload.ok) {
                const uploadedUrl = `https://jcrvqjrfsukthnzqgxfl.supabase.co/storage/v1/object/public/uploads/${fileName}`;
                setUploadedImage(uploadedUrl); // Save the uploaded image URL
                Alert.alert('Success', 'Image uploaded successfully');
            } else {
                throw new Error(`Failed to upload image: ${responseUpload.statusText}`);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image.');
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Pick an image from camera roll" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={styles.image} />}
            {uploadedImage && (
                <View style={styles.uploadedContainer}>
                    <Text>Uploaded Image:</Text>
                    <Image source={{ uri: uploadedImage }} style={styles.image} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 200,
        height: 200,
        marginTop: 20,
    },
    uploadedContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
});
