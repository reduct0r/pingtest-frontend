import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/styles.css';
import { Provider } from 'react-redux';
import { store } from './store';
import { registerSW } from 'virtual:pwa-register';
import { AppInfoProvider } from './context/AppInfoContext';

if ('serviceWorker' in navigator) {
  registerSW();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppInfoProvider>
        <App />
      </AppInfoProvider>
    </Provider>
  </React.StrictMode>,
);