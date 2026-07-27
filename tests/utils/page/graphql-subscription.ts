import { Page } from '../../../playwright';

export const buildGraphqlSubscriptionCommonLocators = (page: Page) => ({
  connectionControls: {
    subscribe: () => page.getByTestId('gql-sub-subscribe-button'),
    unsubscribe: () => page.getByTestId('gql-sub-unsubscribe-button')
  },
  messages: () => page.locator('.ws-message'),
  incomingMessages: () => page.locator('.ws-message.ws-incoming'),
  errorMessages: () => page.locator('.ws-error'),
  infoMessages: () => page.locator('.ws-info'),
  connectionParams: () => page.getByTestId('graphql-subscription-connection-params').locator('.CodeMirror'),
  connectionParamsEditor: () => page.getByTestId('graphql-subscription-connection-params').locator('.CodeMirror-code'),
  tabs: {
    query: () => page.getByRole('tab', { name: 'Query' }),
    headers: () => page.getByRole('tab', { name: 'Headers' }),
    auth: () => page.getByRole('tab', { name: 'Auth' }),
    connection: () => page.getByRole('tab', { name: 'Connection' }),
    settings: () => page.getByRole('tab', { name: 'Settings' }),
    docs: () => page.getByRole('tab', { name: 'Docs' })
  }
});
