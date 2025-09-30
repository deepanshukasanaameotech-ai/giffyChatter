// src/utils/playSound.js
export const playSound = (url) => {
  const audio = new Audio(url);
  audio.play().catch((err) => console.log("Sound play error:", err));
};
