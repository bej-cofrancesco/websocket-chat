class ChatSettings extends HTMLButtonElement {
  constructor() {
    super();
    this.dialog = this.createDialog();
    document.body.appendChild(this.dialog);
  }

  connectedCallback() {
    this.addEventListener('click', this.openDialog.bind(this));
  }

  createDialog() {
    const dialog = document.createElement('dialog');
    dialog.innerHTML = `
      <div class="dialog-content">
        <h2>Chat Settings</h2>
        <div class="color-grid">
          ${Object.entries(CHAT_COLORS).map(([name, hex]) => `
            <button class="color-option ${name}" data-color="${name}" style="background-color: ${hex}">
              <span class="color-name">${name}</span>
            </button>
          `).join('')}
        </div>
        <div class="dialog-buttons">
          <button class="close-dialog">Close</button>
        </div>
      </div>
    `;

    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    
    const colorGrid = dialog.querySelector('.color-grid');
    colorGrid.addEventListener('click', (e) => {
      const colorButton = e.target.closest('.color-option');
      if (!colorButton) return;
      
      const selectedColor = colorButton.dataset.color;
      this.updateUserColor(selectedColor);
      dialog.close();
    });

    return dialog;
  }

  openDialog() {
    this.dialog.showModal();
  }

  updateUserColor(newColor) {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    userData.color = newColor;
    
    localStorage.setItem('user', JSON.stringify(userData));
  }
}

customElements.define('chat-settings', ChatSettings, { extends: 'button' });
