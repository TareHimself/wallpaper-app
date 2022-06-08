import { useCallback, useContext, useRef } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { BiSearchAlt } from 'react-icons/bi';
import { FiSettings, FiFilter } from 'react-icons/fi';
import { ImExit } from 'react-icons/im';
import { addNotification } from 'renderer/utils';
import GlobalAppContext from '../GlobalAppContext';

const typingThrottle = 500;

export default function Dashboard() {
  const { setSearchQuery, setUploadedFiles, loginData, setSettingsState } =
    useContext(GlobalAppContext);

  const updateTyping = useRef<number | undefined>(undefined);

  function updateSearchText() {
    updateTyping.current = undefined;
    if (setSearchQuery) {
      setSearchQuery(
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
      /* if (setSettingsState) {
        setSettingsState('open');
      } */
      addNotification('You Must Be Logged In To Upload');
      return;
    }
    if (isUploading.current) return;

    isUploading.current = true;
    const response = await window.electron.ipcRenderer.uploadFiles('', []);

    const images: IConvertedSystemFiles[] = [];

    if (!response?.result) {
      isUploading.current = false;
      return;
    }

    if (response?.files.length) {
      response?.files.forEach(
        ([image, index, tags]: [string, number, string]) => {
          images.push({
            id: index,
            file: image,
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
  }, [loginData, setUploadedFiles]);

  return (
    <div id="dashboard">
      <FiFilter
        className="dashboard-icon"
        onClick={() => {
          addNotification('Filters coming soon!');
        }}
      />
      <AiOutlineCloudUpload className="dashboard-icon" onClick={uploadFiles} />
      <div id="search">
        <BiSearchAlt />
        <input
          type="text"
          onChange={onSearchChange}
          id="search-input"
          draggable="false"
        />
      </div>
      <FiSettings
        className="dashboard-icon"
        onClick={() => {
          if (setSettingsState) {
            setSettingsState('open');
          }
        }}
      />
      <ImExit
        className="dashboard-icon"
        onClick={() => {
          window.electron.ipcRenderer.quitApp();
        }}
      />
    </div>
  );
}
