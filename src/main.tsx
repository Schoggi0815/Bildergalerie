import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBKQnoZnw1fbg7hA1fKAQSQLIfsOIMGbcU',
  authDomain: 'bildergalerie-86050.firebaseapp.com',
  projectId: 'bildergalerie-86050',
  storageBucket: 'bildergalerie-86050.appspot.com',
  messagingSenderId: '826899743817',
  appId: '1:826899743817:web:eb38dd953668e65eafab98',
  measurementId: 'G-RPFT5SB4TZ'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App/>
);
