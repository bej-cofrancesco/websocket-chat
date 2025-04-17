class ChatInput extends HTMLFormElement {
  constructor() {
    super();
    this.form = this;
    this.input = this.querySelector("input");

    this.socket = window.ChatSocket;
  }

  connectedCallback() {
    this.addEventListener("submit", this.handleSubmit.bind(this));
  }

  handleSubmit(e) {
    e.preventDefault();

    const value = this.input.value;
    const user = window.localStorage.getItem("user");

    if (!user) {
      throw new Error("You have not been autheticated. Please login");
    }

    if (!value) {
      throw new Error("You cannot send an empty message");
    }

    this.input.value = "";

    const data = {
      user,
      message: value,
      type: "chatMessage",
    };

    const payload = JSON.stringify(data);
    this.socket.send(payload);
  }
}

customElements.define("chat-input", ChatInput, { extends: "form" });
