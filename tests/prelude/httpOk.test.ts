const assert = require("assert");
const http = require("http");
const net = require("net");
const { test } = require("node:test");
const { httpOk } = require("../../src/prelude/httpOk.ts");

const listen = (server: any): Promise<number> =>
  new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));

test("judges answers as curl -sf does, without following redirects", async () => {
  const server = http.createServer((request: any, response: any) => {
    if (request.url === "/slow") return;
    if (request.url === "/redirect") {
      response.writeHead(302, { location: "/missing" });
    } else {
      response.writeHead(request.url === "/" ? 200 : 404);
    }
    response.end();
  });
  const base = "http://127.0.0.1:" + (await listen(server));
  try {
    assert.strictEqual(await httpOk(base + "/"), true);
    assert.strictEqual(await httpOk(base + "/missing"), false);
    assert.strictEqual(await httpOk(base + "/redirect"), true);
    assert.strictEqual(await httpOk(base + "/slow", 200), false);
  } finally {
    server.closeAllConnections();
    server.close();
  }
});

test("returns false when nothing listens", async () => {
  const closed = net.createServer();
  const port = await listen(closed);
  closed.close();
  assert.strictEqual(await httpOk("http://127.0.0.1:" + port + "/"), false);
});
