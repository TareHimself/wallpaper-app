import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  IApplicationSettings,
  ICurrentUserState,
  ILoginData,
  ServerResponse,
} from "../../types";
import toast from "react-hot-toast";
import { ensureBridge, getServerUrl } from "../utils";
import axios from "axios";

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
    await ensureBridge();

    result.settings = await window.bridge.loadSettings();

    const loginData = await window.bridge.getLogin();
    console.log("Exiting login data", loginData);
    if (loginData) {
      const sessionStatusResponse = await axios.get<
        ServerResponse<ILoginData["account"]>
      >(`${await getServerUrl()}/${loginData?.session}/info`);

      if (!sessionStatusResponse.data.error) {
        loginData["account"] = sessionStatusResponse.data.data;
        result.loginData = loginData;
        console.log("Logging out, session has expired");
      } else {
        await window.bridge.updateLogin(undefined);
        toast.error("Session has expired");
      }
    }

    return result;
  } catch (e: unknown) {
    if (e instanceof Error) {
      toast.error(e.message);
    }
    return result;
  }
});

const loginUser = createAsyncThunk("currentUser/login", async () => {
  try {
    const loginData = await window.bridge?.startLogin();
    if (loginData) {
      return loginData;
    }
    return null;
  } catch (e: unknown) {
    if (e instanceof Error) {
      toast.error(e.message);
    }
    return null;
  }
});

const logoutUser = createAsyncThunk(
  "currentUser/logout",
  async ({ session }: { session: string }) => {
    try {
      await axios.post(`${await getServerUrl()}/${session}/logout`);
      await window.bridge?.logout();
      return null;
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
      return null;
    }
  }
);

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
