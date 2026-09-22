const firebaseConfig = {
  apiKey: "AIzaSyBVobfnYM2RCwQ2cQTuA1ZvNHKgtqMwssk",
  authDomain: "pyramid-prism-prep.firebaseapp.com",
  projectId: "pyramid-prism-prep",
  storageBucket: "pyramid-prism-prep.firebasestorage.app",
  messagingSenderId: "87163774963",
  appId: "1:87163774963:web:1c477c9d7fe631d9679486",
  measurementId: "G-HH9CCQ4DQ8"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
