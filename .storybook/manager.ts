import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Limes',
    brandTarget: '_self',
    colorPrimary: '#ABFF63',
    colorSecondary: '#ABFF63',
  }),
  sidebar: {
    showRoots: true,
  },
  layoutCustomisations: {
    showPanel(state, defaultValue) {
      return state.viewMode === 'docs' ? false : defaultValue;
    },
    showToolbar(state, defaultValue) {
      return state.viewMode === 'docs' ? false : defaultValue;
    },
  },
});
