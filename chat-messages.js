class ChatMessages extends HTMLUListElement {
  constructor() {
    super();
    this.emotes = {};
    this.fetchEmotes();
  }

  async fetchEmotes() {
    try {
      const response = await fetch("https://7tv.io/v3/emote-sets/global");
      const data = await response.json();

      console.log(data);

      const emotes = {};

      if (data?.emotes) {
        data.emotes.forEach((emote) => {
          if (!emote?.data?.host) return;

          const urls = [];
          const files = emote.data.host.files;

          files.forEach((file) => {
            if (file.format === "WEBP") {
              const size = file.name.split(".")[0]; // e.g., "1x", "2x", etc.
              urls.push({
                size,
                url: `https:${emote.data.host.url}/${file.name}`,
              });
            }
          });

          urls.sort((a, b) => parseInt(a.size) - parseInt(b.size));

          if (urls.length > 0) {
            const chatUrl = urls.find((u) => u.size === "1x") || urls[0];
            emotes[emote.name] =
              `<img class="emote${emote.data.animated ? " animated" : ""}" 
              src="${chatUrl.url}" 
              alt="${emote.name}"
              ${emote.data.flags?.zeroWidth ? 'style="margin: 0; width: 0;"' : ""}
            />`;
          }
        });
      }

      console.log("Loaded emotes:", Object.keys(emotes).length);
      this.emotes = emotes;
    } catch (error) {
      console.error("Failed to fetch emotes:", error);
      this.emotes = {
        OMEGALUL:
          '<img class="emote" src="https://cdn.7tv.app/emote/60ae7216483a7a718f2eea91/1x.webp" alt="OMEGALUL" />',
        Pog: '<img class="emote" src="https://cdn.7tv.app/emote/60ae36af259ac5a73e56a424/1x.webp" alt="Pog" />',
        PagMan:
          '<img class="emote" src="https://cdn.7tv.app/emote/60ae858b229664e8667aea25/1x.webp" alt="PagMan" />',
      };
    }
  }

  connectedCallback() {
    window.addEventListener("chatMessage", this.handleMessage.bind(this));
  }

  starMessage(length) {
    let string = "";
    const star = "*";
    for (let i = 0; i < length; i++) {
      string += star;
    }

    return string;
  }

  messageSanitise(msg) {
    return msg.replace(/[&<>"']/g, function (match) {
      const escape = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return escape[match];
    });
  }

  updateMessage(msg) {
    const naughtyWords = {
      fuck: this.starMessage(4),
      shit: this.starMessage(4),
      bitch: this.starMessage(5),
    };

    let updated = msg;

    for (const [word, replacer] of Object.entries(naughtyWords)) {
      if (!updated.includes(word)) {
        continue;
      }
      updated = updated.replaceAll(word, replacer);
    }

    updated = this.messageSanitise(updated);

    const words = updated.split(/\b/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (this.emotes[word]) {
        words[i] = this.emotes[word];
      }
    }
    updated = words.join("");

    return updated;
  }

  handleMessage(e) {
    const { user, message } = e.detail;

    const { userName, color } = JSON.parse(user);

    const msg = this.updateMessage(message);

    const messageEl = `<li class="message">
      <span class="username color-${color}">
        ${userName}:
      </span>
      <span class="message-text"> ${msg}</span>
      </li>`;

    this.insertAdjacentHTML("beforeend", messageEl);
    this.scrollTo(0, this.scrollHeight);
  }
}

customElements.define("chat-messages", ChatMessages, { extends: "ul" });
