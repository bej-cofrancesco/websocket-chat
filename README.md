# 💬 WebSocket Chat Application

This project is a **real-time chat application** built **from scratch using native WebSockets** (no Socket.IO or third-party abstractions). It provides a fast, dynamic chat experience similar to popular streaming platforms, complete with a styled frontend and a fully custom WebSocket server.

---

## ⚡ Features

- 🔧 **Custom WebSocket Server** (no libraries, raw protocol handling)
- 🗨️ **Real-Time Messaging** between multiple users
- 🪄 **Smooth frontend built with HTML/CSS/JS**
- 🧍‍♂️ **Fake Auth**

---

## 🛠 Tech Stack

- **Backend**: Node.js + native WebSocket implementation
- **Frontend**: HTML, CSS, JavaScript
- **Protocol**: RFC 6455 WebSocket (no Socket.IO, no external libs)

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/bej-cofrancesco/websocket-chat.git
cd websocket-chat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Server

```bash
npm run dev
```

This will start both:

- A WebSocket server on port 3333
- A static file server on port 3000

### 4. Open in Browser

Visit:  
http://localhost:3000

Open in multiple tabs or devices to test real-time chat.

---

## 🧠 How It Works

- The system provides authentication for users connecting to the chat.
- Messages sent via WebSocket are broadcast to all connected clients.
- The frontend updates the chat window in real-time as new messages come in.
- Users can customize their chat experience through settings.

---

## 📁 File Structure

```
📦 websocket-chat
├── index.html          # Main HTML file with chat UI
├── style.css           # CSS for chat look & feel
├── server.js           # Custom WebSocket server
├── chat-messages.js    # Message handling functionality
├── chat-input.js       # Input handling for chat
├── chat-socket.js      # WebSocket client logic
├── chat-settings.js    # Chat settings and configuration
├── auth.js             # Authentication functionality
├── utils/              # Utility functions and helpers
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

---

## 💡 Potential Add-ons

- ✅ User authentication
- ✅ Message handling
- ⏳ Emojis or GIF support
- ⏳ Rate limiting or spam filters
- ⏳ Channel support (multiple chat rooms)

---

## 📜 License

MIT — feel free to use and modify as needed.

---

Made with 💜 by Benjamin
