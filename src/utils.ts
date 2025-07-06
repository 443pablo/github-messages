export const isDarkMode = () => {return document.documentElement.getAttribute('data-color-mode') === 'dark';}

interface ModalButton {
  text: string;
  className?: string;
  style?: string;
  onClick: () => void;
  primary?: boolean;
}

interface ModalConfig {
  title?: string;
  text?: string;
  html?: string;
  buttons?: ModalButton[];
}

class Modal {
  private overlay: HTMLElement;
  protected content: HTMLElement;

  constructor() {
    this.overlay = this.createOverlay();
    this.content = this.createContent();
    this.overlay.appendChild(this.content);
  }

  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: '1000', backdropFilter: 'blur(3px)'
    });
    return overlay;
  }

  private createContent(): HTMLElement {
    const modalBgColor = isDarkMode() ? '#161b22' : '#ffffff';
    const borderColor = isDarkMode() ? '#30363d' : '#d0d7de';
    
    const content = document.createElement('div');
    Object.assign(content.style, {
      backgroundColor: modalBgColor, padding: '24px', borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', 
      border: `1px solid ${borderColor}`
    });
    return content;
  }

  protected setContent(config: ModalConfig): void {
    let html = '';
    
    if (config.title) {
      html += `<h3 style="margin: 0 0 8px 0;">${config.title}</h3>`;
    }
    
    if (config.text) {
      html += `<p style="margin: 0 0 16px 0; ${config.title ? 'color: var(--color-fg-muted);' : 'font-size: 16px;'}">${config.text}</p>`;
    }
    
    if (config.html) {
      html += config.html;
    }

    this.content.innerHTML = html;
  }

  protected addButtons(buttons: ModalButton[]): void {
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.style.display = 'flex';
    buttonsWrapper.style.justifyContent = buttons.length === 1 ? 'center' : 'flex-end';
    buttonsWrapper.style.gap = '8px';

    buttons.forEach(buttonConfig => {
      const button = document.createElement('button');
      button.textContent = buttonConfig.text;
      button.className = `Button--${buttonConfig.primary ? 'primary' : 'secondary'} Button--medium Button`;
      
      if (buttonConfig.style) {
        button.style.cssText = buttonConfig.style;
      }
      
      button.onclick = buttonConfig.onClick;
      buttonsWrapper.appendChild(button);
    });

    this.content.appendChild(buttonsWrapper);
  }

  protected display(): void {
    document.body.appendChild(this.overlay);
  }

  protected close(): void {
    if (this.overlay.parentNode) {
      document.body.removeChild(this.overlay);
    }
  }

  protected focusFirstButton(): void {
    const button = this.content.querySelector('button') as HTMLButtonElement;
    if (button) button.focus();
  }
}

class AlertModal extends Modal {
  show(input: string | ModalConfig): Promise<void> {
    return new Promise((resolve) => {
      const config = typeof input === 'string' ? { text: input } : input;
      
      this.setContent(config);
      
      const buttons: ModalButton[] = [{
        text: 'OK',
        primary: true,
        style: 'width: 100px; display: inline;',
        onClick: () => {
          this.close();
          resolve();
        }
      }];

      this.addButtons(buttons);
      super.display();
      this.focusFirstButton();
    });
  }
}

class PromptModal extends Modal {
  show(params: string | { title?: string, html?: string, text:string }): Promise<string | null> {
    return new Promise((resolve) => {
      Object.assign(this.content.style, { width: '448px' });
      
      const config: ModalConfig = {
        title: typeof params === 'object' ? params.title : undefined,
        text: typeof params === 'string' ? params : params.text,
        html: `
          <form id="prompt-form">
            <input autocomplete="off" type="text" id="prompt-input" placeholder="Username" style="width: 100%; margin-bottom: 16px;" class="form-control" />
            ${typeof params === 'object' && params?.html ? params.html : ''}
          </form>
        `
      };

      this.setContent(config);

      const buttons: ModalButton[] = [
        {
          text: 'Cancel',
          onClick: () => close(null)
        },
        {
          text: 'Start',
          primary: true,
          onClick: () => {
            const input = document.getElementById('prompt-input') as HTMLInputElement;
            close(input.value.trim());
          }
        }
      ];

      this.addButtons(buttons);

      const close = (value: string | null) => {
        this.close();
        resolve(value);
      };

      super.display();

      const input = document.getElementById('prompt-input') as HTMLInputElement;
      input.focus();

      document.getElementById('prompt-form')!.addEventListener('submit', (e) => {
        e.preventDefault();
        close(input.value.trim());
      });

      this.content.querySelectorAll<HTMLElement>('[data-username]').forEach(el => {
        el.addEventListener('click', () => {
          close(el.dataset.username!);
        });
      });
    });
  }
}

class ConfirmModal extends Modal {
  show(input: string | ModalConfig): Promise<boolean> {
    return new Promise((resolve) => {
      const config = typeof input === 'string' ? { text: input } : input;
      
      Object.assign(this.content.style, { textAlign: 'center', maxWidth: '400px' });
      this.setContent(config);

      const buttons: ModalButton[] = [
        {
          text: 'Cancel',
          style: 'width: 100px; display: inline;',
          onClick: () => {
            this.close();
            resolve(false);
          }
        },
        {
          text: 'OK',
          primary: true,
          style: 'width: 100px; display: inline;',
          onClick: () => {
            this.close();
            resolve(true);
          }
        }
      ];

      this.addButtons(buttons);
      super.display();
      this.focusFirstButton();
    });
  }
}

export const showCustomAlert = (message: string | ModalConfig): Promise<void> => {
  return new AlertModal().show(message);
};

export const showCustomPrompt = (promptMessage: string | ModalConfig): Promise<string | null> => {
  if (typeof promptMessage === 'string') {
    return new PromptModal().show(promptMessage);
  } else {
    // Ensure text is always a string
    const { title, html, text } = promptMessage;
    return new PromptModal().show({
      title,
      html,
      text: text ?? ''
    });
  }
};

export const showCustomConfirm = (message: string | ModalConfig): Promise<boolean> => {
  return new ConfirmModal().show(message);
};