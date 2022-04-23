import { SyntheticEvent, useContext } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { BiSearchAlt } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';
import GlobalAppContext from 'renderer/GlobalAppContext';

export default function Dashboard() {
  const { setSearchQuery } = useContext(GlobalAppContext);

  function onSearchChange(event: SyntheticEvent<HTMLInputElement, Event>) {
    if (setSearchQuery) {
      setSearchQuery(event.currentTarget.value);
    }
  }

  let isUploading = false;

  async function uploadFiles() {
    if (isUploading) return;

    isUploading = true;
    const response = await window.electron.ipcRenderer
      .uploadFiles('')
      .catch(console.log);

    const images: string[] = [];

    if (!response?.result) {
      isUploading = false;
      return;
    }

    if (response?.files.length) {
      response?.files.forEach((file: Uint8Array) => {
        images.push(
          URL.createObjectURL(new Blob([file], { type: 'image/png' } /* (1) */))
        );
      });
    }

    console.log(images);
    isUploading = false;
  }

  return (
    <div id="dashboard">
      <AiOutlineCloudUpload
        className="dashboard-icon"
        onClick={() => {
          uploadFiles();
        }}
      />
      <div id="search">
        <BiSearchAlt />
        <input type="text" onChange={onSearchChange} />
      </div>
      <FiSettings className="dashboard-icon" />
    </div>
  );
}
