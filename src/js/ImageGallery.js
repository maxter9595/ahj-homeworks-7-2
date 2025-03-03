import JSZip from "jszip";
import { saveAs } from "file-saver";

export default class ImageGallery {
  constructor(container, baseUrl) {
    this.baseUrl = baseUrl;
    this.container = document.querySelector(container);
    this.dragDropArea = this.container.querySelector(".drag-drop-area");
    this.fileInput = this.container.querySelector("#file-input");
    this.gallery = this.container.querySelector(".gallery");
    this.downloadButton = this.container.querySelector(".download-button");
    this.init();
  }

  init() {
    this.dragDropArea.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", (e) =>
      this.handleFiles(e.target.files),
    );
    this.dragDropArea.addEventListener("dragover", (e) =>
      this.handleDragOver(e),
    );
    this.dragDropArea.addEventListener("drop", (e) => this.handleDrop(e));
    this.downloadButton.addEventListener("click", () => this.downloadImages());
    this.fetchImages();
  }

  handleDragOver(e) {
    e.preventDefault();
    this.dragDropArea.classList.add("dragover");
  }

  handleDrop(e) {
    e.preventDefault();
    this.dragDropArea.classList.remove("dragover");
    const files = e.dataTransfer.files;
    this.handleFiles(files);
  }

  handleFiles(files) {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const formData = new FormData();
        formData.append("file", file);
        fetch(`${this.baseUrl}/upload`, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("File uploaded:", data);
            this.addImage(data.filename, `${this.baseUrl}/${data.filename}`);
          })
          .catch((error) => {
            console.error("Error uploading file:", error);
          });
      }
    });
    this.fileInput.value = "";
  }

  addImage(name, url) {
    const imageBlock = document.createElement("div");
    imageBlock.classList.add("image-block");
    const img = document.createElement("img");
    img.src = url;
    img.alt = name;
    const closeButton = document.createElement("span");
    closeButton.classList.add("close-button");
    closeButton.innerHTML = "&times;";
    closeButton.addEventListener("click", () =>
      this.removeImage(name, imageBlock),
    );
    imageBlock.appendChild(img);
    imageBlock.appendChild(closeButton);
    this.gallery.appendChild(imageBlock);
  }

  removeImage(name, imageBlock) {
    fetch(`${this.baseUrl}/delete?filename=${name}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => imageBlock.remove())
      .catch((error) => {
        console.error("Error deleting file:", error);
      });
  }

  fetchImages() {
    fetch(`${this.baseUrl}/images`)
      .then((response) => response.json())
      .then((files) => {
        files.forEach((file) => this.addImage(file, `${this.baseUrl}/${file}`));
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });
  }

  downloadImages() {
    const zip = new JSZip();
    const images = this.gallery.querySelectorAll(".image-block img");
    let loadedImages = 0;
    images.forEach((img) => {
      const url = img.src;
      const name = img.alt || "image";
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          const extension = url.split(".").pop();
          const fileName = `${name}.${extension}`;
          zip.file(fileName, blob);
          loadedImages++;
          if (loadedImages === images.length) {
            zip.generateAsync({ type: "blob" }).then((content) => {
              saveAs(content, "gallery.zip");
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching image:", error);
        });
    });
  }
}
