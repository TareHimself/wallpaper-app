import { useCallback, useEffect, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import Home from "./routes/Home";
import "./css/Main.css";
import Dashboard from "./components/Dashboard";
import WallpaperViewModal from "./components/WallpaperViewModal";
import WallpaperUploadModal from "./components/WallpaperUploadModal";
import Settings from "./components/Settings";
import TopFrame from "./components/TopFrame";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import {
  fetchWallpapers,
  setWallpapersPendingUpload,
} from "./redux/wallpapersSlice";
import { ISystemFilesResult } from "../types";
import { loadCurrentUserData } from "./redux/currentUserSlice";
import { store } from "./redux/store";

export default function App() {
  const dispatch = useAppDispatch();

  const wallpapersData = useAppSelector((state) => state.wallpapers);
  const userData = useAppSelector((state) => state.currentUser);
  const settingsState = useAppSelector((state) => state.app.settingsState);

  const [wantsToDragUpload, setWantsToDragUpload] = useState(false);

  const gotoNextPage = useCallback(() => {
    const subRoot = document.getElementById("sub-root");
    if (subRoot) subRoot.scrollTo({ top: 0, behavior: "smooth" });
    if (!wallpapersData.hasNextPage) return;
    dispatch(
      fetchWallpapers({
        page: wallpapersData.currentPage + 1,
        maxItems: wallpapersData.maxItems,
        query: wallpapersData.query,
      })
    );
  }, [
    dispatch,
    wallpapersData.currentPage,
    wallpapersData.maxItems,
    wallpapersData.query,
    wallpapersData.hasNextPage,
  ]);

  const gotoPreviousPage = useCallback(() => {
    const subRoot = document.getElementById("sub-root");
    if (subRoot) subRoot.scrollTo({ top: 0, behavior: "smooth" });
    dispatch(
      fetchWallpapers({
        page: Math.max(0, wallpapersData.currentPage - 1),
        maxItems: wallpapersData.maxItems,
        query: wallpapersData.query,
      })
    );
  }, [
    dispatch,
    wallpapersData.currentPage,
    wallpapersData.maxItems,
    wallpapersData.query,
  ]);

  useEffect(() => {
    function onDragEnter(event: DragEvent) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "all";
      }

      setWantsToDragUpload(true);
    }

    function onDrop(event: DragEvent) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.dataTransfer) {
        const paths = Array.from(event.dataTransfer.files)
          .filter(
            (file: File) =>
              file.type === "image/jpeg" || file.type === "image/png"
          )
          .map<string>((file: File) => file.path);

        if (paths.length) {
          window.bridge
            ?.loadFilesFromDisk("", paths)
            .then((result: ISystemFilesResult) => {
              dispatch(
                setWallpapersPendingUpload(
                  result.files.map(
                    ([image, index, tags]: [string, number, string]) => {
                      return {
                        id: index,
                        file: image,
                        width: 0,
                        height: 0,
                        tags,
                      };
                    }
                  )
                )
              );

              setWantsToDragUpload(false);
              const currentDragArea = document.getElementById("drag-area");
              if (currentDragArea) {
                currentDragArea.remove();
              }
            });
        } else {
          setWantsToDragUpload(false);
          const currentDragArea = document.getElementById("drag-area");
          if (currentDragArea) {
            currentDragArea.remove();
          }
        }
      }
    }

    function onDragOver(event: DragEvent) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function onDragLeave(event: DragEvent) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setWantsToDragUpload(false);
      if (event.target) {
        (event.target as HTMLElement).remove();
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function onInitialDrag(_event: DragEvent) {
      if (!userData.loginData) return;

      const root = document.getElementById("root");
      const currentDragArea = document.getElementById("drag-area");
      if (root && !currentDragArea && !document.getElementById("wp-upload")) {
        const dragArea = document.createElement("div");
        dragArea.id = "drag-area";
        dragArea.addEventListener("dragenter", onDragEnter);
        dragArea.addEventListener("drop", onDrop);
        dragArea.addEventListener("dragover", onDragOver);
        dragArea.addEventListener("dragleave", onDragLeave);
        if (!document.getElementById("drag-area")) root.appendChild(dragArea);
      }
    }

    document.addEventListener("dragenter", onInitialDrag);

    return () => {
      const dragArea = document.getElementById("drag-area");
      if (dragArea) {
        dragArea.removeEventListener("dragenter", onDragEnter);
        dragArea.removeEventListener("drop", onDrop);
        dragArea.removeEventListener("dragover", onDragOver);
        dragArea.removeEventListener("dragleave", onDragLeave);
        dragArea.remove();
        document.removeEventListener("dragenter", onDragEnter);
      } else {
        document.removeEventListener("dragenter", onDragEnter);
      }
    };
  }, [userData, dispatch]);

  useEffect(() => {
    document.body.classList.add("theme-dark");

    async function loadDataAndApplySettings() {
      await dispatch(loadCurrentUserData());
      const { settings } = store.getState().currentUser;
      const { query } = store.getState().wallpapers;
      if (settings) {
        dispatch(
          fetchWallpapers({
            page: 0,
            maxItems: settings.maxItemsPerPage,
            query,
          })
        );
      }
    }

    loadDataAndApplySettings();
  }, [dispatch]);

  if (window.bridge) {
    return (
      <>
        {window.bridge?.getPlatform() === "win32" && <TopFrame />}
        <div id="sub-root">
          <Home />
          {(wallpapersData.hasNextPage || wallpapersData.hasPreviousPage) && (
            <div className="wp-page-select">
              {wallpapersData.hasPreviousPage && (
                <button type="button" onClick={gotoPreviousPage}>
                  <BiLeftArrowAlt />
                </button>
              )}
              {wallpapersData.hasNextPage && (
                <button type="button" onClick={gotoNextPage}>
                  <BiRightArrowAlt />
                </button>
              )}
            </div>
          )}
        </div>
        <Dashboard />
        <Settings activeClass={`wp-settings-${settingsState}`} />
        {wallpapersData.currentWallpaper && (
          <WallpaperViewModal data={wallpapersData.currentWallpaper} />
        )}
        {wallpapersData.dataPendingUpload && <WallpaperUploadModal />}

        {wantsToDragUpload && (
          <div id="wp-drag-upload">
            <AiOutlineCloudUpload />
          </div>
        )}
      </>
    );
  }

  return <div />;
}
