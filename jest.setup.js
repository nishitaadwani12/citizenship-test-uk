/* eslint-disable no-undef */
// Use the library-provided in-memory mock for AsyncStorage so modules that
// import it can load in the Node test environment.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Provide a lightweight expo-crypto stand-in so modules that import it load in
// the Node test environment. Tests that assert crypto behaviour mock it locally.
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_algo, data) => `digest(${data})`),
  randomUUID: jest.fn(() => 'test-uuid'),
}));

// Silence the react-native-iap native module in the test environment.
// Individual tests inject their own fake IAP backend, so the real native
// bridge is never exercised here.
jest.mock('react-native-iap', () => ({
  initConnection: jest.fn(),
  endConnection: jest.fn(),
  getProducts: jest.fn(),
  getSubscriptions: jest.fn(),
  requestPurchase: jest.fn(),
  requestSubscription: jest.fn(),
  getAvailablePurchases: jest.fn(),
  finishTransaction: jest.fn(),
  purchaseUpdatedListener: jest.fn(() => ({ remove: jest.fn() })),
  purchaseErrorListener: jest.fn(() => ({ remove: jest.fn() })),
}));
