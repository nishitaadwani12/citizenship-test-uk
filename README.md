# Life in the UK Test

A cross-platform (iOS + Android) study app for the UK "Life in the UK" citizenship
test, built with Expo / React Native + TypeScript. First app in the
citizenship-test portfolio; the architecture is designed to be re-used per country.

## Features

- **Email/password auth** (sign up, log in, log out) — on-device, no backend
  required. The password is stored only as a salted SHA-256 hash. Swappable for a
  remote provider (e.g. Firebase) behind the same `AuthService` surface.
- **Practice mode** — immediate right/wrong feedback; free users get the first
  10 questions, premium unlocks the full bank.
- **Mock exam** — official 24-question / 18-to-pass format; free users get a
  5-question taster, premium unlocks the full exam. Results feed cumulative
  progress tracking.
- **Study handbook** — summarised official material (free).
- **Premium unlock via store in-app purchase** — a one-time lifetime unlock
  using **Apple StoreKit / Google Play Billing** (via `react-native-iap`), plus
  restore-purchase. See "Payments" below.

## Payments — why not Razorpay

Apple (App Store Review Guideline 3.1.1) and Google Play Billing **require** the
platform's own in-app purchase system for unlocking digital content. Razorpay (or
any third-party processor) for premium unlocks would be rejected from both stores,
and Razorpay only settles for India-based merchants/buyers. The premium unlock is
therefore implemented with `react-native-iap` (StoreKit + Play Billing). Product
id: `uk_lifetime_unlock`, configured in App Store Connect / Play Console.

## Project structure

```
src/
  core/        Pure domain logic — quiz engine, scoring, mock-exam generation, question bank
  services/    Auth, entitlement, progress, storage, hashing, IAP (all dependency-injected)
  app/         Service wiring, AppContext (state), theme
  components/  QuizRunner, ResultsView
  screens/     Auth, Home, Practice, MockExam, Handbook, Paywall, Settings
  navigation/  Lightweight state-based router (glue; excluded from coverage)
```

## Development

This project targets Node ≥ 20 and Expo SDK 57.

```bash
npm install
npm start          # Expo dev server
npm test           # Jest unit tests + coverage
npm run typecheck  # tsc --noEmit
```

In-app purchases use native modules, so IAP flows require a development build
(`npx expo run:ios` / `npx expo run:android` or an EAS dev build) — they do not
work in Expo Go. Everything else runs in Expo Go.

## Testing & coverage

- **116 unit tests, 100% coverage** (statements / branches / functions / lines)
  enforced via Jest `coverageThreshold`.
- Coverage is collected across all of `src/` except:
  - `types.ts` (type-only, no runtime code)
  - `src/navigation/**` (declarative router glue)
  - `src/testkit.tsx` (test helpers)
- Services are dependency-injected, so business logic is tested against an
  in-memory store and fake IAP backend — no native modules run in tests.
