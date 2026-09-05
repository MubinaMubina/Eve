import { expect, test } from "@playwright/test";

test("account choice, feed separation, composer defaults, privacy and deletion", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Enter preview" }),
  ).toBeDisabled();
  await page
    .getByRole("radio", { name: "Private account", exact: true })
    .click();
  await page.getByRole("button", { name: "Enter preview" }).click();
  await expect(
    page.getByText("The conversation", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${info.project.name}-feed.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("tab", { name: "Anonymous", exact: true }).click();
  await expect(page.getByText("Author 4827", { exact: true })).toBeVisible();
  await expect(page.getByText("Sana", { exact: true })).toHaveCount(0);
  await page.getByRole("tab", { name: "Following", exact: true }).click();
  await expect(page.getByText("Close friends", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Create post", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Followers", exact: true }),
  ).toBeChecked();
  await page
    .getByRole("textbox", { name: "Post text" })
    .fill("My first private post.");
  await page.screenshot({
    path: `test-results/${info.project.name}-composer.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.getByText("My first private post.")).toBeVisible();
  await page.getByRole("tab", { name: "Account", exact: true }).click();
  await page.getByRole("radio", { name: "Public", exact: true }).click();
  await page.getByRole("button", { name: "Make public", exact: true }).click();
  await page.getByRole("tab", { name: "Your posts", exact: true }).click();
  await expect(
    page.getByTestId("post").getByText("Everyone on Eve", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Create post", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Everyone on Eve", exact: true }),
  ).toBeChecked();
  await page.getByRole("switch", { name: "Post anonymously" }).click();
  await expect(page.getByRole("radio")).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Post text" })
    .fill("An anonymous thought.");
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.getByText("An anonymous thought.")).toBeVisible();
  await page.getByRole("tab", { name: "Account", exact: true }).click();
  await page.getByRole("radio", { name: "Private", exact: true }).click();
  await page.getByRole("button", { name: "Make private", exact: true }).click();
  await page.getByRole("tab", { name: "Your posts", exact: true }).click();
  await expect(
    page.getByTestId("post").getByText("Everyone on Eve", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete post", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await expect(page.getByText("An anonymous thought.")).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("draft close requires confirmation and audience overrides are not remembered", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("radio", { name: "Private account", exact: true })
    .click();
  await page.getByRole("button", { name: "Enter preview" }).click();
  await page.getByRole("button", { name: "Create post", exact: true }).click();
  await page
    .getByRole("radio", { name: "Everyone on Eve", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Post text" }).fill("Unsent draft");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Keep writing" }).click();
  await expect(page.getByRole("textbox", { name: "Post text" })).toHaveValue(
    "Unsent draft",
  );
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Discard draft" }).click();
  await page.getByRole("button", { name: "Create post", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Followers", exact: true }),
  ).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Post text" })).toHaveValue(
    "",
  );
});
