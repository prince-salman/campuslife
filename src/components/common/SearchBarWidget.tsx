import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export const SearchBarWidget: React.FC<SearchBarProps> = ({
  placeholder = 'Cari makanan, laundry, berkas...',
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.textWhite,
    fontSize: 14,
    height: '100%',
  },
});