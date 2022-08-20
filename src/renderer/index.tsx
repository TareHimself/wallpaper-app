import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import NotificationContainer from './components/NotificationContainer';
import { store } from './redux/store';

const container = document.getElementById('root')!;
// eslint-disable-next-line promise/catch-or-return
const root = createRoot(container);
root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <NotificationContainer />
    </Provider>
  </StrictMode>
);
