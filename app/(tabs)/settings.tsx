// app/components/SettingsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Switch,
    Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import useZenModeStore from '@/stores/useZenModeStore';
import { useSettingsOptions } from '@/hooks/useSettingsOptions';
import { getGradientColors } from '@/components/stars/utils'; // Import the utility
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

export default function SettingsScreen() {
    const { settings, loading, error, updateSettings } = useSettingsOptions();
    const { isZenMode } = useZenModeStore();

    // Determine currentColors based on Zen Mode
    const currentColors = isZenMode ? Colors.zen : Colors.default;

    // Local state for sliders and toggle
    const [localDuration, setLocalDuration] = useState<number>(1000);
    const [localStars, setLocalStars] = useState<number>(100);
    const [localMediaItems, setLocalMediaItems] = useState<number>(10);
    const [useDynamicBackground, setUseDynamicBackground] = useState<boolean>(true); // New state

    // State to handle saving status
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(false);

    // State for dynamic background colors
    const [gradientColors, setGradientColors] = useState<[string, string]>(getGradientColors());

    // Initialize local state with fetched settings
    useEffect(() => {
        if (settings) {
            setLocalStars(settings.numberOfStars);
            setLocalDuration(settings.longPressDuration);
            setLocalMediaItems(settings.numberOfMediaItems);
            setUseDynamicBackground(settings.useDynamicBackground); // Initialize toggle
        }
    }, [settings]);

    // Handle saving settings
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettings({
                numberOfStars: localStars,
                longPressDuration: localDuration,
                numberOfMediaItems: localMediaItems,
                useDynamicBackground, // Save toggle state
            });
            setIsSaved(true);
        } catch (error) {
            console.error('Failed to save settings', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle slider value changes
    const handleSliderChange = (sliderType: 'stars' | 'duration' | 'mediaItems', value: number) => {
        if (isSaved) setIsSaved(false);
        switch (sliderType) {
            case 'stars':
                setLocalStars(value);
                break;
            case 'duration':
                setLocalDuration(value);
                break;
            case 'mediaItems':
                setLocalMediaItems(value);
                break;
            default:
                break;
        }
    };

    // Handle toggle change
    const handleToggleChange = (value: boolean) => {
        setUseDynamicBackground(value);
        if (isSaved) setIsSaved(false);
    };

    // Update gradient colors periodically if dynamic background is enabled
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (useDynamicBackground) {
            const updateGradient = () => {
                setGradientColors(getGradientColors());
            };

            // Initial update
            updateGradient();

            // Update every 60 seconds
            interval = setInterval(updateGradient, 60000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [useDynamicBackground]);

    // Define static background colors based on Zen Mode
    const staticBackgroundColors = isZenMode
        ? [Colors.zen.background, Colors.zen.backgroundSecondary]
        : [Colors.default.background, Colors.default.backgroundSecondary];

    // Determine the background to use
    const backgroundColors = useDynamicBackground ? gradientColors : staticBackgroundColors;

    // Show loading indicator while fetching settings
    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: currentColors.background }]}>
                <ActivityIndicator size="large" color={currentColors.blue} />
            </View>
        );
    }

    // Show error message if fetching settings fails
    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
                <Text style={[styles.errorText, { color: currentColors.red }]}>
                    Error loading settings: {error}
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Conditional Background */}
            {useDynamicBackground ? (
                <LinearGradient colors={backgroundColors as [string, string]} style={styles.gradientBackground} />
            ) : (
                <View style={[styles.staticBackground, { backgroundColor: staticBackgroundColors[0] }]} />
            )}

            {/* Overlay Content */}
            <View style={styles.contentContainer}>
                {/* Header */}
                <Text style={[styles.header, { color: currentColors.text }]}>Settings</Text>

                {/* Number of Stars Slider */}
                <View style={styles.settingGroup}>
                    <Text style={[styles.label, { color: currentColors.text }]}>Number of Stars</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={10}
                        maximumValue={250}
                        step={1}
                        value={localStars}
                        onValueChange={(value) => handleSliderChange('stars', value)}
                        minimumTrackTintColor={currentColors.blue}
                        thumbTintColor={currentColors.blue}
                    />
                    <Text style={[styles.valueText, { color: currentColors.text }]}>{localStars}</Text>
                </View>

                {/* Zen Mode Delay Slider */}
                <View style={styles.settingGroup}>
                    <Text style={[styles.label, { color: currentColors.text }]}>Zen Mode Delay (ms)</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={500}
                        maximumValue={3000}
                        step={100}
                        value={localDuration}
                        onValueChange={(value) => handleSliderChange('duration', value)}
                        minimumTrackTintColor={currentColors.blue}
                        thumbTintColor={currentColors.blue}
                    />
                    <Text style={[styles.valueText, { color: currentColors.text }]}>{localDuration} ms</Text>
                </View>

                {/* Number of Media Items Slider */}
                <View style={styles.settingGroup}>
                    <Text style={[styles.label, { color: currentColors.text }]}>Number of Media Items</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={5}
                        maximumValue={25}
                        step={1}
                        value={localMediaItems}
                        onValueChange={(value) => handleSliderChange('mediaItems', value)}
                        minimumTrackTintColor={currentColors.blue}
                        thumbTintColor={currentColors.blue}
                    />
                    <Text style={[styles.valueText, { color: currentColors.text }]}>{localMediaItems}</Text>
                </View>

                {/* Dynamic Background Toggle */}
                <View style={styles.settingGroup}>
                    <Text style={[styles.label, { color: currentColors.text }]}>Use Dynamic Background Colors</Text>
                    <Switch
                        value={useDynamicBackground}
                        onValueChange={handleToggleChange}
                        trackColor={{
                            false: '#767577',
                            true: Platform.OS === 'ios' ? undefined : '#34C759', // Use default iOS green by not setting on iOS
                        }}
                        thumbColor={
                            Platform.OS === 'android'
                                ? useDynamicBackground
                                    ? currentColors.blue
                                    : '#f4f3f4'
                                : undefined // Use default iOS thumb color
                        }
                        ios_backgroundColor="#767577" // iOS default track color when off
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (isSaved || isSaving) && styles.disabledButton,
                        { backgroundColor: isSaved ? currentColors.green : currentColors.blue }
                    ]}
                    onPress={handleSave}
                    disabled={isSaved || isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>
                            {isSaved ? '✓ Saved' : 'Save Settings'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    gradientBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    staticBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    settingGroup: {
        marginBottom: 30,
        padding: 15,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
        // Changed flexDirection from 'row' to 'column' to stack label, slider, and value vertically
        flexDirection: 'column',
        alignItems: 'center',
    },
    toggleGroup: {
        marginBottom: 30,
        padding: 15,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
        flexDirection: 'row',
        alignItems: 'center',

        // Added for better alignment
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
        textAlign: 'center', // Center the label text
        width: '100%', // Ensure label takes full width for centering
    },
    slider: {
        width: '100%',
        height: 40,
    },
    valueText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    saveButton: {
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#A6A6A6',
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#FF3B30', // Dynamic via style
    },
});
