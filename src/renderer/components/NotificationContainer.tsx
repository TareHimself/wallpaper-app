import { useEffect } from 'react';
import { addNotification } from 'renderer/utils';

export default function Notifications() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function onNotificationRecieved(_e: Event) {
      /* const actualEvent = e as CustomEvent;
      const notificationData = actualEvent.detail as INotificationInfo; */
    }

    document.addEventListener('notification', onNotificationRecieved);

    const noti = {
      title: 'hi',
      content: 'Read thissssssssssssss',
      displayTime: 200,
    };

    addNotification(noti);
    return () => {
      document.removeEventListener('notification', onNotificationRecieved);
    };
  }, []);
  return <div />;
}
