const { createServer } = require("http");
const { Response } = require("servie/dist/node");
const { get } = require("servie-route");
const { createHandler } = require("../dist");

const port = 4000;

const app = createHandler(
  get("/", () => {
    return new Response("hello world");
  })
);

createServer(app).listen(port, () => console.log("servie running:", port));
