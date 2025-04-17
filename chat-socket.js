const socket = new WebSocket("ws://localhost:3333");

window.ChatSocket = socket;
socket.onopen = (event) => console.log("WebSocket is connected!");
socket.onmessage = (msg) => {
  console.log(msg);
  const messageEvent = JSON.parse(msg.data);

  const { user, message, type } = messageEvent.data;

  if (!type) return;

  const event = new CustomEvent(type, { detail: { user, message } });

  window.dispatchEvent(event);
};
socket.onerror = (error) => console.log("websocket error", error);
socket.onclose = (event) => console.log(event);
