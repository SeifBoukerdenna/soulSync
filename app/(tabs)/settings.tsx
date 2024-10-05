import useStarsStore from '@/stores/usestarsStore';
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import useZenModeStore from '@/stores/useZenModeStore';

export default function SettingsScreen() {
    const { longPressDuration, setLongPressDuration } = useZenModeStore();
    const [localDuration, setLocalDuration] = useState<number>(longPressDuration);
    const { numberOfStars, setNumberOfStars } = useStarsStore();
    const [localStars, setLocalStars] = useState<number>(numberOfStars);

    const handleSave = () => {
        setNumberOfStars(localStars);
        setLongPressDuration(localDuration);
        alert('Settings saved!');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Number of Stars</Text>
            <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={250}
                step={1}
                value={localStars}
                onValueChange={setLocalStars}
            />
            <Text style={styles.valueText}>{localStars}</Text>
            <Text style={styles.label}>Zen mode delay (ms)</Text>
            <Slider
                style={styles.slider}
                minimumValue={500}
                maximumValue={3000}
                step={100}
                value={localDuration}
                onValueChange={setLocalDuration}
            />
            <Text style={styles.valueText}>{localDuration} ms</Text>
            <Button title="Save Settings" onPress={handleSave} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    valueText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
});