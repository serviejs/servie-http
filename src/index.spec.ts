import { Response } from "servie/dist/node";
import { get } from "servie-route";
import { compose } from "throwback";
import { createReadStream } from "fs";
import * as http from "http";
import { join } from "path";
import { createHandler } from "./index";

describe("servie-http", () => {
  const handler = createHandler(
    compose([
      get("/", () => {
        return new Response("hello world");
      }),
      get("/stream", () => {
        return new Response(createReadStream(join(__dirname, "index.ts")), {
          headers: {
            Trailer: "Server-Timing"
          },
          trailer: {
            "Server-Timing": "end=100"
          }
        });
      })
    ])
  );

  const server = http.createServer(handler).listen(0);
  const address = server.address();
  const url =
    typeof address === "string" ? address : `http://localhost:${address!.port}`;

  afterAll(() => server.close());

  it("should work over http", done => {
    return http.get(url, res => {
      let data = "";

      res.on("data", (chunk: Buffer) => (data += chunk.toString("utf8")));

      res.on("end", () => {
        expect(res.headers["content-type"]).toEqual("text/plain");
        expect(res.headers["content-length"]).toEqual("11");
        expect(data).toBe("hello world");

        return done();
      });
    });
  });

  it("should send trailers", done => {
    return http.get(`${url}/stream`, res => {
      res.resume();

      res.on("end", () => {
        expect(res.trailers).toEqual({ "server-timing": "end=100" });

        return done();
      });
    });
  });
});
