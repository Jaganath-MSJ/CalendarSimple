import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@chromatic-com/storybook", "@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    return {
      ...config,
      build: {
        ...config.build,
        chunkSizeWarningLimit: 2000,
      },
      plugins: config.plugins?.filter((plugin) => {
        // Remove vite-plugin-dts if present
        return !(plugin && "name" in plugin && plugin.name === "vite:dts");
      }),
    };
  },
};
export default config;
