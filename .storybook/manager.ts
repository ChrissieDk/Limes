import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import './manager.css';

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Limes',
    brandTarget: '_self',
    colorPrimary: '#ABFF63',
    colorSecondary: '#3F3E46',
    barSelectedColor: '#F4F4F5',
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
