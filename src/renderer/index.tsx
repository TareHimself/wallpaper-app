import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import NotificationContainer from './components/NotificationContainer';

const container = document.getElementById('root');
// eslint-disable-next-line promise/catch-or-return
window.electron.ipcRenderer
  ?.loadThumnailCache()
  .then((result: [string, string][]) => {
    result.forEach(([key, value]) => {
      window.electron.ipcRenderer?.thumbnailCache.set(key, value);
    });

    // eslint-disable-next-line promise/always-return
    if (container) {
      const root = createRoot(container);
      root.render(
        <StrictMode>
          <App />
          <NotificationContainer />
        </StrictMode>
      );
    }
  });
