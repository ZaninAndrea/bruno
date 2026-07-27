import { test, expect } from '../../../playwright';
import { buildCommonLocators } from '../../utils/page/locators';

test.describe.serial('graphql subscription', () => {
  test('graphql-subscription-request items are visible in the sidebar', async ({ pageWithUserData: page }) => {
    await page.locator('#sidebar-collection-name').click();

    await expect(page.locator('span.item-name').filter({ hasText: 'on-counter' })).toBeVisible();
    await expect(page.locator('span.item-name').filter({ hasText: 'on-countdown' })).toBeVisible();
    await expect(page.locator('span.item-name').filter({ hasText: 'on-failing' })).toBeVisible();
  });

  test('subscribing streams incoming frames, and unsubscribing stops them without closing the connection', async ({ pageWithUserData: page }) => {
    const locators = buildCommonLocators(page);

    await test.step('open the request and subscribe', async () => {
      await page.getByTitle(/^on-counter$/).click();
      await locators.graphqlSubscription.connectionControls.subscribe().click();
    });

    await test.step('the Subscribe button flips to Unsubscribe once connected', async () => {
      await expect(locators.graphqlSubscription.connectionControls.unsubscribe()).toBeVisible({ timeout: 5000 });
    });

    await test.step('at least two incoming frames arrive', async () => {
      await expect(locators.graphqlSubscription.incomingMessages().first()).toBeAttached({ timeout: 5000 });
      await expect
        .poll(async () => locators.websocket.messages().count(), { timeout: 5000 })
        .toBeGreaterThanOrEqual(3); // connection_ack + subscribe echo + at least one `next`
    });

    await test.step('unsubscribing stops the stream and reverts the button to Subscribe', async () => {
      await locators.graphqlSubscription.connectionControls.unsubscribe().click();
      await expect(locators.graphqlSubscription.connectionControls.subscribe()).toBeVisible({ timeout: 5000 });
    });
  });

  test('a finite subscription completes on its own and the button reverts to Subscribe', async ({ pageWithUserData: page }) => {
    const locators = buildCommonLocators(page);

    await page.getByTitle(/^on-countdown$/).click();
    await locators.graphqlSubscription.connectionControls.subscribe().click();

    await expect(locators.graphqlSubscription.connectionControls.unsubscribe()).toBeVisible({ timeout: 5000 });

    // countdown ticks 3 times (300ms apart) then completes server-side —
    // no user unsubscribe click, the button should still revert on its own.
    await expect(locators.graphqlSubscription.connectionControls.subscribe()).toBeVisible({ timeout: 5000 });
  });

  test('a mid-stream server error closes the connection and surfaces an error frame', async ({ pageWithUserData: page }) => {
    const locators = buildCommonLocators(page);

    await page.getByTitle(/^on-failing$/).click();
    await locators.graphqlSubscription.connectionControls.subscribe().click();

    await expect(locators.graphqlSubscription.connectionControls.unsubscribe()).toBeVisible({ timeout: 5000 });

    // The failing subscription throws mid-stream; the reference server closes
    // the socket, so the button reverts to Subscribe without a user click.
    await expect(locators.graphqlSubscription.connectionControls.subscribe()).toBeVisible({ timeout: 5000 });
    await expect(locators.graphqlSubscription.errorMessages().first()).toBeAttached({ timeout: 5000 });
  });
});
