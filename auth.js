class Auth {
  constructor() {
    this.user = this.getUser();
  }

  createDialog() {
    const dialog = document.createElement('dialog');
    dialog.innerHTML = `
      <div class="dialog-content">
        <h2>Welcome to Chat</h2>
        <form method="dialog" class="auth-form">
          <div class="input-group">
            <label>Choose your username</label>
            <input 
              type="text" 
              name="username" 
              autocomplete="off" 
              autofocus 
              required
              minlength="3"
              maxlength="25"
              pattern="[A-Za-z0-9_]+"
            >
          </div>
          <button type="submit">Join Chat</button>
        </form>
      </div>
    `;

    const form = dialog.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const userName = dialog.querySelector('input[name="username"]').value.trim();
      if (userName) {
        const userData = {
          userName,
          color: getRandomColor(),
        };
        localStorage.setItem("user", JSON.stringify(userData));
        this.user = userData;
        dialog.close();
      }
    });

    return dialog;
  }

  getUser() {
    const user = localStorage.getItem("user");

    if (user) {
      return JSON.parse(user);
    }

    const dialog = this.createDialog();
    document.body.appendChild(dialog);
    dialog.showModal();
  }
}

customElements.define("chat-auth", Auth);

new Auth();
