import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { PromoBannerModel } from '../../models/banner';

interface PromoBannerSliderProps {
  banners: PromoBannerModel[];
}

export const PromoBannerSlider: React.FC<PromoBannerSliderProps> = ({ banners }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {banners.map((b) => (
        <View key={b.id} style={styles.banner}>
          <View style={styles.inner}>
            <Text style={styles.bannerTitle}>{b.title}</Text>
            <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
            <Text style={styles.servicesText}>{b.services.join(' • ')}</Text>
            <Text style={styles.contactText}>Hubungi: {b.contact}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    gap: 12,
  },
  banner: {
    width: 280,
    backgroundColor: Colors.blueCardStart,
    borderRadius: 18,
    padding: 16,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'column',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.yellowAccent,
    marginBottom: 6,
  },
  servicesText: {
    fontSize: 11,
    color: Colors.textWhite,
    opacity: 0.85,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textWhite,
  },
});