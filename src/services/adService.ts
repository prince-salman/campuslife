import AsyncStorage from '@react-native-async-storage/async-storage';
import { PromoBannerModel } from '../models/banner';

type Listener = () => void;

const STORAGE_KEY = 'campuslife_active_ads_v1';

const DEFAULT_ADS: PromoBannerModel[] = [
  {
    id: 'ad_laundry_express',
    title: 'Laundry\nExpress',
    subtitle: 'Menerima Laundry :',
    services: ['Baju', 'Sepatu', 'Selimut', 'Alas Lantai', 'Sprei', 'Jaket'],
    contact: '+123-456-7890',
  },
  {
    id: 'ad_percetakan_fotocopy',
    title: 'Percetakan &\nFotocopy',
    subtitle: 'Layanan Kilat Mahasiswa :',
    services: ['Skripsi', 'Jilid Hardcover', 'Poster A3', 'Stiker'],
    contact: '+123-888-9999',
  },
];

class AdService {
  private static instance: AdService;
  private listeners: Set<Listener> = new Set();
  private ads: PromoBannerModel[] = [...DEFAULT_ADS];
  private isLoaded: boolean = false;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.ads = parsed;
        }
      }
    } catch (e) {
      console.warn('AdService: loadFromStorage error:', e);
    } finally {
      this.isLoaded = true;
      this.notify();
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.ads));
    } catch (e) {
      console.warn('AdService: saveToStorage error:', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public getAds(): PromoBannerModel[] {
    return JSON.parse(JSON.stringify(this.ads));
  }

  public addAd(item: Omit<PromoBannerModel, 'id'>): PromoBannerModel {
    const newAd: PromoBannerModel = {
      id: `ad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: item.title.trim(),
      subtitle: item.subtitle.trim(),
      services: item.services.filter((s) => s.trim().length > 0),
      contact: item.contact.trim(),
    };

    this.ads.unshift(newAd);
    this.saveToStorage();
    this.notify();
    return newAd;
  }

  public updateAd(id: string, updates: Partial<Omit<PromoBannerModel, 'id'>>): boolean {
    const index = this.ads.findIndex((ad) => ad.id === id);
    if (index === -1) return false;

    const existing = this.ads[index];
    this.ads[index] = {
      ...existing,
      title: updates.title !== undefined ? updates.title.trim() : existing.title,
      subtitle: updates.subtitle !== undefined ? updates.subtitle.trim() : existing.subtitle,
      services: updates.services !== undefined ? updates.services.filter((s) => s.trim().length > 0) : existing.services,
      contact: updates.contact !== undefined ? updates.contact.trim() : existing.contact,
    };

    this.saveToStorage();
    this.notify();
    return true;
  }

  public deleteAd(id: string): boolean {
    const initialLen = this.ads.length;
    this.ads = this.ads.filter((ad) => ad.id !== id);
    const deleted = this.ads.length < initialLen;
    if (deleted) {
      this.saveToStorage();
      this.notify();
    }
    return deleted;
  }

  public resetToDefault(): void {
    this.ads = [...DEFAULT_ADS];
    this.saveToStorage();
    this.notify();
  }
}

export const adService = AdService.getInstance();
