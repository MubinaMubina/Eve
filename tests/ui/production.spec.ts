import { createServer, Server } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { expect, test } from "@playwright/test";

let server: Server;
let url: string;
test.beforeAll(async () => {
  const root = resolve("dist");
  await readFile(resolve(root, "index.html"));
  server = createServer(async (req, res) => {
    try {
      const path = resolve(
        root,
        "." + new URL(req.url!, "http://localhost").pathname,
      );
      if (path !== root && !path.startsWith(root + sep)) {
        res.writeHead(403).end();
        return;
      }
      const file = path === root ? resolve(root, "index.html") : path;
      const mime: Record<string, string> = {
        ".js": "application/javascript",
        ".css": "text/css",
        ".html": "text/html",
        ".png": "image/png",
      };
      res.setHeader(
        "Content-Type",
        mime[extname(file)] ?? "application/octet-stream",
      );
      res.end(await readFile(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Test server did not start");
  url = `http://127.0.0.1:${address.port}`;
});
test.afterAll(async () => {
  if (server)
    await new Promise<void>((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
});

test("production builds never expose the synthetic member experience", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await expect(page.getByText("Not open yet.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enter preview" })).toHaveCount(
    0,
  );
  await expect(page.getByTestId("post")).toHaveCount(0);
  expect(errors).toEqual([]);
});
