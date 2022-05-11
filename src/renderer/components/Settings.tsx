import { useCallback, useContext } from 'react';
import { AiOutlineCaretLeft } from 'react-icons/ai';
import GlobalAppContext from '../GlobalAppContext';
import BooleanSetting from './SettingsHelpers/BooleanSetting';

export default function Settings({
  activeClass = 'wp-settings-neutral',
}: {
  activeClass: string;
}) {
  const {
    loginData,
    setLoginData,
    setSettingsState,
    settings,
    setSettings,
    refreshWallpapers,
  } = useContext(GlobalAppContext);

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
      <div className="wp-settings-container">
        <div className="wp-settings-container-inner">
          <div className="wp-settings-login">
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
          <div className="wp-settings-item">
            <h3>Fullscreen ?</h3>
            <div className="wp-settings-item-content">
              <BooleanSetting
                value={settings?.bShouldUseFullscreen || false}
                onValueUpdated={onUpdateFullscreen}
              />
            </div>
          </div>
          <div className="wp-settings-item">
            <h3>Max Items Per Page</h3>
            <div className="wp-settings-item-content" />
          </div>
          {false && (
            <div className="wp-settings-item">
              <h3>Default Download Path</h3>
              <div className="wp-settings-item-content" />
            </div>
          )}
          <div className="wp-settings-item">
            <h3>Clear Thumbnail Cache</h3>
            <div className="wp-settings-item-content">
              <button
                type="button"
                className="setting-button"
                onClick={() => {
                  window.electron.ipcRenderer.clearThumbnailCache();
                  if (refreshWallpapers) {
                    refreshWallpapers();
                  }
                }}
              >
                <h3>Clear</h3>
              </button>
            </div>
          </div>
        </div>
        <div className="wp-settings-back">
          <AiOutlineCaretLeft
            onClick={() => {
              if (setSettingsState) {
                setSettingsState('closed');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
