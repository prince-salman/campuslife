export interface UmkmServiceItem {
  name: string;
  price: string;
  description?: string;
}

export interface UmkmModel {
  id: string;
  name: string;
  category: string;
  priceTag: string;
  rating?: number;
  reviewsCount?: number;
  bannerText: string;
  cardColorHex: string;
  imageUrl?: string;
  phone?: string;
  address?: string;
  distance?: string;
  openingHours?: string;
  services?: UmkmServiceItem[];
}