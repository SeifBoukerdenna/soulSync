import { Dimensions } from 'react-native';

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
    const currentHour = new Date().getHours();
    console.log(currentHour);
    const isDay = currentHour >= 6 && currentHour < 18;

    const dayColor1 = '#1E3C72';
    const dayColor2 = '#2A5298';

    const nightColor1 = '#000000';
    const nightColor2 = '#1C1C1C';

    let factor: number;
    if (isDay) {
        factor = (currentHour - 6) / 12;
        return [lerpColor(nightColor1, dayColor1, factor), lerpColor(nightColor2, dayColor2, factor)];
    } else {
        if (currentHour >= 18) {
            factor = (currentHour - 18) / 12;
        } else {
            factor = (currentHour + 6) / 12;
        }
        return [lerpColor(dayColor1, nightColor1, factor), lerpColor(dayColor2, nightColor2, factor)];
    }
};

