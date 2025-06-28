export const isDarkMode = () => {return document.documentElement.getAttribute('data-color-mode') === 'dark';}

export const showCustomAlert = (message: string): Promise<void> => {
  return new Promise((resolve) => {
    const modalBgColor = isDarkMode() ? '#161b22' : '#ffffff';
    const borderColor = isDarkMode() ? '#30363d' : '#d0d7de';

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'custom-alert-overlay';
    Object.assign(modalOverlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: '1000', backdropFilter: 'blur(3px)'
    });

    const modalContent = document.createElement('div');
    Object.assign(modalContent.style, {
      backgroundColor: modalBgColor, padding: '24px', borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', textAlign: 'center',
      border: `1px solid ${borderColor}`, maxWidth: '400px'
    });

    modalContent.innerHTML = `<p style="margin: 0 0 16px 0; font-size: 16px;">${message}</p>`;

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.className = 'Button--primary Button--medium Button';
    okButton.style.width = '100px';

    okButton.onclick = () => {
      document.body.removeChild(modalOverlay);
      resolve();
    };

    modalContent.appendChild(okButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    okButton.focus();
  });
};

export const showCustomPrompt = (promptMessage: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const isDarkMode = document.documentElement.getAttribute('data-color-mode') === 'dark';
    const modalBgColor = isDarkMode ? '#161b22' : '#ffffff';
    const borderColor = isDarkMode ? '#30363d' : '#d0d7de';
    
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'custom-prompt-overlay';
    Object.assign(modalOverlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: '1000', backdropFilter: 'blur(3px)'
    });

    const modalContent = document.createElement('div');
    Object.assign(modalContent.style, {
      backgroundColor: modalBgColor, padding: '24px', borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', border: `1px solid ${borderColor}`,
      width: '448px'
    });

    const dummyUsers = [
      { name: 'John Doe', username: 'johndoe', avatar: 'https://avatars.githubusercontent.com/u/1' },
      { name: 'Jane Smith', username: 'janesmith', avatar: 'https://avatars.githubusercontent.com/u/2' },
      { name: 'AI Assistant', username: 'copilot', avatar: 'https://avatars.githubusercontent.com/u/87264559' },
    ];

    const dummyUsersHtml = dummyUsers.map(user => `
      <div style="display: flex; align-items: center; padding: 8px; border-radius: 6px; cursor: pointer;"data-username="${user.username}">
        <img src="${user.avatar}" width="40" height="40" style="border-radius: 50%; margin-right: 12px;">
        <div>
          <div style="font-weight: 600;">${user.name}</div>
          <div style="color: var(--color-fg-muted);">${user.username}</div>
        </div>
      </div>
    `).join('');

    modalContent.innerHTML = `
      <h3 style="margin: 0 0 8px 0;">New Conversation</h3>
      <p style="margin: 0 0 16px 0; color: var(--color-fg-muted);">${promptMessage}</p>
      <form id="prompt-form">
        <input type="text" id="prompt-input" placeholder="Username" style="width: 100%; margin-bottom: 16px;" class="form-control" />
        <div style="margin-bottom: 16px; border-top: 1px solid var(--color-border-muted);">
          <h4 style="margin: 16px 0 8px 0; font-weight: 400; color: var(--color-fg-muted);">Suggestions</h4>
          ${dummyUsersHtml}
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" id="prompt-cancel" class="Button--secondary Button--medium Button">Cancel</button>
          <button type="submit" class="Button--primary Button--medium Button">Start</button>
        </div>
      </form>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    const input = document.getElementById('prompt-input') as HTMLInputElement;
    input.focus();

    const close = (value: string | null) => {
      document.body.removeChild(modalOverlay);
      resolve(value);
    };

    document.getElementById('prompt-form')!.addEventListener('submit', (e) => {
      e.preventDefault();
      close(input.value.trim());
    });

    document.getElementById('prompt-cancel')!.addEventListener('click', () => close(null));
    
    modalContent.querySelectorAll<HTMLElement>('[data-username]').forEach(el => {
      el.addEventListener('click', () => {
        close(el.dataset.username!);
      });
    });
  });
};
