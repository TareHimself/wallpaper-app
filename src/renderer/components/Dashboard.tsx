import { SyntheticEvent, useCallback, useContext, useRef } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { BiSearchAlt } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';
import GlobalAppContext from 'renderer/GlobalAppContext';

export default function Dashboard() {
  const { setQuery, setUploadedFiles, loginData, setShowSettings } =
    useContext(GlobalAppContext);

  function onSearchChange(event: SyntheticEvent<HTMLInputElement, Event>) {
    if (setQuery) {
      setQuery(event.currentTarget.value);
    }
  }

  const isUploading = useRef(false);

  const uploadFiles = useCallback(async () => {
    if (!loginData) {
      if (setShowSettings) {
        setShowSettings(true);
      }
      return;
    }
    if (isUploading.current) return;

    isUploading.current = true;
    const response = await window.electron.ipcRenderer
      .uploadFiles('')
      .catch(console.log);

    const images: IConvertedSystemFiles[] = [];

    if (!response?.result) {
      isUploading.current = false;
      return;
    }

    if (response?.files.length) {
      response?.files.forEach(([buffer, index]: [Uint8Array, number]) => {
        images.push({
          id: index,
          uri: URL.createObjectURL(
            new Blob([buffer], { type: 'image/png' } /* (1) */)
          ),
          file: buffer,
          width: 0,
          height: 0,
          tags: '',
        });
      });
    }

    isUploading.current = false;
    if (setUploadedFiles) {
      setUploadedFiles(images);
    }
  }, [loginData, setShowSettings, setUploadedFiles]);

  return (
    <div id="dashboard">
      <AiOutlineCloudUpload className="dashboard-icon" onClick={uploadFiles} />
      <div id="search">
        <BiSearchAlt />
        <input type="text" onChange={onSearchChange} />
      </div>
      <FiSettings
        className="dashboard-icon"
        onClick={() => {
          if (setShowSettings) {
            setShowSettings(true);
          }
        }}
      />
    </div>
  );
}
