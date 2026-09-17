import { UmkmModel } from '../models/umkm';
import { UMKM_LIST as INITIAL_MOCK_UMKM } from '../data/mockData';
import { supabase } from './supabase';

type Listener = () => void;

class UmkmService {
  private static instance: UmkmService;
  private listeners: Set<Listener> = new Set();
  private umkmList: UmkmModel[] = [...INITIAL_MOCK_UMKM];
  private isLoadedFromRemote: boolean = false;

  public static getInstance(): UmkmService {
    if (!UmkmService.instance) {
      UmkmService.instance = new UmkmService();
    }
    return UmkmService.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Get the current synchronous cache of UMKM items.
   */
  public getUmkmList(): UmkmModel[] {
    return [...this.umkmList];
  }

  /**
   * Fetch latest UMKM list from Supabase.
   * Shared by all users (both students and admins).
   */
  public async fetchUmkmList(): Promise<UmkmModel[]> {
    try {
      const { data, error } = await supabase
        .from('umkm')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to fetch UMKM from Supabase, using cached/mock data:', error.message);
        return this.umkmList;
      }

      if (data && data.length > 0) {
        // Map database columns to UmkmModel
        const mapped: UmkmModel[] = data.map((item: any) => {
          let address = item.address || '';
          let mapsUrl = '';
          const mapsMatch = address.match(/\[MAPS:\s*(.*?)\]/);
          if (mapsMatch) {
            mapsUrl = mapsMatch[1].trim();
            address = address.replace(/\[MAPS:\s*.*?\]/, '').trim();
          }

          return {
            id: String(item.id),
            name: item.name,
            category: item.category,
            priceTag: item.price_tag,
            rating: item.rating !== undefined && item.rating !== null ? Number(item.rating) : 4.8,
            reviewsCount: item.reviews_count || 0,
            bannerText: item.banner_text || '',
            cardColorHex: item.card_color_hex || '#2C2D30',
            imageUrl: item.image_url || '',
            whatsapp: item.phone || '',
            phone: item.phone || '',
            mapsUrl: mapsUrl,
            address: address,
            distance: item.distance || '',
            openingHours: item.opening_hours || '',
            services: Array.isArray(item.services) ? item.services : [],
          };
        });

        this.umkmList = mapped;
        this.isLoadedFromRemote = true;
        this.notify();
        return this.umkmList;
      }

      return this.umkmList;
    } catch (err) {
      console.warn('Error connecting to Supabase for UMKM:', err);
      return this.umkmList;
    }
  }

  /**
   * Create a new UMKM (Admin Privilege).
   */
  public async createUmkm(params: {
    name: string;
    category: string;
    priceTag: string;
    rating?: number;
    bannerText?: string;
    cardColorHex?: string;
    imageUrl?: string;
    whatsapp?: string;
    mapsUrl?: string;
    address?: string;
    distance?: string;
    openingHours?: string;
    services?: Array<{ name: string; price: string; description?: string }>;
  }): Promise<UmkmModel> {
    const newId = `umkm_${Date.now()}`;
    const cleanAddress = params.address?.trim() || 'Kawasan Kampus President University, Cikarang';
    const cleanMaps = params.mapsUrl?.trim() || '';
    const fullDbAddress = cleanMaps ? `${cleanAddress} [MAPS: ${cleanMaps}]` : cleanAddress;
    const cleanWa = params.whatsapp?.trim() || '+62 812-0000-0000';

    const newItem: UmkmModel = {
      id: newId,
      name: params.name.trim(),
      category: params.category,
      priceTag: params.priceTag.trim(),
      rating: params.rating !== undefined ? Number(params.rating) : 4.8,
      reviewsCount: 1,
      bannerText: params.bannerText?.trim() || params.name.trim().toUpperCase(),
      cardColorHex: params.cardColorHex || '#2E6F79',
      imageUrl: params.imageUrl?.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
      whatsapp: cleanWa,
      phone: cleanWa,
      mapsUrl: cleanMaps,
      address: cleanAddress,
      distance: params.distance?.trim() || '100 m dari Kampus',
      openingHours: params.openingHours?.trim() || '08:00 – 21:00 WIB',
      services: params.services || [],
    };

    // Update local state immediately for instant UI response
    this.umkmList.unshift(newItem);
    this.notify();

    // Persist to Supabase if connected
    try {
      const { error } = await supabase.from('umkm').insert({
        id: newId,
        name: newItem.name,
        category: newItem.category,
        price_tag: newItem.priceTag,
        rating: newItem.rating,
        reviews_count: newItem.reviewsCount,
        banner_text: newItem.bannerText,
        card_color_hex: newItem.cardColorHex,
        image_url: newItem.imageUrl,
        phone: newItem.phone,
        address: fullDbAddress,
        distance: newItem.distance,
        opening_hours: newItem.openingHours,
        services: newItem.services,
      });

      if (error) {
        console.warn('Failed to insert UMKM into Supabase:', error.message);
      }
    } catch (e) {
      console.warn('Supabase insert UMKM error:', e);
    }

    return newItem;
  }

  /**
   * Update an existing UMKM (Admin Privilege).
   */
  public async updateUmkm(id: string, updates: Partial<UmkmModel>): Promise<void> {
    const index = this.umkmList.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.umkmList[index] = { ...this.umkmList[index], ...updates };
      if (updates.whatsapp) {
        this.umkmList[index].phone = updates.whatsapp;
      }
      this.notify();
    }

    try {
      const dbPayload: any = {};
      if (updates.name !== undefined) dbPayload.name = updates.name.trim();
      if (updates.category !== undefined) dbPayload.category = updates.category;
      if (updates.priceTag !== undefined) dbPayload.price_tag = updates.priceTag.trim();
      if (updates.rating !== undefined) dbPayload.rating = Number(updates.rating);
      if (updates.bannerText !== undefined) dbPayload.banner_text = updates.bannerText.trim();
      if (updates.cardColorHex !== undefined) dbPayload.card_color_hex = updates.cardColorHex;
      if (updates.imageUrl !== undefined) dbPayload.image_url = updates.imageUrl.trim();
      if (updates.whatsapp !== undefined) dbPayload.phone = updates.whatsapp.trim();
      else if (updates.phone !== undefined) dbPayload.phone = updates.phone.trim();

      if (updates.address !== undefined || updates.mapsUrl !== undefined) {
        const addr = updates.address !== undefined ? updates.address.trim() : (this.umkmList[index]?.address || '');
        const maps = updates.mapsUrl !== undefined ? updates.mapsUrl.trim() : (this.umkmList[index]?.mapsUrl || '');
        dbPayload.address = maps ? `${addr} [MAPS: ${maps}]` : addr;
      }

      if (updates.distance !== undefined) dbPayload.distance = updates.distance.trim();
      if (updates.openingHours !== undefined) dbPayload.opening_hours = updates.openingHours.trim();
      if (updates.services !== undefined) dbPayload.services = updates.services;

      await supabase.from('umkm').update(dbPayload).eq('id', id);
    } catch (e) {
      console.warn('Supabase update UMKM error:', e);
    }
  }

  /**
   * Delete an UMKM (Admin Privilege).
   */
  public async deleteUmkm(id: string): Promise<void> {
    this.umkmList = this.umkmList.filter((u) => u.id !== id);
    this.notify();

    try {
      await supabase.from('umkm').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete UMKM error:', e);
    }
  }
}

export const umkmService = UmkmService.getInstance();
