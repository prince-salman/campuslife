import React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Colors } from '../../constants/colors';
import { UmkmModel } from '../../models/umkm';
import { Ionicons } from '@expo/vector-icons';

interface UmkmGridProps {
  items: UmkmModel[];
  onItemPress?: (item: UmkmModel) => void;
}

export const UmkmGrid: React.FC<UmkmGridProps> = ({ items, onItemPress }) => {
  const { width } = useWindowDimensions();

  const getResponsiveCardWidth = () => {
    if (width >= 960) return '18.4%'; // 5 columns on wide desktop
    if (width >= 640) return '23.4%'; // 4 columns on tablet / medium desktop
    if (width >= 400) return '31.2%'; // 3 columns on standard mobile
    return '48%'; // 2 columns on small mobile
  };

  const cardWidth = getResponsiveCardWidth();

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onItemPress?.(item)}
          style={[styles.card, { width: cardWidth, backgroundColor: item.cardColorHex }]}
        >
          <View style={styles.badgeRow}>
            <Text style={styles.priceBadge}>{item.priceTag}</Text>
            {item.rating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={11} color={Colors.yellowAccent} />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.bannerText} numberOfLines={1}>
            {item.bannerText}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  card: {
    minWidth: 100,
    borderRadius: 14,
    padding: 10,
    minHeight: 115,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.yellowAccent,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  nameText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textWhite,
    marginTop: 12,
  },
  bannerText: {
    fontSize: 10,
    color: Colors.textWhite,
    opacity: 0.7,
  },
});