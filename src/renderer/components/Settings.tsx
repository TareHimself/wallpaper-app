import { useCallback, useContext, useEffect } from 'react';
import { AiOutlineCaretLeft } from 'react-icons/ai';
import GlobalAppContext from '../GlobalAppContext';
import BooleanSetting from './SettingsHelpers/BooleanSetting';

export default function Settings({
  activeClass = 'wallpaper-settings-closed',
}: {
  activeClass: string;
}) {
  const { loginData, setLoginData, setShowSettings, settings, setSettings } =
    useContext(GlobalAppContext);

  const startLogin = useCallback(() => {
    window.electron.ipcRenderer
      .openLogin()
      .then((loginResponse: ILoginData) => {
        // eslint-disable-next-line promise/always-return
        if (setLoginData) {
          setLoginData(loginResponse);
        }
      })
      .catch(alert);
  }, [setLoginData]);

  const logout = useCallback(() => {
    window.electron.ipcRenderer
      .logout()
      .then(() => {
        // eslint-disable-next-line promise/always-return
        if (setLoginData) {
          setLoginData(undefined);
        }
      })
      .catch(alert);
  }, [setLoginData]);

  const onUpdateFullscreen = useCallback(
    (newValue: boolean) => {
      if (setSettings && settings) {
        setSettings({ ...settings, bShouldUseFullscreen: newValue });
      }
    },
    [setSettings, settings]
  );

  return (
    <div className={activeClass}>
      <div className="wallpaper-settings-container">
        <div className="wallpaper-settings-container-inner">
          <div className="wallpaper-settings-login">
            {loginData !== undefined && (
              <>
                <img src={loginData.userAccountData.avatar} alt="profile" />
                <h2>{loginData.userAccountData.nickname}</h2>
              </>
            )}
            {loginData === undefined ? (
              <button type="button" onClick={startLogin}>
                <h2>Login With Discord</h2>
              </button>
            ) : (
              <button type="button" onClick={logout}>
                <h2>Logout</h2>
              </button>
            )}
          </div>
          <div className="wallpaper-settings-item">
            <h3>Fullscreen ?</h3>
            <div className="wallpaper-settings-item-content">
              <BooleanSetting
                value={settings?.bShouldUseFullscreen || false}
                onValueUpdated={onUpdateFullscreen}
              />
            </div>
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
              if (setShowSettings) {
                setShowSettings(false);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
