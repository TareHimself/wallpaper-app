import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { addNotification } from "../utils";
import {
  IApplicationSettings,
  ICurrentUserState,
  ILoginData,
} from "../../types";

// Define a type for the slice state

// Define the initial state using that type
const initialState: ICurrentUserState = {
  loginData: null,
  settings: null,
};

const loadCurrentUserData = createAsyncThunk("currentUser/load", async () => {
  const result: { loginData?: ILoginData; settings?: IApplicationSettings } =
    {};
  try {
    if (window.bridge) {
      const loginData = await window.bridge.getLogin();
      if (loginData) {
        result.loginData = loginData;
      }

      result.settings = await window.bridge.loadSettings();
    }
    return result;
  } catch (e: unknown) {
    if (e instanceof Error) {
      addNotification(e.message);
    }
    return result;
  }
});

const loginUser = createAsyncThunk("currentUser/login", async () => {
  try {
    const loginData = await window.bridge?.openLogin();
    if (loginData) {
      return loginData;
    }
    return null;
  } catch (e: unknown) {
    if (e instanceof Error) {
      addNotification(e.message);
    }
    return null;
  }
});

const logoutUser = createAsyncThunk("currentUser/logout", async () => {
  try {
    await window.bridge?.logout();
    return null;
  } catch (e: unknown) {
    if (e instanceof Error) {
      addNotification(e.message);
    }
    return null;
  }
});

export const currentUserSlice = createSlice({
  name: "currentUser",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setFullscreen: (state, action: PayloadAction<boolean>) => {
      if (state.settings) {
        state.settings.bShouldUseFullscreen = action.payload;

        window.bridge?.saveSettings({ ...state.settings });
      }
    },
    setMaxItemsperPage: (state, action: PayloadAction<number>) => {
      if (state.settings) {
        state.settings.maxItemsPerPage = action.payload;

        window.bridge?.saveSettings({ ...state.settings });
      }
    },
    setDownloadPath: (state, action: PayloadAction<string>) => {
      if (state.settings) {
        state.settings.downloadPath = action.payload;

        window.bridge?.saveSettings({ ...state.settings });
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loginData = action.payload;
      if (state.settings) {
        state.settings.bIsLoggedIn = action.payload !== null;
      }
    });
    builder.addCase(logoutUser.fulfilled, (state, action) => {
      state.loginData = null;
      if (state.settings) {
        state.settings.bIsLoggedIn = action.payload !== null;
      }
    });
    builder.addCase(loadCurrentUserData.fulfilled, (state, action) => {
      if (action.payload.settings) {
        state.settings = action.payload.settings;
      }

      if (action.payload.loginData) {
        state.loginData = action.payload.loginData;
      }
    });
  },
});

export const { setFullscreen, setMaxItemsperPage, setDownloadPath } =
  currentUserSlice.actions;
export { loginUser, logoutUser, loadCurrentUserData };

export default currentUserSlice.reducer;
