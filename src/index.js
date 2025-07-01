import { messagesPage } from "./pages/messages";
import { addProfileButtons, addNavButton } from "./components/ProfileButtons";
import { Extension } from "./extension";

(async () => {
  const extension = new Extension();
  await extension.init();
  
  addProfileButtons();
  addNavButton();
  await messagesPage();
})();
