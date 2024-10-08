import SunCalc from 'suncalc';
import { Dimensions } from 'react-native';
import opentype from 'opentype.js';
import RNFS from 'react-native-fs';
const { width, height } = Dimensions.get('window');

export type StarData = {
  x: number;
  y: number;
  size: number;
  isShootingStar: boolean;
};

export const generateStars = (numStars: number): StarData[] => {
  return Array.from({ length: numStars }).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3 + 1,
    isShootingStar: false,
  }));
};

export const lerpColor = (color1: string, color2: string, factor: number) => {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const getGradientColors = (): [string, string] => {
  const currentDate = new Date();
  const lat = 45.5017;
  const lon = -73.5673;

  const sunPos = SunCalc.getPosition(currentDate, lat, lon);
  const altitudeDeg = (sunPos.altitude * 180) / Math.PI;

  let factor: number;

  if (altitudeDeg <= -6) {
    factor = 0;
  } else if (altitudeDeg > -6 && altitudeDeg < 0) {
    factor = ((altitudeDeg + 6) / 6) * 0.5;
  } else if (altitudeDeg >= 0 && altitudeDeg <= 90) {
    factor = 0.5 + (altitudeDeg / 90) * 0.5;
  } else {
    factor = 1;
  }

  const nightColor1 = '#0B0C10';
  const nightColor2 = '#1F2833';

  const dawnDuskColor1 = '#FF4500';
  const dawnDuskColor2 = '#FFA500';

  const dayColor1 = '#87CEEB';
  const dayColor2 = '#ADD8E6';

  let color1, color2;

  if (factor <= 0.5) {
    const localFactor = factor * 2;
    color1 = lerpColor(nightColor1, dawnDuskColor1, localFactor);
    color2 = lerpColor(nightColor2, dawnDuskColor2, localFactor);
  } else {
    const localFactor = (factor - 0.5) * 2;
    color1 = lerpColor(dawnDuskColor1, dayColor1, localFactor);
    color2 = lerpColor(dawnDuskColor2, dayColor2, localFactor);
  }

  return [color1, color2];
};

export const generateStarsFromMessage = (message: string[]): StarData[] => {
  const stars: StarData[] = [];
  const numRows = message.length;
  const numCols = message.reduce((max, line) => Math.max(max, line.length), 0);

  // Determine the cell size based on desired scaling
  const desiredWidth = width * 0.7; // Use 80% of screen width
  const desiredHeight = height * 0.7; // Use 80% of screen height
  const cellWidth = desiredWidth / numCols;
  const cellHeight = desiredHeight / numRows;

  const xOffset = (width - desiredWidth) / 2;
  const yOffset = (height - desiredHeight) / 2;

  for (let row = 0; row < numRows; row++) {
    const line = message[row];
    for (let col = 0; col < line.length; col++) {
      const char = line[col];
      if (char === '*') {
        // Only create stars where there is an asterisk
        const x = xOffset + col * cellWidth + cellWidth / 2;
        const y = yOffset + row * cellHeight + cellHeight / 2;
        stars.push({
          x,
          y,
          size: Math.random() * 5 + 5, // Increase size to 5-10
          isShootingStar: false,
        });
      }
    }
  }

  return stars;
};
