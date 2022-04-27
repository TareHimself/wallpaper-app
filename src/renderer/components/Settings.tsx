import { useCallback, useContext, useState } from 'react';
import { AiOutlineCaretLeft } from 'react-icons/ai';
import GlobalAppContext from 'renderer/GlobalAppContext';

export default function Settings({
  activeClass = 'wallpaper-settings-closed',
  setShowSettings,
}: {
  activeClass: string;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { settings, setDiscordAuthData } = useContext(GlobalAppContext);

  const [userData, setUserData] = useState<IUserAccountData | undefined>(
    undefined
  );

  const startLogin = useCallback(() => {
    window.electron.ipcRenderer
      .openLogin()
      .then((loginResponse: ILoginResponse) => {
        // eslint-disable-next-line promise/always-return
        if (setDiscordAuthData) {
          setDiscordAuthData(loginResponse.discordAuthData);
        }
      })
      .catch(console.log);
  }, [setDiscordAuthData]);

  return (
    <div className={activeClass}>
      <div className="wallpaper-settings-container">
        <div className="wallpaper-settings-container-inner">
          <div className="wallpaper-settings-login">
            {userData !== undefined && (
              <img
                src="https://cdn.discordapp.com/avatars/604699803468824676/1e585dbca2b02583f13c3283a7e4d0a6.webp?size=1024"
                alt="profile"
              />
            )}
            {userData === undefined ? (
              <button type="button" onClick={startLogin}>
                <h2>Login With Discord</h2>
              </button>
            ) : (
              <button type="button">
                <h2>Logout</h2>
              </button>
            )}
          </div>
          <div className="wallpaper-settings-item">
            <h3>Fullscreen ?</h3>
            <div className="wallpaper-settings-item-content" />
          </div>
          <div className="wallpaper-settings-item">
            <h3>Max Items Per Page</h3>
            <div className="wallpaper-settings-item-content" />
          </div>
          <div className="wallpaper-settings-item">
            <h3>Default Download Path</h3>
            <div className="wallpaper-settings-item-content" />
          </div>
        </div>
        <div className="wallpaper-settings-back">
          <AiOutlineCaretLeft
            onClick={() => {
              setShowSettings(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
