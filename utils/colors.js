const CHAT_COLORS = {
  blue: '#4299ff',
  coral: '#ff7f50',
  dodgerblue: '#1e90ff',
  springgreen: '#00ff7f',
  yellowgreen: '#9acd32',
  green: '#00ff00',
  orangered: '#ff4500',
  red: '#ff0000',
  goldenrod: '#daa520',
  hotpink: '#ff69b4',
  cadetblue: '#5f9ea0',
  seagreen: '#2e8b57',
  purple: '#a330c9'
};

const getRandomColor = () => {
  const colors = Object.keys(CHAT_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
};

const getColorHex = (colorName) => {
  return CHAT_COLORS[colorName] || CHAT_COLORS.blue; // Default to blue if color not found
}; 