import { useEffect } from 'react';
import { addNotification } from '../utils';

export default function Notifications() {
  useEffect(() => {
    function onNotificationRecieved(e: Event) {
      const actualEvent = e as CustomEvent;
    }

    document.addEventListener('notification', onNotificationRecieved);

    const noti = {
      title: 'hi',
      content: 'Read this',
      displayTime: 200,
    };

    addNotification(noti);
    return () => {
      document.removeEventListener('notification', onNotificationRecieved);
    };
  });
  return <div />;
}
