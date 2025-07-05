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
    okButton.style.display = 'inline';

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

export const showCustomPrompt = (promptMessage: string, options?: { html?: string }): Promise<string | null> => {
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

    const additionalContent = options?.html ? options.html : '';

    modalContent.innerHTML = `
      <h3 style="margin: 0 0 8px 0;">New Conversation</h3>
      <p style="margin: 0 0 16px 0; color: var(--color-fg-muted);">${promptMessage}</p>
      <form id="prompt-form">
        <input autocomplete="off" type="text" id="prompt-input" placeholder="Username" style="width: 100%; margin-bottom: 16px;" class="form-control" />
        ${additionalContent}
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" id="prompt-cancel" class="Button--secondary Button--medium Button" style="display:inline;">Cancel</button>
          <button type="submit" class="Button--primary Button--medium Button" style="display:inline;">Start</button>
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

export const showCustomConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const modalBgColor = isDarkMode() ? '#161b22' : '#ffffff';
    const borderColor = isDarkMode() ? '#30363d' : '#d0d7de';

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'custom-confirm-overlay';
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

    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.style.display = 'flex';
    buttonsWrapper.style.justifyContent = 'center';
    buttonsWrapper.style.gap = '16px';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'Button--secondary Button--medium Button';
    cancelButton.style.width = '100px';

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.className = 'Button--primary Button--medium Button';
    okButton.style.width = '100px';

    cancelButton.onclick = () => {
      document.body.removeChild(modalOverlay);
      resolve(false);
    };
    okButton.onclick = () => {
      document.body.removeChild(modalOverlay);
      resolve(true);
    };

    buttonsWrapper.appendChild(cancelButton);
    buttonsWrapper.appendChild(okButton);
    modalContent.appendChild(buttonsWrapper);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    okButton.focus();
  });
};