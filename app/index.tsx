import Star from '@/components/stars/Star';
import { generateStars, getGradientColors, StarData } from '@/components/stars/utils';
import { delayBetweenShootingStars, InitialNumberOfStars } from '@/constants/Stars';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

export default function StarsScreen() {
    const [stars, setStars] = useState<StarData[]>(generateStars(InitialNumberOfStars));
    const [shootingStarIndex, setShootingStarIndex] = useState<number | null>(null);
    const [gradientColors, setGradientColors] = useState<[string, string]>(getGradientColors());

    useEffect(() => {
        const updateGradient = () => {
            setGradientColors(getGradientColors());
        };

        const interval = setInterval(updateGradient, 60000); // Check every 60 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const chooseShootingStar = () => {
            const randomIndex = Math.floor(Math.random() * stars.length);
            setShootingStarIndex(randomIndex);
        };

        const timeout = setTimeout(chooseShootingStar, Math.random() * delayBetweenShootingStars);

        return () => clearTimeout(timeout);
    }, [shootingStarIndex, stars]);

    const handleShootingComplete = (newX: number, newY: number) => {
        if (shootingStarIndex !== null) {
            const updatedStars = [...stars];
            updatedStars[shootingStarIndex].x = newX;
            updatedStars[shootingStarIndex].y = newY;
            updatedStars[shootingStarIndex].isShootingStar = false;
            setStars(updatedStars);
            setShootingStarIndex(null);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradientColors}
                style={styles.gradientBackground}
            />

            {stars.map((star, index) => (
                <Star
                    key={index}
                    x={star.x}
                    y={star.y}
                    size={star.size}
                    isShootingStar={index === shootingStarIndex}
                    onShootingComplete={index === shootingStarIndex ? handleShootingComplete : undefined}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    gradientBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    nightBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
    },
    dayBackground: {
        ...StyleSheet.absoluteFillObject,
    },
});
