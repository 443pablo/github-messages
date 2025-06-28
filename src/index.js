import { messagesPage } from "./messages-page";
import { addProfileButtons, addNavButton } from "./components/ProfileButtons";

(async () => {
  addProfileButtons();
  addNavButton();
  await messagesPage();
})();
