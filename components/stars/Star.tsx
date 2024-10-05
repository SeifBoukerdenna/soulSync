import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
import { StarData } from './utils';

const { width, height } = Dimensions.get('window');


export type StarProps = StarData & {
    onShootingComplete?: (newX: number, newY: number) => void;
};


const Star = ({ x, y, size, isShootingStar, onShootingComplete }: StarProps) => {
    const animation = useRef(new Animated.Value(1)).current;
    const shootingStarX = useRef(new Animated.Value(x)).current;
    const shootingStarY = useRef(new Animated.Value(y)).current;

    useEffect(() => {
        const twinkle = Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 0.5,
                    duration: Math.random() * 2000 + 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(animation, {
                    toValue: 1,
                    duration: Math.random() * 2000 + 1000,
                    useNativeDriver: false,
                }),
            ])
        );
        twinkle.start();

        if (isShootingStar) {
            const finalX = Math.random() * width;
            const finalY = Math.random() * height;

            const shoot = Animated.sequence([
                Animated.parallel([
                    Animated.timing(shootingStarX, {
                        toValue: finalX,
                        duration: 1000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(shootingStarY, {
                        toValue: finalY,
                        duration: 1000,
                        useNativeDriver: false,
                    }),
                ]),
            ]);

            shoot.start(() => {
                if (onShootingComplete) {
                    onShootingComplete(finalX, finalY);
                }
            });
        }

        return () => {
            twinkle.stop();
            if (isShootingStar) {
                shootingStarX.stopAnimation();
                shootingStarY.stopAnimation();
            }
        };
    }, [isShootingStar]);

    return (
        <Animated.View
            style={[
                styles.star,
                {
                    width: size,
                    height: size,
                    opacity: animation,
                    left: isShootingStar ? shootingStarX : x,
                    top: isShootingStar ? shootingStarY : y,
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    star: {
        position: 'absolute',
        borderRadius: 50,
        backgroundColor: 'white',
    },
});

export default Star;
