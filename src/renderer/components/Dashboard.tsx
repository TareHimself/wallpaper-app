import { useCallback, useContext, useRef } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { BiSearchAlt } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';
import GlobalAppContext from '../GlobalAppContext';

const typingThrottle = 500;

export default function Dashboard() {
  const { setQuery, setUploadedFiles, loginData, setShowSettings } =
    useContext(GlobalAppContext);

  const updateTyping = useRef<number | undefined>(undefined);

  function updateSearchText() {
    updateTyping.current = undefined;
    if (setQuery) {
      setQuery(
        (document.getElementById('search-input') as HTMLInputElement).value
      );
    }
  }
  function onSearchChange() {
    if (updateTyping.current !== undefined) {
      clearTimeout(updateTyping.current);
      updateTyping.current = window.setTimeout(
        updateSearchText,
        typingThrottle
      );
    } else {
      updateTyping.current = window.setTimeout(
        updateSearchText,
        typingThrottle
      );
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
    const response = await window.electron.ipcRenderer.uploadFiles('');

    const images: IConvertedSystemFiles[] = [];

    if (!response?.result) {
      isUploading.current = false;
      return;
    }

    if (response?.files.length) {
      response?.files.forEach(
        ([buffer, index, tags]: [Uint8Array, number, string]) => {
          images.push({
            id: index,
            uri: URL.createObjectURL(
              new Blob([buffer], { type: 'image/png' } /* (1) */)
            ),
            file: buffer,
            width: 0,
            height: 0,
            tags,
          });
        }
      );
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
        <input type="text" onChange={onSearchChange} id="search-input" />
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
