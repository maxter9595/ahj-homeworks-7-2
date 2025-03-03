const fs = require("fs");
const path = require("path");
const Koa = require("koa");
const { koaBody } = require("koa-body");
const koaStatic = require("koa-static");
const uuid = require("uuid");
const mime = require("mime");

const app = new Koa();

const PUBLIC_DIR = path.join(__dirname, "public");
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR);
}

app.use(
  koaStatic(PUBLIC_DIR, {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  }),
);

app.use(async (ctx, next) => {
  if (ctx.path.startsWith("/public/")) {
    const filePath = path.join(PUBLIC_DIR, ctx.path.replace("/public/", ""));
    if (fs.existsSync(filePath)) {
      const mimeType = mime.getType(filePath);
      ctx.type = mimeType || "application/octet-stream";
    }
  }
  await next();
});

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  ctx.set("Access-Control-Allow-Headers", "Content-Type");
  if (ctx.method === "OPTIONS") {
    ctx.status = 204;
    return;
  }
  await next();
});

app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: PUBLIC_DIR,
      keepExtensions: true,
    },
  }),
);

app.use(async (ctx) => {
  if (ctx.request.method === "POST" && ctx.request.url === "/upload") {
    try {
      const { file } = ctx.request.files;
      const fileName = `${uuid.v4()}_${file.originalFilename}`;
      const filePath = path.join(PUBLIC_DIR, fileName);
      fs.renameSync(file.filepath, filePath);
      ctx.body = { message: "File uploaded successfully", filename: fileName };
    } catch (e) {
      console.error(e);
      ctx.status = 500;
      ctx.body = { message: "File upload failed" };
    }
    return;
  }

  if (
    ctx.request.method === "DELETE" &&
    ctx.request.url.startsWith("/delete")
  ) {
    const { filename } = ctx.request.query;
    console.log(`Deleting file: ${filename}`);
    const filePath = path.join(PUBLIC_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      ctx.body = { message: "File deleted successfully" };
    } else {
      ctx.status = 404;
      ctx.body = { message: "File not found" };
    }
    return;
  }

  if (ctx.request.method === "GET" && ctx.request.url === "/images") {
    const files = fs.readdirSync(PUBLIC_DIR);
    ctx.body = files;
    return;
  }

  ctx.status = 404;
  ctx.body = { message: "Not found" };
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
