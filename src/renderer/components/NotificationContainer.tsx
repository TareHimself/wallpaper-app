import { useEffect, useRef, useState } from 'react';
import { addNotification } from 'renderer/utils';

const NOTIFICATION_TIMEOUT_TIME = 2750;

function NotificationItem({
  data,
  reduceNotifications,
}: {
  data: INotificationInfo;
  reduceNotifications: () => void;
}) {
  function removeNotification() {
    const elementToRemove = document.getElementById(data.id.toString());
    if (elementToRemove) {
      elementToRemove.className = 'wallpaper-notification-item-closed';
      setTimeout(reduceNotifications, 500);
    }
  }

  useEffect(() => {
    setTimeout(removeNotification, NOTIFICATION_TIMEOUT_TIME);
  });

  return (
    <div id={`${data.id}`} className="wallpaper-notification-item">
      <h2>{data.content}</h2>
    </div>
  );
}

export default function NotificationContainer() {
  const [currentNotifications, setCurrentNotifications] = useState<
    INotificationInfo[]
  >([]);

  const currentHiddenNotifications = useRef(0);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function onNotificationRecieved(e: Event) {
      const actualEvent = e as CustomEvent;
      const notificationData = actualEvent.detail as INotificationInfo;
      setCurrentNotifications([...currentNotifications, notificationData]);
    }

    document.addEventListener('notification', onNotificationRecieved);

    return () => {
      document.removeEventListener('notification', onNotificationRecieved);
    };
  }, [currentNotifications]);

  const sortedNotifications = currentNotifications
    .map((item) => (
      <NotificationItem
        data={item}
        key={item.id}
        reduceNotifications={() => {
          currentHiddenNotifications.current += 1;
          if (
            currentNotifications.length === currentHiddenNotifications.current
          ) {
            setCurrentNotifications([]);
          }
        }}
      />
    ))
    .sort((a, b) => {
      return b.props.data.id - a.props.data.id;
    });

  return (
    <div id="wallpaper-notification-panel">
      <div className="wallpaper-notification-panel-inner">
        {sortedNotifications}
      </div>
    </div>
  );
}
