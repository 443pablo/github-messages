import { showCustomConfirm as confirm } from "./utils";

export const errorHandler = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const errorDescription = urlParams.get("error_description");

  if (error && errorDescription) {
    // decode err
    const decodedDescription = decodeURIComponent(errorDescription);
    const confirmed = confirm({title: "Error: " + error, text: decodedDescription});

    // beautify url
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("error");
    cleanUrl.searchParams.delete("error_description");
    cleanUrl.hash = "";
    window.history.replaceState({}, document.title, cleanUrl.toString());
  }
};
