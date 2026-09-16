import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { UmkmModel } from '../../models/umkm';

interface UmkmDetailModalProps {
  visible: boolean;
  item: UmkmModel | null;
  onClose: () => void;
}

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  switch (category) {
    case 'Laundry':
      return 'shirt';
    case 'Homestay':
      return 'bed';
    case 'Fotocopy':
      return 'print';
    case 'Holiday':
      return 'airplane';
    case 'F&B':
    default:
      return 'restaurant';
  }
};

const getServicesSectionTitle = (category: string) => {
  switch (category) {
    case 'Laundry':
      return 'Layanan Cuci & Care';
    case 'Homestay':
      return 'Pilihan Kamar & Fasilitas';
    case 'Fotocopy':
      return 'Layanan Print & Jilid';
    case 'Holiday':
      return 'Paket Wisata & Rental';
    case 'F&B':
    default:
      return 'Daftar Menu & Makanan';
  }
};

export const UmkmDetailModal: React.FC<UmkmDetailModalProps> = ({
  visible,
  item,
  onClose,
}) => {
  const { width, height } = useWindowDimensions();
  const [imageError, setImageError] = useState<boolean>(false);

  if (!item) return null;

  const isLargeScreen = width >= 640;
  const categoryIcon = getCategoryIcon(item.category);
  const servicesTitle = getServicesSectionTitle(item.category);

  // Phone call action
  const handleCall = async () => {
    if (!item.phone) {
      Alert.alert('Info', 'Nomor telepon tidak tersedia.');
      return;
    }
    const cleanNumber = item.phone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanNumber}`;
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.open(url, '_self');
        }
        return;
      }
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Kontak Telepon', `Nomor: ${item.phone}`);
      }
    } catch {
      Alert.alert('Kontak Telepon', `Nomor: ${item.phone}`);
    }
  };

  // WhatsApp direct action
  const handleWhatsApp = async () => {
    if (!item.phone) {
      Alert.alert('Info', 'Kontak WhatsApp tidak tersedia.');
      return;
    }
    let clean = item.phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    const message = encodeURIComponent(
      `Halo *${item.name}*, saya mahasiswa yang melihat lapak Anda di aplikasi CampusLife. Mau tanya info order.`
    );
    const waUrl = `https://wa.me/${clean}?text=${message}`;

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.open(waUrl, '_blank');
        }
        return;
      }
      await Linking.openURL(waUrl);
    } catch {
      Alert.alert('Kontak WhatsApp', `Nomor WA: ${item.phone}`);
    }
  };

  // Google Maps navigation action
  const handleOpenMaps = async () => {
    const query = encodeURIComponent(`${item.name} ${item.address || 'Kampus'}`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.open(mapsUrl, '_blank');
        }
        return;
      }
      await Linking.openURL(mapsUrl);
    } catch {
      Alert.alert('Lokasi', `${item.address || item.name}`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isLargeScreen ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.modalCard,
            isLargeScreen ? styles.modalCardDesktop : styles.modalCardMobile,
            { maxHeight: height * 0.9 },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Storefront / Location Hero Photo */}
            <View style={styles.heroContainer}>
              {item.imageUrl && !imageError ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.heroImage}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <View style={[styles.heroPlaceholder, { backgroundColor: Colors.surfaceNavyDark }]}>
                  <Ionicons name={categoryIcon} size={64} color="rgba(255, 255, 255, 0.25)" />
                  <Text style={styles.placeholderText}>{item.name}</Text>
                </View>
              )}

              {/* Gradient Overlay & Top Actions */}
              <View style={styles.heroTopBar}>
                <View style={styles.categoryBadge}>
                  <Ionicons name={categoryIcon} size={14} color={Colors.yellowAccent} />
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>

                <TouchableOpacity
                  style={styles.closeFloatingBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                  accessibilityLabel="Tutup Detail UMKM"
                >
                  <Ionicons name="close" size={20} color={Colors.textWhite} />
                </TouchableOpacity>
              </View>

              {/* Price Tag Pill on Image */}
              {item.priceTag ? (
                <View style={styles.heroPriceBadge}>
                  <Text style={styles.heroPriceText}>Mulai {item.priceTag}</Text>
                </View>
              ) : null}
            </View>

            {/* Content Body */}
            <View style={styles.bodyContent}>
              {/* Title & Tagline */}
              <View style={styles.titleSection}>
                <Text style={styles.businessName}>{item.name}</Text>
                {item.bannerText && item.bannerText !== item.name && (
                  <Text style={styles.taglineText}>{item.bannerText}</Text>
                )}
              </View>

              {/* Rating & Opening Hours Row */}
              <View style={styles.metaRow}>
                {item.rating !== undefined ? (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={15} color={Colors.yellowAccent} />
                    <Text style={styles.ratingValue}>{item.rating.toFixed(1)}</Text>
                    {item.reviewsCount ? (
                      <Text style={styles.reviewsCount}>({item.reviewsCount} ulasan)</Text>
                    ) : null}
                  </View>
                ) : null}

                {item.openingHours ? (
                  <View style={styles.hoursBadge}>
                    <Ionicons name="time-outline" size={13} color="#8FA7D8" />
                    <Text style={styles.hoursText} numberOfLines={1}>
                      {item.openingHours}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Quick Action Buttons */}
              <View style={styles.actionButtonsRow}>
                {item.phone ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.waBtn]}
                      activeOpacity={0.82}
                      onPress={handleWhatsApp}
                    >
                      <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                      <Text style={styles.waBtnText}>WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.callBtn]}
                      activeOpacity={0.82}
                      onPress={handleCall}
                    >
                      <Ionicons name="call" size={18} color={Colors.textWhite} />
                      <Text style={styles.callBtnText}>Telepon</Text>
                    </TouchableOpacity>
                  </>
                ) : null}

                <TouchableOpacity
                  style={[styles.actionBtn, styles.mapsBtn]}
                  activeOpacity={0.82}
                  onPress={handleOpenMaps}
                >
                  <Ionicons name="navigate" size={18} color={Colors.textDark} />
                  <Text style={styles.mapsBtnText}>Maps</Text>
                </TouchableOpacity>
              </View>

              {/* Location & Distance Card */}
              <TouchableOpacity
                style={styles.locationCard}
                activeOpacity={0.85}
                onPress={handleOpenMaps}
              >
                <View style={styles.locationIconBox}>
                  <Ionicons name="location" size={22} color={Colors.yellowAccent} />
                </View>
                <View style={styles.locationTextBox}>
                  <Text style={styles.locationAddress}>
                    {item.address || 'Area Kampus & Sekitarnya'}
                  </Text>
                  {item.distance ? (
                    <Text style={styles.locationDistance}>📍 {item.distance}</Text>
                  ) : null}
                  <Text style={styles.tapMapsHint}>Ketuk untuk buka di Google Maps ↗</Text>
                </View>
              </TouchableOpacity>

              {/* Phone Information Card if available */}
              {item.phone ? (
                <View style={styles.phoneInfoCard}>
                  <Ionicons name="call-outline" size={18} color="#8FA7D8" />
                  <Text style={styles.phoneInfoText}>
                    Kontak: <Text style={styles.phoneHighlight}>{item.phone}</Text>
                  </Text>
                </View>
              ) : null}

              {/* Services & Menus Section */}
              <View style={styles.servicesSection}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionIndicator} />
                  <Text style={styles.servicesSectionTitle}>{servicesTitle}</Text>
                </View>

                {item.services && item.services.length > 0 ? (
                  <View style={styles.servicesList}>
                    {item.services.map((service, index) => (
                      <View key={`${service.name}-${index}`} style={styles.serviceItemCard}>
                        <View style={styles.serviceItemHeader}>
                          <Text style={styles.serviceItemName}>{service.name}</Text>
                          <View style={styles.servicePriceBadge}>
                            <Text style={styles.servicePriceText}>{service.price}</Text>
                          </View>
                        </View>
                        {service.description ? (
                          <Text style={styles.serviceItemDesc}>{service.description}</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyServicesBox}>
                    <Ionicons name="information-circle-outline" size={24} color={Colors.textMuted} />
                    <Text style={styles.emptyServicesText}>
                      Daftar menu &amp; paket lengkap dapat langsung ditanyakan melalui WhatsApp atau datang ke lapak.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 9, 20, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  modalCardDesktop: {
    width: '92%',
    maxWidth: 620,
  },
  modalCardMobile: {
    width: '100%',
    maxHeight: '92%',
    position: 'absolute',
    bottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  scrollContainer: {
    paddingBottom: 28,
  },
  heroContainer: {
    height: 210,
    width: '100%',
    backgroundColor: '#0B1120',
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  heroTopBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 15, 30, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(236, 229, 72, 0.3)',
    gap: 5,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  closeFloatingBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroPriceBadge: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(236, 229, 72, 0.4)',
  },
  heroPriceText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.yellowAccent,
  },
  bodyContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  titleSection: {
    marginBottom: 8,
  },
  businessName: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    color: Colors.textWhite,
  },
  taglineText: {
    fontSize: 13,
    color: Colors.yellowAccent,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  reviewsCount: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  hoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    flexShrink: 1,
  },
  hoursText: {
    fontSize: 11,
    color: '#8FA7D8',
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  waBtn: {
    backgroundColor: '#1E7E34',
  },
  waBtnText: {
    fontWeight: '800',
    fontSize: 13,
    color: '#FFFFFF',
  },
  callBtn: {
    backgroundColor: '#2563EB',
  },
  callBtnText: {
    fontWeight: '800',
    fontSize: 13,
    color: Colors.textWhite,
  },
  mapsBtn: {
    backgroundColor: Colors.yellowAccent,
  },
  mapsBtnText: {
    fontWeight: '800',
    fontSize: 13,
    color: Colors.textDark,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#131D33',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E2F55',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  locationIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(236, 229, 72, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  locationTextBox: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textWhite,
    lineHeight: 18,
  },
  locationDistance: {
    fontSize: 12,
    color: Colors.yellowAccent,
    fontWeight: '700',
    marginTop: 3,
  },
  tapMapsHint: {
    fontSize: 11,
    color: '#8FA7D8',
    marginTop: 4,
    fontWeight: '500',
  },
  phoneInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131D33',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1E2F55',
    marginBottom: 18,
    gap: 8,
  },
  phoneInfoText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  phoneHighlight: {
    color: Colors.textWhite,
    fontWeight: '700',
  },
  servicesSection: {
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: Colors.yellowAccent,
  },
  servicesSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  servicesList: {
    gap: 8,
  },
  serviceItemCard: {
    backgroundColor: '#131D33',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
  },
  serviceItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  serviceItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textWhite,
    flex: 1,
  },
  servicePriceBadge: {
    backgroundColor: 'rgba(236, 229, 72, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(236, 229, 72, 0.35)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  servicePriceText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.yellowAccent,
  },
  serviceItemDesc: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  emptyServicesBox: {
    padding: 20,
    backgroundColor: '#131D33',
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  emptyServicesText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
