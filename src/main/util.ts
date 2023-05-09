/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
// import { app } from "electron";

export function isDev() {
  return true; //!app.isPackaged;
}

export function getServerUrl() {
  return isDev()
    ? "http://localhost:3001"
    : "https://wallpaperz-server.oyintare.dev";
}

export function getDatabaseUrl() {
  return isDev()
    ? "http://localhost:3002"
    : "https://wallpaperz-database.oyintare.dev";
}

export function getCdnUrl() {
  return isDev()
    ? "https://wallpaperz.nyc3.cdn.digitaloceanspaces.com/wallpapers-debug"
    : "https://wallpaperz.nyc3.cdn.digitaloceanspaces.com/wallpapers";
}
