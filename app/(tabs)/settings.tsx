import useStarsStore from '@/stores/useStarsStore';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import useZenModeStore from '@/stores/useZenModeStore';
import { Colors } from '@/constants/Colors';

export default function SettingsScreen() {
    const { longPressDuration, setLongPressDuration } = useZenModeStore();
    const [localDuration, setLocalDuration] = useState<number>(longPressDuration);
    const { numberOfStars, setNumberOfStars } = useStarsStore();
    const [localStars, setLocalStars] = useState<number>(numberOfStars);

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(false);

    const handleSave = () => {
        setIsSaving(true);

        setTimeout(() => {
            setNumberOfStars(localStars);
            setLongPressDuration(localDuration);
            setIsSaved(true);
            setIsSaving(false);
        }, 1000);
    };

    const handleSliderChange = (newStars: number, newDuration: number) => {
        if (isSaved) setIsSaved(false);
        setLocalStars(newStars);
        setLocalDuration(newDuration);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Settings</Text>

            <View style={styles.settingGroup}>
                <Text style={styles.label}>Number of Stars</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={10}
                    maximumValue={250}
                    step={1}
                    value={localStars}
                    onValueChange={(value) => handleSliderChange(value, localDuration)}
                    minimumTrackTintColor={Colors.purple}
                    thumbTintColor={Colors.purple}
                />
                <Text style={styles.valueText}>{localStars}</Text>
            </View>

            <View style={styles.settingGroup}>
                <Text style={styles.label}>Zen mode delay (ms)</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={500}
                    maximumValue={3000}
                    step={100}
                    value={localDuration}
                    onValueChange={(value) => handleSliderChange(localStars, value)}
                    minimumTrackTintColor={Colors.purple}
                    thumbTintColor={Colors.purple}
                />
                <Text style={styles.valueText}>{localDuration} ms</Text>
            </View>

            <TouchableOpacity
                style={[styles.saveButton, (isSaved || isSaving) && styles.disabledButton]}
                onPress={handleSave}
                disabled={isSaved || isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.saveButtonText}>
                        {isSaved ? '✓' : 'Save Settings'}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#1A1A1A',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#FFFFFF', // White text for readability
    },
    settingGroup: {
        marginBottom: 30,
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        color: '#E5E5E5', // Light gray for labels
    },
    slider: {
        width: '100%',
        height: 40,
    },
    valueText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        color: '#FFFFFF', // White text for slider values
    },
    saveButton: {
        backgroundColor: Colors.lightPurple, // Primary button color
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFFFFF', // White text for button
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#666666', // Change button color when disabled
    },
});
