import { createServer } from "http";
import crypto from "crypto";

const PORT = 3333;
const WEBSOCKET_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const SEVEN_BITS_INT_MARKER = 125;
const SIXTEEN_BITS_INT_MARKER = 126;
const FIRST_BIT = 128;
const MASKED_KEY = 4;
const OPCODE_TEXT = 0x01;
const MAXIMUM_SIXTEEN_BITS_INTEGER = 2 ** 16;

const clients = new Set();

const server = createServer((req, res) => {
  res.writeHead(200);
  res.end("yo");
}).listen(PORT, () => console.log("listening on", PORT));

const handleSocketUpgrade = (req, socket, head) => {
  const { "sec-websocket-key": webClientSocketKey } = req.headers;

  if (!webClientSocketKey) {
    socket.destroy();
    return;
  }

  const headers = handleSocketHandshake(webClientSocketKey);

  socket.write(headers);
  socket.on("readable", () => {
    try {
      onSocketOnReadable(socket);
    } catch (error) {
      console.error("Socket read error:", error);
    }
  });

  clients.add(socket);

  socket.on("close", () => {
    clients.delete(socket);
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
    clients.delete(socket);
    socket.destroy();
  });
};

const unmask = (encoded, maskedKey) => {
  if (!encoded || !maskedKey) {
    return Buffer.from("");
  }

  const finalBuffer = Buffer.from(encoded);

  for (let i = 0; i < encoded.length; i++) {
    finalBuffer[i] = encoded[i] ^ maskedKey[i % 4];
  }

  return finalBuffer;
};

const sendMessage = (msg, socket) => {
  const data = prepareMessage(msg);
  socket.write(data);
};

const prepareMessage = (message) => {
  const msg = Buffer.from(message);

  const messageSize = msg.length;

  let dataFrameBuffer;

  const firstByte = 0x80 | OPCODE_TEXT;

  const offset = 2;

  if (messageSize <= SEVEN_BITS_INT_MARKER) {
    const bytes = [firstByte];
    dataFrameBuffer = Buffer.from(bytes.concat(messageSize));
  } else if (messageSize <= MAXIMUM_SIXTEEN_BITS_INTEGER) {
    const offsetFourBytes = 4;
    const target = Buffer.allocUnsafe(offsetFourBytes);

    target[0] = firstByte;
    target[1] = SIXTEEN_BITS_INT_MARKER || 0x0;

    target.writeUint16BE(messageSize, offset);

    dataFrameBuffer = target;
  } else {
    throw new Error(
      "Long messages are great but we aren't paying for your love letters buddy"
    );
  }

  const totalLength = dataFrameBuffer.byteLength + messageSize;
  const dataFrameResponse = concat([dataFrameBuffer, msg], totalLength);
  return dataFrameResponse;
};

const concat = (bufferList, totalLength) => {
  const target = Buffer.allocUnsafe(totalLength);

  let offset = 0;

  for (const buffer of bufferList) {
    target.set(buffer, offset);
    offset += buffer.length;
  }

  return target;
};

const onSocketOnReadable = (socket) => {
  const firstByte = socket.read(1);
  if (!firstByte) {
    return;
  }

  const opcode = firstByte[0] & 0x0f;

  if (opcode !== OPCODE_TEXT) {
    console.log(`Received non-text frame with opcode: ${opcode}, skipping`);

    const secondByte = socket.read(1);
    if (!secondByte) return;

    const length = secondByte[0] & 0x7f;
    if (length <= 0) return;

    socket.read(MASKED_KEY + length);
    return;
  }

  const secondByte = socket.read(1);
  if (!secondByte) {
    return;
  }

  const [markerAndPayloadLength] = secondByte;

  if ((markerAndPayloadLength & FIRST_BIT) !== FIRST_BIT) {
    console.error("Invalid WebSocket frame - first bit not set");
    return;
  }

  const lengthIndicatorInBits = markerAndPayloadLength - FIRST_BIT;

  let messageLength = 0;

  if (lengthIndicatorInBits <= SEVEN_BITS_INT_MARKER) {
    messageLength = lengthIndicatorInBits;
  } else if (lengthIndicatorInBits === SIXTEEN_BITS_INT_MARKER) {
    const lengthBytes = socket.read(2);
    if (!lengthBytes || lengthBytes.length < 2) {
      return;
    }
    messageLength = lengthBytes.readUint16BE(0);
  } else {
    console.error("Message too long or invalid length indicator");
    return;
  }

  if (messageLength <= 0 || messageLength > MAXIMUM_SIXTEEN_BITS_INTEGER) {
    console.error("Invalid message length:", messageLength);
    return;
  }

  const maskedKey = socket.read(MASKED_KEY);
  if (!maskedKey || maskedKey.length < MASKED_KEY) {
    return;
  }

  const encoded = socket.read(messageLength);
  if (!encoded || encoded.length < messageLength) {
    return;
  }

  const decoded = unmask(encoded, maskedKey);
  const received = decoded.toString("utf8");

  if (
    !received ||
    received.trim() === "" ||
    (!(received.trim().startsWith("{") && received.trim().endsWith("}")) &&
      !(received.trim().startsWith("[") && received.trim().endsWith("]")))
  ) {
    console.error(
      "Received data is not valid JSON format:",
      received.length > 30 ? received.substring(0, 30) + "..." : received
    );
    return;
  }

  let data;
  try {
    data = JSON.parse(received);
  } catch (error) {
    console.error(
      "Invalid JSON received:",
      error.message,
      "Data:",
      received.length > 100 ? received.substring(0, 100) + "..." : received
    );
    return;
  }

  if (!data) {
    console.error("Received null or undefined data");
    return;
  }

  const msg = JSON.stringify({
    data,
    at: new Date().toISOString(),
  });

  sendMessage(msg, socket);
  broadcast(msg, socket);
};

const broadcast = (msg, sender) => {
  const data = prepareMessage(msg);
  for (const client of clients) {
    if (client !== sender && client.writable) {
      try {
        client.write(data);
      } catch (error) {
        console.error("Error broadcasting to client:", error);

        clients.delete(client);
      }
    }
  }
};

const handleSocketHandshake = (id) => {
  const acceptKey = generateSocketAccept(id);
  const headers = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
    "",
  ]
    .map((line) => line.concat("\r\n"))
    .join("");

  return headers;
};

const generateSocketAccept = (id) => {
  const sha1 = crypto.createHash("sha1");
  sha1.update(id + WEBSOCKET_KEY);
  return sha1.digest("base64");
};

server.on("upgrade", handleSocketUpgrade);
const errors = ["uncaughtException", "unhandledRejection"];

for (const error of errors) {
  process.on(error, (err) => {
    console.error(err);
  });
}
