# Shopper Agent (Embedded Messaging)

Integrates **Salesforce Embedded Messaging** (Agentforce) so shoppers can open a chat window from the storefront. The agent chunk and embedded service script are deferred via `requestIdleCallback` so they do not block the main thread during hydration; if the user clicks **Open chat** before the first idle, the chunk loads on demand and the scheduled idle callback is cancelled. Use the **Open chat** button or `useShopperAgent().actions.open()` to launch the window.

## Configuration

Set one environment variable with the full config as a JSON string.

**Value:** Minified JSON object with keys: `enabled`, `embeddedServiceName`, `embeddedServiceEndpoint`, `scriptSourceUrl`, `scrt2Url`, `salesforceOrgId`, `siteId`, and optionally `enableConversationContext`, `conversationContext`. Build the JSON manually from the Embedded Service chat snippet; see documentation for the mapping and an example.

## Setup for different environments

1. **Local / .env**  
   Set `PUBLIC__app__commerceAgent` to the minified JSON string.

2. **Managed Runtime (MRT)**  
   In Environment Variables, add `PUBLIC__app__commerceAgent` and set its value to the minified JSON. Save; the project redeploys with the new config.

3. **Disable the agent**  
   Omit the variable or set `enabled` to `"false"` in the JSON.

## Usage

- **Root layout**  
  The app mounts `<ShopperAgent />` when `appConfig.commerceAgent?.enabled` is `'true'` or `true` (string or boolean). No extra wiring needed if config is set.

- **Open chat from code**  
  `import { useShopperAgent } from '@/components/shopper-agent';`  
  `const { actions } = useShopperAgent();`  
  `actions.open();`  
  Or use `launchChat()` / `openShopperAgent()` from `@/components/shopper-agent`.

- **Accessibility**  
  Use an `aria-label` (e.g. “Open chat”) on the button that opens the chat. The home page “Open chat” button uses the `home.openChat` translation key.

## References

- [Embedded Messaging API](https://developer.salesforce.com/docs/service/messaging-web/guide/embedded-messaging-api.html)
- Config base: `config.server.ts` → `app.commerceAgent`
- Env convention: `docs/README-CONFIG.md`, `docs/README-CONFIG-OPTIONS.md`
