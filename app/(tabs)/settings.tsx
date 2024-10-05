import useStarsStore from '@/stores/starStore';
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

export default function SettingsScreen() {
    const { numberOfStars, setNumberOfStars } = useStarsStore();
    const [localStars, setLocalStars] = useState<number>(numberOfStars);

    const handleSave = () => {
        setNumberOfStars(localStars);
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
