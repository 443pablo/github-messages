import { isDarkMode } from "../../utils";
import { deleteMessage } from "../../api/messages";
import { showCustomConfirm as confirm } from "../../utils";

let currentMessageElement: HTMLElement | null = null;
let currentMessages: any[] = [];

export function renderContextMenu(messagesList, messages = []) {
  currentMessages = messages;
  if (!messagesList) return;

  const oldMenu = document.getElementById("custom-context-menu");
  if (oldMenu) oldMenu.remove(); // remove existing context menu if any

  // ctx menu hidden by default
  const menu = document.createElement("div");
  menu.id = "custom-context-menu";
  const dark = isDarkMode();
  if (dark) {
    menu.classList.add("dark");
  }
  menu.innerHTML = `
    <div class="context-menu-item" id="context-copy">Copy</div>
    <div class="context-menu-item delete" id="context-delete">Delete</div>
  `;
  document.body.appendChild(menu);

  document.addEventListener("click", () => {
    menu.style.display = "none";
  });

  // attach ctx event to each message
  messagesList.querySelectorAll(".message-item").forEach((el) => {
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      currentMessageElement = el as HTMLElement;
      menu.style.display = "block";
      menu.style.left = `${e.pageX}px`;
      menu.style.top = `${e.pageY}px`;
    });
  });

  // this is convoluted bc typescript
  const copyBtn = document.getElementById("context-copy");
  if (copyBtn) {
    copyBtn.onclick = async (e) => {
      e.stopPropagation();
      menu.style.display = "none";
      
      if (currentMessageElement) {
        // Get the message content from the element
        const contentSpan = currentMessageElement.querySelector('span:nth-child(2)');
        if (contentSpan) {
          try {
            await navigator.clipboard.writeText(contentSpan.textContent || '');
            console.log('Message copied to clipboard');
          } catch (err) {
            console.error('Failed to copy message:', err);
          }
        }
      }
    };
  }
  
  const deleteBtn = document.getElementById("context-delete");
  if (deleteBtn) {
    deleteBtn.onclick = async (e) => {
      e.stopPropagation();
      menu.style.display = "none";
      
      if (currentMessageElement && currentMessages.length > 0) {
        const messageIdx = parseInt(currentMessageElement.getAttribute('data-message-idx') || '-1');
        if (messageIdx >= 0 && messageIdx < currentMessages.length) {
          const message = currentMessages[messageIdx];
          
          if (await confirm('Are you sure you want to delete this message?')) {
            try {
              await deleteMessage(message.id);
              // Remove the message element from the DOM
              currentMessageElement.remove();
              console.log('Message deleted successfully');
            } catch (err) {
              console.error('Failed to delete message:', err);
              alert('Failed to delete message. Please try again.');
            }
          }
        }
      }
    };
  }
}
