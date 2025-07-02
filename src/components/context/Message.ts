import { isDarkMode } from "../../utils";
import css from "./context-menu.css";
export function renderContextMenu(messagesList) {
  if (!messagesList) return;

  const oldMenu = document.getElementById("custom-context-menu");
  if (oldMenu) oldMenu.remove(); // remove existing context menu if any

  // ctx menu hidden by default
  const menu = document.createElement("div");
  menu.id = "custom-context-menu";
  menu.style.position = "absolute";
  menu.style.display = "none";
  const dark = isDarkMode();
  menu.style.background = dark ? "#23272e" : "#fff";
  menu.style.border = dark ? "1px solid #444" : "1px solid #ccc";
  menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  menu.style.zIndex = "1000";
  menu.innerHTML = `
  <style>
    ${css}
    </style>
    <div class="context-menu-item" id="context-copy">Copy</div>
    <div class="context-menu-item delete" id="context-delete">Delete</div>
  `;
  document.body.appendChild(menu);

  // Hide menu on click elsewhere
  document.addEventListener("click", () => {
    menu.style.display = "none";
  });

  // attach ctx event to each message
  messagesList.querySelectorAll(".message-item").forEach((el) => {
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      menu.style.display = "block";
      menu.style.left = `${e.pageX}px`;
      menu.style.top = `${e.pageY}px`;
    });
  });

  // this is convoluted bc typescript
  const copyBtn = document.getElementById("context-copy");
  if (copyBtn) {
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      menu.style.display = "none";
    };
  }
  const deleteBtn = document.getElementById("context-delete");
  if (deleteBtn) {
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      menu.style.display = "none";
    };
  }
}
