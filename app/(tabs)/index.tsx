import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Button, Modal, View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Star from '@/components/stars/Star';
import { generateStarsFromMessage, getGradientColors } from '@/components/stars/utils';
import { LinearGradient } from 'expo-linear-gradient';
import useStarsStore from '@/stores/useStarsStore';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  const stars = useMemo(() => generateStarsFromMessage(starMessage), [numberOfStars]);

  useEffect(() => {
    const updateGradient = () => {
      setGradientColors(getGradientColors());
    };

    const interval = setInterval(updateGradient, 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.8, // Scale down on press
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1, // Scale back to normal
      useNativeDriver: true,
    }).start();
    setModalVisible(true); // Open the modal on press out
  };

  const poemLeftColumn = `A Love That Defines Us \n
If I loved you only for your beauty,
It would be a fleeting passion, shallow and brief.
But I love you for the kindness you breathe,
A warmth that heals, a gentle belief. \n
If I loved you just for the wealth you possess,
It would be mere interest, empty and cold.
But I love you for the treasures of your heart,
Riches no gold could ever hold. \n
If I loved you because you love me back,
That would be empathy, a mirrored reflection.
But I love you because of who you are,
The very essence of my affection. \n
If I love you despite your imperfections,
It’s because I see the beauty in each flaw.
In every scar, in every shadow,
I find the story that left me in awe. \n
If I love you through every storm we face,
It’s because my commitment runs deep.
I’m here to hold you, to never let go
Through every wave, in every sleep. \n
If I love you for the brilliance of your mind,
It’s because your thoughts are my guiding light.
In every word, in every idea you share,
I find a universe that feels just right. \n
If I love you with a depth that knows no end,
Even when miles keep us apart,
It’s because our souls are forever entwined,
Two halves of one beating heart. \n
`;

  const poemRightColumn = `If I love you by placing you above myself,
It’s because you are my greatest treasure.
Your happiness means more than my own,
In your joy, I find my true measure. \n
If I love you for the laughter we share,
It’s because your joy is the music of my life.
In every giggle, in every smile,
You lift me beyond all strife. \n
If I love you for the memories we've made,
It’s because they are the roots of our love, deep and strong.
Each moment we've lived, each step we've taken,
Is a note in our love’s sweetest song. \n
And if I find myself loving you more with each day,
It’s because my heart belongs only to you.
In every thought, in every dream,
It’s your face that I see, your love that I pursue. \n
And as I look ahead to the future we’ll build,
I can’t imagine a world without you.
You’re not just a part of my life, my love,
You are my life, my dream come true. \n
So, take this heart, these words, this soul,
They’re all I have, and they’re all yours to keep.
For in you, I’ve found my forever home, \n \n
In your love, my heart finds its deepest sleep.

September 6, 2024`;

  // Load the custom font
  const [fontsLoaded] = useFonts({
    'DancingScript': require('@expo-google-fonts/dancing-script/DancingScript_400Regular.ttf'),
  });

  if (!fontsLoaded) {
    SplashScreen.preventAutoHideAsync();
    return null;
  }

  SplashScreen.hideAsync();
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradientColors} style={styles.gradientBackground} />


      {/* Heart Icon Button */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.heartButton}
      >
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Ionicons name="heart" size={50} color="white" />
        </Animated.View>
      </Pressable>


      {/* Stars */}
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
      {/* Modal to display the poem */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <View style={styles.background}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                <View style={styles.poemContainer}>
                  <Text style={[styles.poemText, styles.cursiveFont]}>{poemLeftColumn}</Text>
                  <Text style={[styles.poemText, styles.cursiveFont]}>{poemRightColumn}</Text>
                </View>
              </ScrollView>
            </View>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent background
  },
  heartButton: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'transparent', // Optional: Add background to the icon if needed
  },
  modalView: {
    backgroundColor: 'transparent', // No solid color because of background styling
    padding: 20,
    borderRadius: 10,
    width: '90%',  // Centering width
    height: '85%', // Height for more real estate
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  background: {
    backgroundColor: '#f4e1c1', // Light beige color to resemble aged paper
    padding: 20,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poemText: {
    fontSize: 16,
    textAlign: 'left',
    width: '48%',
    marginBottom: 20,
    paddingHorizontal: 10, // Padding to add spacing
    color: '#4b3b29', // Dark brown text color for vintage effect
  },
  cursiveFont: {
    fontFamily: 'DancingScript',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
