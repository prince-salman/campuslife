# CampusLife — React Native Multi-Platform Application

CampusLife mobile & desktop application built with React Native and TypeScript, capable of running natively on **Android**, **iOS**, **macOS**, and **Windows**.

## Cross-Platform Support

| Platform | Runtime Environment | How to Run |
| :--- | :--- | :--- |
| **Android** | Android Emulator / Physical Device via Expo Go or Prebuild | `npm run android` |
| **iOS** | iOS Simulator / iPhone via Expo Go or Xcode | `npm run ios` |
| **macOS** | Desktop Web / Safari / WebKit or Electron / React Native macOS | `npm run web` |
| **Windows** | Desktop Web / Edge / WebView2 or Electron / React Native Windows | `npm run web` |

## Security Hardening Applied

1. **Denial of Service (DoS) Defense**:
   - `isValidCurrencyAmount` strictly validates numbers against `NaN`, `Infinity`, `<= 0`, and number overflow.
   - Input formatters in `AddTransactionModal` strip non-digit characters.
   - String length constraints (max 100 chars) prevent buffer bloat.
2. **Android Data Backup Protected**:
   - `android.allowBackup: false` enforced in `app.json`.
3. **Repository Hygiene**:
   - Comprehensive `.gitignore` excluding keystores, certificates, and `.env*` files.
4. **Authoritative Indonesian Rupiah Formatter**:
   - Centralized `formatRupiah` utility replacing manual string-buffer loops.

## Development Commands

```bash
# Start Expo development server (all platforms)
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Desktop (Windows / macOS / Web)
npm run web

# Run Unit & Security Validation Tests
npm test
```
