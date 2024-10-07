import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import useZenModeStore from '@/stores/useZenModeStore';

interface ProgressBarProps {
    progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    const { isZenMode } = useZenModeStore();
    const animatedProgress = useRef(new Animated.Value(0)).current; // Animated value for progress

    // Animate progress bar width smoothly
    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: progress,
            duration: 500, // Animation duration (in milliseconds)
            useNativeDriver: false, // Native driver is not used for width animation
        }).start();
    }, [progress]);

    return (
        <View style={[styles.progressBarContainer, isZenMode ? styles.zenModeContainer : styles.normalContainer]}>
            <Animated.View
                style={[
                    styles.progressBar,
                    {
                        width: animatedProgress.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'], // Smoothly animate width from 0% to 100%
                        }),
                    },
                    isZenMode ? styles.zenProgressBar : styles.normalProgressBar,
                ]}
            />
            <Text style={[styles.progressText, isZenMode && styles.zenProgressText]}>
                {progress < 100 ? `${Math.floor(progress)}%` : 'Upload Complete'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    progressBarContainer: {
        height: 16,
        width: '100%',
        borderRadius: 8, // iOS-like rounded corners
        marginVertical: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E5E5EA', // iOS light gray background for progress container
        overflow: 'hidden',
    },
    progressBar: {
        position: 'absolute',
        height: '100%',
        borderRadius: 8, // Rounded corners for the progress bar
    },
    normalContainer: {
        backgroundColor: '#E5E5EA', // iOS-style container background
    },
    zenModeContainer: {
        backgroundColor: '#333', // Darker background for Zen mode
    },
    normalProgressBar: {
        backgroundColor: '#007AFF', // iOS system blue for the progress
    },
    zenProgressBar: {
        backgroundColor: '#34C759', // iOS green for Zen Mode (matches iOS status colors)
    },
    progressText: {
        fontSize: 14,
        color: '#000', // iOS black for normal text
        fontWeight: '600', // Medium weight text, common in iOS for readable bold text
        textAlign: 'center',
    },
    zenProgressText: {
        color: '#fff', // White text for Zen mode
    },
});

export default ProgressBar;
