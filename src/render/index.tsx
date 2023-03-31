import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./redux/store";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <Provider store={store}>
      <Toaster
        position="top-center"
        reverseOrder={true}
        // containerStyle={{
        //   top: 100,
        // }}
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <App />
    </Provider>
  );
}
