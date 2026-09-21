# Life in the UK Test

A cross-platform (iOS + Android) study app for the UK "Life in the UK" citizenship
test, built with Expo / React Native + TypeScript. First app in the
citizenship-test portfolio; the architecture is designed to be re-used per country.

## Features

- **Multi-provider sign-in / sign-up**: email/password, phone (SMS OTP), Google,
  and Apple. Backed by an `AuthGateway` abstraction:
  - `LocalAuthGateway` — on-device email/password (salted SHA-256 hash), works
    with no backend. This is the default until Firebase is configured.
  - `FirebaseAuthGateway` — email, phone, Google and Apple via Firebase. Activates
    automatically when Firebase env vars are set (see "Enabling Firebase auth").
- **Practice mode** — instant feedback; free users get the first 10 questions,
  premium unlocks the full bank.
- **Mock exam** — official 24-question / 18-to-pass format; free taster is 5
  questions, premium unlocks the full exam. Results feed progress tracking.
- **Study handbook** — summarised official material (free).
- **Premium unlock via store in-app purchase** — one-time lifetime unlock using
  Apple StoreKit / Google Play Billing (`react-native-iap`) + restore. Not
  Razorpay: store policy (Apple 3.1.1 / Play Billing) requires native IAP for
  digital unlocks, and Razorpay is India-settlement only.

## Project structure

```
src/
  core/            Pure domain logic — quiz engine, scoring, mock-exam, question bank
  services/        entitlement, progress, storage, hashing, IAP
  services/auth/   AuthGateway + Local/Firebase gateways, phone helpers, config
                   (authWiring.ts = Firebase activation glue, excluded from coverage)
  app/             Service wiring, AppContext (state), theme
  components/      QuizRunner, ResultsView
  screens/         Auth (email/phone/Google/Apple), Home, Practice, MockExam,
                   Handbook, Paywall, Settings
  navigation/      Lightweight state-based router (glue; excluded from coverage)
```

## Development

Targets Node ≥ 20 and Expo SDK 57.

```bash
npm install
npm start          # Expo dev server
npm test           # Jest unit tests + coverage (100% enforced)
npm run typecheck  # tsc --noEmit
```

Native modules (IAP, Firebase phone/Google/Apple) require a **development build**
(`npx expo run:ios` / `npx expo run:android` or EAS) — they do not run in Expo Go.
Email/password, practice, exam, and handbook run in Expo Go and on web.

## Enabling Firebase auth

1. Create a Firebase project → add a Web app → copy the config.
2. `cp .env.example .env.local` and fill in `EXPO_PUBLIC_FIREBASE_*`.
3. In Firebase console → Authentication, enable Email/Password, Phone, Google,
   and Apple providers.
4. Google sign-in: create OAuth client IDs (Google Cloud console) and set the
   `EXPO_PUBLIC_GOOGLE_*` vars. Apple sign-in: enable the capability (handled by
   the `expo-apple-authentication` plugin) and configure Apple as a Firebase
   provider.
5. Phone OTP is most reliable on native via a dev build; the JS SDK path needs a
   reCAPTCHA verifier — see `src/services/auth/authWiring.ts`.

When the Firebase env vars are present, `createServices()` automatically uses the
Firebase gateway; otherwise it stays on the local email/password gateway.

## Testing & coverage

- **148 unit tests, 100% coverage** (statements / branches / functions / lines),
  enforced via Jest `coverageThreshold`.
- Excluded from coverage: type-only files (`types.ts`, `gateway.ts`),
  `src/navigation/**`, `src/testkit.tsx`, and `src/services/auth/authWiring.ts`
  (thin native/SDK glue, activated only with real credentials).
- Business logic is dependency-injected and tested against in-memory / fake
  implementations — no native modules run in tests.

## Remaining before store launch

See the "Next steps" checklist shared separately — in short: expand the question
bank (~500), create Firebase + Google/Apple credentials, build a dev build to
verify IAP + social/phone auth on device, configure store IAP products, add
store listing assets + privacy policy, and submit via EAS.
