// this is to hide the 404 image while the page is loading
import { MAIN_CONTAINER } from "./constants";

document.title = "Loading... - GitHub";
const observer = new MutationObserver((mutations, obs) => {
  const el = document.querySelector(MAIN_CONTAINER);
  if (el instanceof HTMLElement) {
    el.style.opacity = "0";
    obs.disconnect(); // stop observing
  }
});

observer.observe(document, {
  childList: true,
  subtree: true
});