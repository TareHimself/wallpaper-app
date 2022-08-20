import { AiOutlineCaretLeft } from 'react-icons/ai';
import { setSettingsState } from 'renderer/redux/appStateSlice';
import {
  loginUser,
  logoutUser,
  setFullscreen,
  setMaxItemsperPage,
} from 'renderer/redux/currentUserSlice';
import { useAppDispatch, useAppSelector } from 'renderer/redux/hooks';
import { setMaxItems, setPage } from 'renderer/redux/wallpapersSlice';
import BooleanSetting from './SettingsHelpers/BooleanSetting';
import RangeSetting from './SettingsHelpers/RangeSetting';

export default function Settings({
  activeClass = 'wp-settings-neutral',
}: {
  activeClass: string;
}) {
  const dispatch = useAppDispatch();

  const userData = useAppSelector((s) => s.currentUser);

  return (
    <div className={activeClass}>
      <div className="wp-settings-container">
        <div className="wp-settings-container-inner">
          <div className="wp-settings-login">
            {userData.loginData && (
              <>
                <img
                  src={userData.loginData.userAccountData.avatar}
                  alt="profile"
                />
                <h2>{userData.loginData.userAccountData.nickname}</h2>
              </>
            )}
            {userData.loginData ? (
              <button
                type="button"
                onClick={() => {
                  dispatch(loginUser());
                }}
              >
                <h2>Login With Discord</h2>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  dispatch(logoutUser());
                }}
              >
                <h2>Logout</h2>
              </button>
            )}
          </div>
          <div className="wp-settings-item">
            <h3>Fullscreen ?</h3>
            <div className="wp-settings-item-content">
              <BooleanSetting
                value={userData.settings?.bShouldUseFullscreen || false}
                onValueUpdated={(value) => {
                  dispatch(setFullscreen(value));
                }}
              />
            </div>
          </div>
          <div className="wp-settings-item">
            <h3>Max Items Per Page</h3>
            <div className="wp-settings-item-content">
              <RangeSetting
                value={userData.settings?.maxItemsPerPage || 12}
                onValueUpdated={(value) => {
                  dispatch(setPage(0));
                  dispatch(setMaxItemsperPage(value));
                  dispatch(setMaxItems(value));
                }}
                min={6}
                max={24}
              />
            </div>
          </div>
          {false && (
            <div className="wp-settings-item">
              <h3>Default Download Path</h3>
              <div className="wp-settings-item-content" />
            </div>
          )}
        </div>
        <div className="wp-settings-back">
          <AiOutlineCaretLeft
            onClick={() => {
              dispatch(setSettingsState('closed'));
            }}
          />
        </div>
      </div>
    </div>
  );
}
