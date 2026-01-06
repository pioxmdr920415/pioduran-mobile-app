import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('PWA is ready to work offline!');
  },
  onUpdate: (registration) => {
    console.log('New PWA version available!');
    // This will trigger the update notification component
  }
});
