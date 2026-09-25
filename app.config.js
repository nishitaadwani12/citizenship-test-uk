// Extends the static app.json with runtime config read from environment
// variables. Firebase web keys are public (client-side) but are still kept in
// env / .env.local so they aren't hard-coded. When they're absent, the app
// falls back to on-device email/password auth (see firebaseConfig.ts).
//
// Ads: the react-native-google-mobile-ads plugin needs an AdMob App ID per
// platform. These default to Google's TEST App IDs so the app builds and shows
// test ads out of the box; set the EXPO_PUBLIC_ADMOB_* vars for production.
const TEST_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

// Firebase web config for the shared "citizenship-apps" project. These are
// client-side keys (not secret) so they're safe to commit; access is controlled
// by Firebase Security Rules and authorized domains. Env vars still override.
const FIREBASE = {
  apiKey: 'AIzaSyA8snXsvR-xV_NO3mKFdj1gMmOhV8XVbE8',
  authDomain: 'citizenship-apps-270d1.firebaseapp.com',
  projectId: 'citizenship-apps-270d1',
  appId: '1:756598450767:web:886fe64780cb45dc3d583a',
  messagingSenderId: '756598450767',
  storageBucket: 'citizenship-apps-270d1.firebasestorage.app',
};

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ?? TEST_ANDROID_APP_ID,
        iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ?? TEST_IOS_APP_ID,
      },
    ],
    [
      'expo-tracking-transparency',
      {
        userTrackingPermission:
          'This identifier will be used to deliver personalized ads to you.',
      },
    ],
  ],
  extra: {
    ...config.extra,
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? FIREBASE.apiKey,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? FIREBASE.authDomain,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? FIREBASE.projectId,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? FIREBASE.appId,
      messagingSenderId:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? FIREBASE.messagingSenderId,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? FIREBASE.storageBucket,
    },
    googleClientIds: {
      ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    },
    // Ad-unit IDs; when unset the app uses Google's test ad units.
    admob: {
      banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID,
      interstitial: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID,
    },
  },
});
