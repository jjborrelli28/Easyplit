import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";

import "../app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#fff" },
        { name: "dark", value: "#191919" },
      ],
    },
    nextjs: {
      appDirectory: true,
    },
  },

  decorators: [
    withThemeByClassName({
      themes: {
        // nameOfTheme: 'classNameForTheme',
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
