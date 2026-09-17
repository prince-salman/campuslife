import { adService } from '../src/services/adService';

describe('AdService Unit Tests', () => {
  beforeEach(() => {
    adService.resetToDefault();
  });

  test('should return initial default ads matching user specifications', () => {
    const ads = adService.getAds();
    expect(ads.length).toBeGreaterThanOrEqual(2);

    const laundryAd = ads.find((a) => a.title.includes('Laundry'));
    expect(laundryAd).toBeDefined();
    expect(laundryAd?.subtitle).toBe('Menerima Laundry :');
    expect(laundryAd?.services).toContain('Baju');
    expect(laundryAd?.services).toContain('Sepatu');
    expect(laundryAd?.contact).toBe('+123-456-7890');

    const printAd = ads.find((a) => a.title.includes('Percetakan'));
    expect(printAd).toBeDefined();
    expect(printAd?.subtitle).toBe('Layanan Kilat Mahasiswa :');
    expect(printAd?.services).toContain('Skripsi');
    expect(printAd?.contact).toBe('+123-888-9999');
  });

  test('should add new promo ad banner successfully', () => {
    const listener = jest.fn();
    const unsub = adService.subscribe(listener);

    const newAd = adService.addAd({
      title: 'Rental Laptop Kampus',
      subtitle: 'Spesial Ujian & Skripsi :',
      services: ['Core i7', '16GB RAM', 'Charger Siap Pakai'],
      contact: '0812-3333-4444',
    });

    expect(newAd.id).toBeDefined();
    expect(listener).toHaveBeenCalled();

    const ads = adService.getAds();
    expect(ads[0].title).toBe('Rental Laptop Kampus');
    expect(ads[0].contact).toBe('0812-3333-4444');

    unsub();
  });

  test('should update existing promo ad banner', () => {
    const ads = adService.getAds();
    const target = ads[0];

    const updated = adService.updateAd(target.id, {
      title: 'Laundry Kilat 1 Hari',
      contact: '0811-9999-8888',
    });

    expect(updated).toBe(true);

    const newAds = adService.getAds();
    const found = newAds.find((a) => a.id === target.id);
    expect(found?.title).toBe('Laundry Kilat 1 Hari');
    expect(found?.contact).toBe('0811-9999-8888');
  });

  test('should delete promo ad banner', () => {
    const ads = adService.getAds();
    const target = ads[0];
    const initialCount = ads.length;

    const deleted = adService.deleteAd(target.id);
    expect(deleted).toBe(true);

    const newAds = adService.getAds();
    expect(newAds.length).toBe(initialCount - 1);
  });
});
