import { useCallback, useEffect, useState } from 'react';

export default function useSettings(): [
  IApplicationSettings | undefined,
  (settings: IApplicationSettings) => void
] {
  const [data, setData] = useState<IApplicationSettings | undefined>(undefined);

  const updateSettings = useCallback((settings: IApplicationSettings) => {
    window.electron.ipcRenderer.saveSettings(settings);
    setData(settings);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line promise/valid-params
    window.electron.ipcRenderer
      .loadSettings()
      // eslint-disable-next-line promise/always-return
      .then((settings) => {
        setData(settings);
      })
      .catch();
  }, []);

  return [data, updateSettings];
}
