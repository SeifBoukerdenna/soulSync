import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Star from '@/components/stars/Star';
import { generateStars, generateStarsFromMessage, getGradientColors } from '@/components/stars/utils';
import { LinearGradient } from 'expo-linear-gradient';
import useStarsStore from '@/stores/useStarsStore';
import { delayBetweenShootingStars } from '@/constants/StarsConstants';


const starMessage = [
  "   *******     *******   ",
  "  *       *   *       *  ",
  " *         * *         * ",
  "*           *           *",
  " *                     * ",
  "  *                   *  ",
  "   *                 *   ",
  "    *               *    ",
  "     *             *     ",
  "      *           *      ",
  "       *         *       ",
  "        *       *        ",
  "         *     *         ",
  "          *   *          ",
  "           * *           ",
  "            *            "
];


export default function StarsScreen() {
  const { numberOfStars } = useStarsStore();
  const [gradientColors, setGradientColors] = useState<[string, string]>(getGradientColors());

  const stars = useMemo(() => generateStarsFromMessage(starMessage), [numberOfStars]);


  useEffect(() => {
    const updateGradient = () => {
      setGradientColors(getGradientColors());
    };

    const interval = setInterval(updateGradient, 60000);
    return () => clearInterval(interval);
  }, []);



  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradientColors} style={styles.gradientBackground} />
      {stars.map((star, index) => (
        <Star
          key={index}
          x={star.x}
          y={star.y}
          size={star.size}
          isShootingStar={false}
          onShootingComplete={undefined}
        />
      ))}
    </SafeAreaView>
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
});
