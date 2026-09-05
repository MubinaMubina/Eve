import { expect, Page, test } from "@playwright/test";
import { resolve } from "node:path";

async function enter(page: Page) {
  await page.addInitScript(() => {
    const revoke = URL.revokeObjectURL.bind(URL);
    const revoked: string[] = [];
    Object.assign(window, { revokedMediaUrls: revoked });
    URL.revokeObjectURL = (uri) => {
      revoked.push(uri);
      revoke(uri);
    };
  });
  await page.goto("/");
  await page
    .getByRole("radio", { name: "Private account", exact: true })
    .click();
  await page.getByRole("button", { name: "Enter preview" }).click();
  await page.getByRole("button", { name: "Create post", exact: true }).click();
}

async function choosePhoto(page: Page, button = "Add photo") {
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: button, exact: true }).click();
  await (await chooser).setFiles(resolve("assets/icon.png"));
  await expect(page.getByRole("img", { name: "Post photo" })).toBeVisible();
}

test("photo-only posts retain privacy, render pixels and release media after deletion", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  await choosePhoto(page);
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(
    page.getByTestId("post").getByText("Followers", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("img")
        .evaluateAll((images) =>
          images.some(
            (img) =>
              img instanceof HTMLImageElement &&
              img.complete &&
              img.naturalWidth > 0 &&
              img.src.startsWith("blob:"),
          ),
        ),
    )
    .toBe(true);
  await page.screenshot({
    path: `test-results/${info.project.name}-photo-post.png`,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Delete post" }).click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page.getByRole("img", { name: "Post photo" })).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { revokedMediaUrls: string[] }).revokedMediaUrls
            .length,
      ),
    )
    .toBe(1);
  expect(errors).toEqual([]);
});

test("replacing, removing and discarding attachments clean up local URLs", async ({
  page,
}) => {
  await enter(page);
  await choosePhoto(page);
  await choosePhoto(page, "Replace with photo");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { revokedMediaUrls: string[] }).revokedMediaUrls
            .length,
      ),
    )
    .toBe(1);
  await page.getByRole("button", { name: "Remove attachment" }).click();
  await expect(
    page.getByRole("button", { name: "Post", exact: true }),
  ).toBeDisabled();
  await choosePhoto(page);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Keep writing" }).click();
  await expect(page.getByRole("img", { name: "Post photo" })).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Discard draft" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { revokedMediaUrls: string[] }).revokedMediaUrls
            .length,
      ),
    )
    .toBe(3);
});

test("anonymous video-only posts play locally and stop when leaving the view", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  // Generate synthetic motion using the browser's encoder, without third-party media.
  const clip = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d")!;
    let frame = 0;
    const draw = () => {
      ctx.fillStyle = "#17634b";
      ctx.fillRect(0, 0, 320, 240);
      ctx.fillStyle = "#f0b1be";
      ctx.fillRect((frame++ * 5) % 240, 70, 80, 80);
    };
    draw();
    const stream = canvas.captureStream(20);
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp8",
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });
    const timer = setInterval(draw, 50);
    recorder.start();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    recorder.stop();
    await stopped;
    clearInterval(timer);
    stream.getTracks().forEach((track) => track.stop());
    return Array.from(
      new Uint8Array(
        await new Blob(chunks, { type: "video/webm" }).arrayBuffer(),
      ),
    );
  });
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add video", exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: "sample-motion.webm",
    mimeType: "video/webm",
    buffer: Buffer.from(clip),
  });
  await expect(page.getByRole("button", { name: "Play video" })).toBeEnabled();
  await page.getByRole("switch", { name: "Post anonymously" }).click();
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(
    page.getByTestId("post").getByText("Everyone on Eve", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("video")).toHaveJSProperty("paused", true);
  await page.getByRole("button", { name: "Play video" }).click();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0.1);
  await page.getByRole("button", { name: "Pause video" }).click();
  await expect(page.locator("video")).toHaveJSProperty("paused", true);
  expect(
    await page.locator("video").evaluate((video) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video as HTMLVideoElement, 0, 0, 1, 1);
      return ctx.getImageData(0, 0, 1, 1).data[1];
    }),
  ).toBeGreaterThan(30);
  await page.getByRole("button", { name: "Unmute video" }).click();
  await expect(page.locator("video")).toHaveJSProperty("muted", false);
  await expect(
    page.getByRole("button", { name: "Mute video", exact: true }),
  ).toBeVisible();
  const seek = page.getByRole("slider", { name: "Video position" });
  await expect(seek).toBeEnabled();
  await seek.press("End");
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0.8);
  await seek.press("Home");
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeLessThan(0.1);
  await page.screenshot({
    path: `test-results/${info.project.name}-video-post.png`,
    animations: "disabled",
  });
  await page.getByRole("tab", { name: "Home", exact: true }).click();
  await expect(page.locator("video")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("a corrupt image is rejected without losing the caption", async ({
  page,
}) => {
  await enter(page);
  await page
    .getByRole("textbox", { name: "Post text" })
    .fill("Keep this caption.");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add photo", exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from("not an image"),
  });
  await expect(page.getByRole("alert")).toContainText("could not be read");
  await expect(page.getByRole("textbox", { name: "Post text" })).toHaveValue(
    "Keep this caption.",
  );
  await expect(
    page.getByRole("button", { name: "Post", exact: true }),
  ).toBeEnabled();
});
