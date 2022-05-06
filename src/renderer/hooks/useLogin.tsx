import { useCallback, useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { items } from './sampleWallpapers.json';

export default function useLogin(): [
  ILoginData | undefined,
  (newLogin: ILoginData | undefined) => void
] {
  const [data, setData] = useState<ILoginData | undefined>(undefined);

  const setLoginData = useCallback((newLogin: ILoginData | undefined) => {
    window.electron.ipcRenderer.updateLogin(newLogin);
    setData(newLogin);
  }, []);
  useEffect(() => {
    async function startLogin() {
      const LoginData = await window.electron.ipcRenderer.getLogin();
      setLoginData(LoginData);
    }

    startLogin();
  }, [setLoginData]);

  return [data, setLoginData];
}
