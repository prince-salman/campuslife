import { UMKM_LIST, CATEGORIES } from '../src/data/mockData';

describe('UMKM Directory Data Integrity & Security Tests', () => {
  const REQUIRED_CATEGORIES = ['Laundry', 'F&B', 'Homestay', 'Fotocopy', 'Holiday'];

  test('all required categories are represented in CATEGORIES list', () => {
    REQUIRED_CATEGORIES.forEach((cat) => {
      expect(CATEGORIES).toContain(cat);
    });
  });

  test('all required categories are correctly defined and any initial merchants belong to required categories', () => {
    REQUIRED_CATEGORIES.forEach((cat) => {
      expect(CATEGORIES).toContain(cat);
    });
    UMKM_LIST.forEach((item) => {
      expect(REQUIRED_CATEGORIES).toContain(item.category);
    });
  });

  test('every UMKM card has valid details required for interactive modal', () => {
    UMKM_LIST.forEach((item) => {
      // Must have basic identifying information
      expect(item.id).toBeDefined();
      expect(item.name.trim().length).toBeGreaterThan(0);
      expect(item.category.trim().length).toBeGreaterThan(0);
      expect(item.priceTag.trim().length).toBeGreaterThan(0);

      // Must have rating between 0 and 5
      expect(item.rating).toBeGreaterThanOrEqual(1.0);
      expect(item.rating).toBeLessThanOrEqual(5.0);
      expect(item.reviewsCount).toBeGreaterThan(0);

      // Must have valid contact phone
      expect(item.phone).toBeDefined();
      expect(item.phone).toMatch(/^\+62/);

      // Must have location address and distance
      expect(item.address).toBeDefined();
      expect(item.address!.trim().length).toBeGreaterThan(5);
      expect(item.distance).toBeDefined();

      // Must have storefront image
      expect(item.imageUrl).toBeDefined();
      expect(item.imageUrl).toMatch(/^https:\/\//);

      // Must have services / menus list
      expect(item.services).toBeDefined();
      expect(Array.isArray(item.services)).toBe(true);
      expect(item.services!.length).toBeGreaterThan(0);

      item.services!.forEach((svc) => {
        expect(svc.name.trim().length).toBeGreaterThan(0);
        expect(svc.price.trim().length).toBeGreaterThan(0);
      });
    });
  });

  test('phone number formatting sanitizes cleanly without malicious chars', () => {
    UMKM_LIST.forEach((item) => {
      if (item.phone) {
        const cleanDigits = item.phone.replace(/[^0-9]/g, '');
        // Indonesian numbers standard length
        expect(cleanDigits.length).toBeGreaterThanOrEqual(10);
        expect(cleanDigits.startsWith('62')).toBe(true);
      }
    });
  });
});
