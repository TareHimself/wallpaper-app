import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { addNotification, getDatabaseUrl } from '../utils';

export default function useLogin(): [
  ILoginData | undefined,
  (newLogin: ILoginData | undefined) => void
] {
  const hasVerifiedWithApi = useRef(false);

  const [data, setData] = useState<ILoginData | undefined>(undefined);

  const setLoginData = useCallback((newLogin: ILoginData | undefined) => {
    window.electron.ipcRenderer?.updateLogin(newLogin);
    hasVerifiedWithApi.current = false;
    setData(newLogin);
  }, []);

  async function verifyLogin(
    UserAccountData: IUserAccountData
  ): Promise<boolean> {
    const getUserResponse = await axios
      .get(`${await getDatabaseUrl()}/users/?u=${UserAccountData.id}`)
      .catch((e) => addNotification(e.message));

    if (getUserResponse?.data?.error) {
      return false;
    }

    return true;
  }
  useEffect(() => {
    async function startLogin() {
      const LoginData = await window.electron.ipcRenderer?.getLogin();

      if (LoginData && (await verifyLogin(LoginData.userAccountData))) {
        hasVerifiedWithApi.current = true;
        setData(LoginData);
        return;
      }

      setLoginData(undefined);
    }

    if (!hasVerifiedWithApi.current) {
      startLogin();
    }
  }, [setLoginData]);

  return [data, setLoginData];
}
