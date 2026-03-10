# Shopper Agent (Embedded Messaging)

Integrates **Salesforce Embedded Messaging** (Agentforce) so shoppers can open a chat window from the storefront. The embedded service script is loaded on the client; use the **Open chat** button or `useShopperAgent().actions.open()` to launch the window.

## Configuration

All settings are driven by application config, which can be overridden via **environment variables** (e.g. in `.env` or Managed Runtime env).

| Env variable | Description |
|--------------|-------------|
| `PUBLIC__app__commerceAgent__enabled` | `'true'` or `'false'`. When `'false'` or unset, the agent is disabled. |
| `PUBLIC__app__commerceAgent__embeddedServiceName` | Deployment name from your Embedded Service Deployments. |
| `PUBLIC__app__commerceAgent__embeddedServiceEndpoint` | Base URL of the deployment (e.g. `https://your-org.my.site.com/ESW...`). |
| `PUBLIC__app__commerceAgent__scriptSourceUrl` | Full URL to the bootstrap script (e.g. `.../assets/js/bootstrap.min.js`). |
| `PUBLIC__app__commerceAgent__scrt2Url` | SCRT2 URL for your org (e.g. `https://your-org.salesforce-scrt.com`). |
| `PUBLIC__app__commerceAgent__salesforceOrgId` | Salesforce org ID (18 chars). |
| `PUBLIC__app__commerceAgent__siteId` | Commerce site ID (e.g. `RefArch`, `storefrontnext`). |
| `PUBLIC__app__commerceAgent__enableConversationContext` | Optional. `'true'` to send conversation context to the agent. |
| `PUBLIC__app__commerceAgent__conversationContext` | Optional. JSON array of context keys (when conversation context is enabled). |

Default values in `config.server.ts` are empty or disabled. Set the variables above for each environment (local, staging, production) so the correct deployment and org are used.

## Setup for different environments

1. **Local / .env**  
   Copy the Commerce Agent block from `.env.default` into `.env` and fill in values for your Embedded Service deployment.

2. **Managed Runtime (MRT)**  
   In your MRT project, add the same `PUBLIC__app__commerceAgent__*` variables to the environment configuration for each target (e.g. development, staging, production).

3. **Disable the agent**  
   Omit the commerceAgent env vars or set `PUBLIC__app__commerceAgent__enabled=false`. The component will not render and the chat button will not open a window.

## Usage

- **Root layout**  
  The app mounts `<ShopperAgent />` when `appConfig.commerceAgent?.enabled === 'true'`. No extra wiring needed if config is set.

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
- Env convention: `src/config/README.md`, `src/config/CONFIG-OPTIONS.md`
