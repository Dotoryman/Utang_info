import assert from "node:assert/strict";
import test from "node:test";

import {
  NOTIFICATION_PAGE_SIZE,
  parseNotificationPage,
} from "../lib/notifications.ts";

test("normalizes notification pages", () => {
  assert.equal(parseNotificationPage(null), 1);
  assert.equal(parseNotificationPage("0"), 1);
  assert.equal(parseNotificationPage("-1"), 1);
  assert.equal(parseNotificationPage("not-a-number"), 1);
  assert.equal(parseNotificationPage("3"), 3);
  assert.equal(NOTIFICATION_PAGE_SIZE, 20);
});
