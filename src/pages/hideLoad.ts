// this is to hide the 404 image while the messages page is loading
import { MAIN_CONTAINER } from "../constants";

const observer = new MutationObserver((mutations, obs) => {
  const el = document.querySelector(MAIN_CONTAINER);
  if (el instanceof HTMLElement) {
    el.classList.add("gh-messages-hidden");
    obs.disconnect(); // stop observing
  }
});

observer.observe(document, {
  childList: true,
  subtree: true
});

const observer2 = new MutationObserver((mutations, obs) => {
  const el = document.querySelector("title");
  if (el instanceof HTMLElement) {
    document.title = "Loading... - GitHub";
    obs.disconnect();
  }
});

observer2.observe(document, {
  childList: true,
  subtree: true
});