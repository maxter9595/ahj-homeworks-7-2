import ImageGallery from "./ImageGallery.js";

document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "http://localhost:3000";
  // const baseUrl = "https://your-render-app-url.onrender.com";
  new ImageGallery("#app", baseUrl);
});
