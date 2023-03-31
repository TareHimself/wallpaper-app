/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { app } from "electron";

export function isDev() {
  return !app.isPackaged;
}

export function getWsUrl() {
  return isDev()
    ? "ws://localhost:3001"
    : "wss://wallpaperz-server.oyintare.dev";
}
export function getServerUrl() {
  return isDev()
    ? "http://localhost:3001"
    : "https://wallpaperz-server.oyintare.dev";
}

export function getDatabaseUrl() {
  return "https://wallpaperz-database.oyintare.dev";
  return isDev()
    ? "http://localhost:3002"
    : "https://wallpaperz-database.oyintare.dev";
}
