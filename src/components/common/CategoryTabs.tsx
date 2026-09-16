import React from 'react';
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isSelected = cat === selectedCategory;
        return (
          <Pressable
            key={cat}
            onPress={() => onSelectCategory(cat)}
            style={[
              styles.tabItem,
              isSelected ? styles.tabSelected : styles.tabUnselected,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                isSelected ? styles.tabTextSelected : styles.tabTextUnselected,
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 6,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabSelected: {
    backgroundColor: Colors.yellowAccent,
    borderColor: Colors.yellowAccent,
  },
  tabUnselected: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  tabText: {
    fontSize: 13,
  },
  tabTextSelected: {
    fontWeight: '800',
    color: Colors.textDark,
  },
  tabTextUnselected: {
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});