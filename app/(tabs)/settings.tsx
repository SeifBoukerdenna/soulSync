import useStarsStore from '@/stores/useStarsStore';
import useZenModeStore from '@/stores/useZenModeStore';
import useMediaStore from '@/stores/useMediaStore';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { longPressDuration, setLongPressDuration, isZenMode } = useZenModeStore();
    const { numberOfStars, setNumberOfStars } = useStarsStore();
    const { numberOfMediaItems, setNumberOfMediaItems } = useMediaStore();
    const [localDuration, setLocalDuration] = useState<number>(longPressDuration);
    const [localStars, setLocalStars] = useState<number>(numberOfStars);
    const [localMediaItems, setLocalMediaItems] = useState<number>(numberOfMediaItems);

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(false);

    const handleSave = () => {
        setIsSaving(true);

        setTimeout(() => {
            setNumberOfStars(localStars);
            setLongPressDuration(localDuration);
            setNumberOfMediaItems(localMediaItems);
            setIsSaved(true);
            setIsSaving(false);
        }, 1000);
    };

    const handleSliderChange = (newStars: number, newDuration: number, newMediaItems: number) => {
        if (isSaved) setIsSaved(false);
        setLocalStars(newStars);
        setLocalDuration(newDuration);
        setLocalMediaItems(newMediaItems);
    };

    return (
        <SafeAreaView style={[styles.container, isZenMode && styles.zenMode]}>
            <Text style={[styles.header, isZenMode && styles.zenModeTitle]}>Settings</Text>

            <View style={[styles.settingGroup, isZenMode && styles.zenModeSettingGroup]}>
                <Text style={[styles.label, isZenMode && styles.zenModeLabel]}>Number of Stars</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={10}
                    maximumValue={250}
                    step={1}
                    value={localStars}
                    onValueChange={(value) => handleSliderChange(value, localDuration, localMediaItems)}
                    minimumTrackTintColor={Colors.purple}
                    thumbTintColor={Colors.purple}
                />
                <Text style={[styles.valueText, isZenMode && styles.zenModeValueText]}>{localStars}</Text>
            </View>

            <View style={[styles.settingGroup, isZenMode && styles.zenModeSettingGroup]}>
                <Text style={[styles.label, isZenMode && styles.zenModeLabel]}>Zen Mode Delay (ms)</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={500}
                    maximumValue={3000}
                    step={100}
                    value={localDuration}
                    onValueChange={(value) => handleSliderChange(localStars, value, localMediaItems)}
                    minimumTrackTintColor={Colors.purple}
                    thumbTintColor={Colors.purple}
                />
                <Text style={[styles.valueText, isZenMode && styles.zenModeValueText]}>{localDuration} ms</Text>
            </View>

            <View style={[styles.settingGroup, isZenMode && styles.zenModeSettingGroup]}>
                <Text style={[styles.label, isZenMode && styles.zenModeLabel]}>Number of Media Items</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={5}
                    maximumValue={100}
                    step={1}
                    value={localMediaItems}
                    onValueChange={(value) => handleSliderChange(localStars, localDuration, value)}
                    minimumTrackTintColor={Colors.purple}
                    thumbTintColor={Colors.purple}
                />
                <Text style={[styles.valueText, isZenMode && styles.zenModeValueText]}>{localMediaItems}</Text>
            </View>

            <TouchableOpacity
                style={[styles.saveButton, (isSaved || isSaving) && styles.disabledButton, isZenMode && styles.zenModeSaveButton]}
                onPress={handleSave}
                disabled={isSaved || isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={[styles.saveButtonText, isZenMode && styles.zenModeSaveButtonText]}>
                        {isSaved ? '✓ Saved' : 'Save Settings'}
                    </Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F0F0F5',
    },
    zenMode: {
        backgroundColor: '#1C1C1E',
    },
    header: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
        color: '#000000',
    },
    zenModeHeader: {
        color: '#FFFFFF',
    },
    settingGroup: {
        marginBottom: 30,
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    zenModeSettingGroup: {
        backgroundColor: '#2C2C2E',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
        color: '#3C3C43',
    },
    zenModeLabel: {
        color: '#8E8E93',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    valueText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        color: '#8E8E93'
    },
    zenModeTitle: {
        color: '#E5E5EA',
        fontWeight: '400',
    },
    zenModeValueText: {
        color: '#D1D1D6',
    },
    saveButton: {
        backgroundColor: '#007AFF',
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
    zenModeSaveButton: {
        backgroundColor: '#8BC34A',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    zenModeSaveButtonText: {
        color: '#FFFFFF',
    },
    disabledButton: {
        backgroundColor: '#A6A6A6',
    },
});
