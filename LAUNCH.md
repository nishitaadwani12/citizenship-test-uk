# Launch checklist — Life in the UK Test

External setup to take this app from code-complete to live on the App Store and
Play Store. Tick items as you go. Run Expo/EAS commands with the Node 20 prefix,
e.g. `mise exec node@20.19.5 -- eas build ...` (global Node is 18).

Key identifiers for this app:
- **Bundle / package ID:** `com.citizenshipapps.lifeintheuk`
- **Subscription product IDs:** `uk_premium_weekly` (weekly), `uk_premium_quarterly` (3-monthly)
- **Price currency for the home market:** GBP

> Prices are per-storefront. A ₹ price only reaches the India storefront — set
> the GBP tier for this app's main market (and any other storefronts you enable).

---

## Phase 0 — One-time accounts (shared across all apps; skip if already done)
- [ ] Apple Developer Program enrolled ($99/yr); Agreements, Tax & Banking complete (W-8BEN).
- [ ] Google Play Console registered ($25); identity + payments profile complete.
- [ ] Firebase project created (can host all apps).
- [ ] AdMob account created and linked to payments.
- [ ] `eas-cli` installed and `eas login` done.
- [ ] Support email chosen + a place to host privacy policies.

## Phase 1 — Firebase (auth)
- [ ] Firebase Console → Add app → Web → copy the config.
- [ ] Authentication → Sign-in method → enable Email/Password, Phone, Google, Apple.
- [ ] Google Cloud → Credentials → create OAuth client IDs (iOS, Android, Web).
- [ ] Apple: enable "Sign in with Apple"; configure Apple provider in Firebase.

## Phase 2 — AdMob (ads)
- [ ] Create this app in AdMob for Android and for iOS (note each App ID `ca-app-pub-…~…`).
- [ ] Create a Banner and an Interstitial ad unit (note the unit IDs `ca-app-pub-…/…`).
- [ ] AdMob → Privacy & messaging → create a GDPR (EEA) consent message.

## Phase 3 — Local config
- [ ] `cp .env.example .env.local` and fill in:
  - [ ] `EXPO_PUBLIC_FIREBASE_*` (6 keys)
  - [ ] `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` / `_ANDROID_CLIENT_ID` / `_WEB_CLIENT_ID`
  - [ ] `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` / `_IOS_APP_ID`
  - [ ] `EXPO_PUBLIC_ADMOB_BANNER_ID` / `_INTERSTITIAL_ID`
- [ ] Edit `src/content/legal.ts`: set `COMPANY`, `CONTACT_EMAIL`, `EFFECTIVE_DATE`.
- [ ] Host `PRIVACY.md` publicly and keep the URL for the store listings.
- [ ] Verify the question bank against the current official source (do not ship wrong answers).

## Phase 4 — Register the app in the stores
- [ ] App Store Connect → new app with bundle ID `com.citizenshipapps.lifeintheuk`.
- [ ] Play Console → create app with package `com.citizenshipapps.lifeintheuk`.

## Phase 5 — Subscription products (both stores)
- [ ] Create auto-renewing subscription `uk_premium_weekly` (weekly), priced in GBP (+ other storefronts).
- [ ] Create auto-renewing subscription `uk_premium_quarterly` (3-monthly).
- [ ] Add subscription metadata + a localization.
- [ ] Add a sandbox tester (Apple) / license tester (Play).

## Phase 6 — Build & test on a device
- [ ] `eas build --profile development`
- [ ] Test a real Google / Apple / phone login.
- [ ] Test a sandbox subscription purchase + restore.
- [ ] Confirm test ads show for free users and disappear after subscribing.

## Phase 7 — Listing & submit
- [ ] Icon, screenshots, description, keywords.
- [ ] Privacy Policy URL added; data-safety (Play) / app-privacy (Apple) forms completed
      (declare: email, phone number, advertising identifiers).
- [ ] Delete-account path described in the listing (required by both stores).
- [ ] `eas build --profile production`
- [ ] `eas submit` (App Store and Play).
- [ ] Respond to review feedback if any (weekly-sub apps get extra scrutiny).

---

## Notes for this app
- **Server-side receipt validation** (or RevenueCat) is recommended before scaling —
  entitlements are currently on-device.
- Two revenue streams are wired: subscriptions (premium, ad-free) and AdMob ads (free tier).
