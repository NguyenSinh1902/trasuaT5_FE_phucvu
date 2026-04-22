import React, { useRef, useEffect, useState } from 'react';
import { View, FlatList, Image, StyleSheet, Dimensions } from 'react-native';

const IMAGES = [
  'https://i.pinimg.com/736x/bb/8f/c2/bb8fc2b9ed61ac0b81547c0a99a02760.jpg',
  'https://i.pinimg.com/736x/b6/d2/0a/b6d20ac0b71b421e11386a6eb7dbb5c0.jpg',
  'https://i.pinimg.com/webp85/736x/f2/8a/48/f28a4861f753337b4638f806d3655877.webp'
];

const { width: screenWidth } = Dimensions.get('window');

const ImageCarousel = () => {
  const flatListRef = useRef(null);
  const [index, setIndex] = useState(0);

  // The left side handles about 50-60% of the screen. Let's dynamically get layout width if possible, 
  // or statically calculate for tablet (width * 0.55).
  const isTablet = screenWidth > 768;
  const slideWidth = isTablet ? screenWidth * 0.55 : screenWidth;

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (index + 1) % IMAGES.length;
      setIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [index, slideWidth]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={IMAGES}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        getItemLayout={(data, index) => (
          { length: slideWidth, offset: slideWidth * index, index }
        )}
        renderItem={({ item }) => (
          <View style={{ width: slideWidth, alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
      />
      
      {/* Pagination Indicators */}
      <View style={styles.paginationContainer}>
        {IMAGES.map((_, i) => (
          <View 
            key={i} 
            style={[styles.dot, i === index ? styles.activeDot : null]} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  image: {
    width: '65%',
    aspectRatio: 1, // Vuông
    borderRadius: 24,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  paginationContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(45, 90, 39, 0.3)', // Dark green faded
    marginHorizontal: 6,
  },
  activeDot: {
    width: 24, // Dài ra thành hình chữ nhật
    backgroundColor: '#2D5A27', // Dark green solid
  }
});

export default ImageCarousel;
