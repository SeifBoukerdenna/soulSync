import React, { useState } from 'react';
import { View, Text, Button, Image, FlatList, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';


type FileObject = {
    name: string;
    // Add any other properties that Supabase returns for the file objects
};


const Explore = () => {
    const [media, setMedia] = useState<FileObject[]>([]);
    const [uploading, setUploading] = useState(false);

    const pickMedia = async () => {
        // Ask for permission to access media library
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission to access media is required!');
            return;
        }

        // Open media picker
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            uploadMedia(result.assets[0].uri);
        }
    };

    const uploadMedia = async (uri: string) => {
        try {
            setUploading(true);

            // Convert media to a blob for uploading
            const response = await fetch(uri);
            const blob = await response.blob();

            // Create a unique file name and upload it to Supabase
            const fileName = uri.split('/').pop() ?? 'media';
            const { error } = await supabase.storage.from('media').upload(fileName, blob);

            if (error) {
                console.log(error);
                alert('Error uploading media');
            } else {
                fetchMedia();
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };


    const fetchMedia = async () => {
        // Fetch the list of media files from the storage
        const { data, error } = await supabase.storage.from('media').list();
        if (error) {
            console.log(error);
        } else {
            setMedia(data);
        }
    };

    const renderMediaItem = ({ item }: { item: FileObject }) => {
        const mediaUrl = `${supabase.storage.from('media').getPublicUrl(item.name).data.publicUrl}`;
        if (item.name.endsWith('.mp4') || item.name.endsWith('.mov')) {
            return (
                <View style={styles.mediaContainer}>
                    <Text>Video: {item.name}</Text>
                    {/* You can use Video component here */}
                </View>
            );
        } else {
            return (
                <Image source={{ uri: mediaUrl }} style={styles.image} />
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Hello, World!</Text>
            <Button title={uploading ? "Uploading..." : "Pick Image/Video"} onPress={pickMedia} />
            <FlatList
                data={media}
                renderItem={renderMediaItem}
                keyExtractor={(item) => item.name}
                numColumns={2}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
    },
    image: {
        width: 100,
        height: 100,
        margin: 10,
    },
    mediaContainer: {
        margin: 10,
    },
});

export default Explore;
