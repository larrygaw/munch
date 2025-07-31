// Mock React
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createContext: jest.fn(),
  useContext: jest.fn(),
  useState: jest.fn(),
  useEffect: jest.fn(),
  createElement: jest.fn(),
}));

// Mock React Native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  Image: 'Image',
  TextInput: 'TextInput',
  SafeAreaView: 'SafeAreaView',
  Alert: {
    alert: jest.fn(),
  },
  StyleSheet: {
    create: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Firebase Config
jest.mock('./FirebaseConfig', () => ({
  auth: {},
  db: {},
}));

// Mock Expo modules
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

// Mock Firebase
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  increment: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock Expo ImagePicker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
  ImagePickerResult: {
    canceled: false,
    assets: [{ uri: 'test-image.jpg' }],
  },
}));

// Mock Expo Linking
jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
}));

// Global mocks
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 