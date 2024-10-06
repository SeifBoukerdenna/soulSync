import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Alert, Button } from 'react-native';
import { ref, listAll, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

const ExploreScreen = () => {
    const [mediaList, setMediaList] = useState<string[]>([]);  // Define state type as string array
    const [uploading, setUploading] = useState<boolean>(false);

    useEffect(() => {
        fetchMedia();  // Fetch media when the component loads
    }, []);

    // Function to fetch and display all images from the storage
    const fetchMedia = async () => {
        try {
            const imagesRef = ref(storage, 'images/');  // Use the storage reference
            const imagesList = await listAll(imagesRef);

            // Get download URLs for images only
            const imagePromises = imagesList.items.map(item => getDownloadURL(item));
            const imageUrls = await Promise.all(imagePromises);

            setMediaList(imageUrls);  // Set only image URLs
        } catch (error) {
            console.error('Error fetching media:', error);
            Alert.alert('Error fetching media');
        }
    };

    // Function to pick and upload an image to Firebase Storage
    const pickAndUploadImage = async () => {
        try {
            // First, check the existing permission status
            const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
            let finalStatus = existingStatus;

            // If permission isn't granted yet, request it
            if (existingStatus !== 'granted') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                finalStatus = status;
            }

            // If permission is still not granted, alert the user
            if (finalStatus !== 'granted') {
                Alert.alert('Permission required', 'You need to grant permission to access your photos.');
                return;
            }

            // Let the user pick an image from the gallery
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                const { uri } = result.assets[0];
                await uploadImage(uri);  // Upload the picked image
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error picking image');
        }
    };

    // Function to upload the selected image to Firebase Storage
    const uploadImage = async (uri: string) => {
        try {
            setUploading(true);  // Show uploading state

            // Fetch the image as a blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Create a unique reference in Firebase Storage for the image
            const imageRef = ref(storage, `images/${new Date().getTime()}-photo.jpg`);

            // Start the upload task
            const uploadTask = uploadBytesResumable(imageRef, blob);

            // Handle state changes during the upload
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error('Error uploading image:', error);
                    Alert.alert('Error uploading image');
                },
                async () => {
                    // Upload complete, now get the download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log('File available at', downloadURL);

                    // Add the new image to the media list and refresh the view
                    setMediaList(prevMediaList => [downloadURL, ...prevMediaList]);
                    setUploading(false);
                }
            );
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploading(false);
            Alert.alert('Error uploading image');
        }
    };

    // Render the media
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Explore Media</Text>

            {/* Button to upload a new image */}
            <Button title="Upload Photo" onPress={pickAndUploadImage} disabled={uploading} />

            {/* Show a loading indicator when uploading */}
            {uploading && <Text>Uploading...</Text>}

            <FlatList
                data={mediaList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.mediaContainer}>
                        <Image source={{ uri: item }} style={styles.media} />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    mediaContainer: {
        marginBottom: 20,
    },
    media: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
});

export default ExploreScreen;
