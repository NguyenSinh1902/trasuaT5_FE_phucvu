import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive helper functions based on standard 390x844 (iPhone 12/13/14) screen
const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

export const scale = (size) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size) => (height / guidelineBaseHeight) * size;
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export const windowWidth = width;
export const windowHeight = height;
