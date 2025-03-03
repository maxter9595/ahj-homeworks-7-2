import ImageGallery from "./ImageGallery.js";

document.addEventListener("DOMContentLoaded", () => {
  // const baseUrl = "http://localhost:3000";
  const baseUrl = "https://ahj-homeworks-7-2.onrender.com";
  new ImageGallery("#app", baseUrl);
});
