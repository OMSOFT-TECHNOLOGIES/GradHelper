import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import PasswordResetPage from './components/PasswordResetPage';
import ActivateAccountPage from './components/ActivateAccountPage';
import './styles/globals.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "410686673581-66eglbm0ce7eut7mqnfnl8mqdbdadjkh.apps.googleusercontent.com"}>
      <BrowserRouter>
        <Routes>
          <Route path="/password-reset" element={<PasswordResetPage />} />
          <Route path="/activate" element={<ActivateAccountPage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();