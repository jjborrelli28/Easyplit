import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from '@storybook/react';

import '../app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    }, backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#000000' },
      ],
    },
  },

  decorators: [withThemeByClassName({
    themes: {
      // nameOfTheme: 'classNameForTheme',
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
  })]
};

export default preview;