// Copied from https://github.com/ian/analytics/blob/main/packages/plausible/src/plausible.ts
// Added changes to enable auto-tracking of outbound links
import type { AnalyticsInstance } from 'analytics';
import Plausible from 'plausible-tracker';

interface IPluginProperties {
  instance: AnalyticsInstance;
  config: IPluginConfig;
}

interface IPluginConfig {
  apiHost?: string;
  domain?: string;
  hashMode?: boolean;
  trackLocalhost?: boolean;
  outboundLinkTracking?: boolean;
}

interface IProperties {
  payload: IPayload;
}

interface IPayload {
  event: string;
  properties: Readonly<Record<string, string>>;
}

interface IPluginContext {
  plausible: ReturnType<typeof Plausible> | null;
}

const defaultConfig = {
  enabled: true
};

export default function plausiblePlugin(pluginConfig: IPluginConfig) {
  const context: IPluginContext = {
    plausible: null
  };

  return {
    name: 'plausible-analytics',
    config: {
      ...defaultConfig,
      ...pluginConfig
    },

    initialize: ({ config }: IPluginProperties) => {
      const { apiHost, domain, hashMode, trackLocalhost, outboundLinkTracking } = config;

      const plausibleConfig = Object.fromEntries(
        Object.entries({
          apiHost,
          domain,
          hashMode,
          trackLocalhost
        }).filter(([, value]) => value !== undefined)
      );

      context.plausible = Plausible(plausibleConfig);
      if (outboundLinkTracking) {
        context.plausible.enableAutoOutboundTracking();
      }
    },

    loaded: () => {
      return Boolean(context.plausible);
    },

    page: ({ payload }: IProperties) => {
      if (!context.plausible) return;

      const { properties } = payload;
      context.plausible.trackPageview({}, { props: properties });
    },

    // Set parameter scope at event level with 'event' method
    track: ({ payload }: IProperties) => {
      if (!context.plausible) return;

      const { properties, event } = payload;
      context.plausible.trackEvent(event, { props: properties });
    }
  };
}
