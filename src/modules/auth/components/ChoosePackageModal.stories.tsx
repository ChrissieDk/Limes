import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import ChoosePackageModal from './ChoosePackageModal';
import type { CatalogProduct } from '../../../types';

const selectedPackage: CatalogProduct = {
  id: '7029225P',
  sku: 'SIM-FLEX25',
  name: 'Flex 25',
  price: 299,
  brand: 'Limes',
  displayOrder: 1,
  isAdHoc: false,
  packageType: 'contract',
  simStatus: 'needs-sim',
  planChargeType: 'monthly',
  features: { mobileData: '25GB' },
};

const meta = {
  title: 'Dashboard/ChoosePackageModal',
  component: ChoosePackageModal,
  args: {
    open: true,
    onClose: () => {},
    selectedPackage,
  },
  parameters: designerMeta({
    subtitle: 'Package wizard overlay',
    purpose:
      'Multi-step flow to confirm a package, SIM status, and checkout extras. Opens from a selected catalogue card.',
    states: 'Open (first step).',
    usage: 'Full-bleed modal. Backend services are stubbed here, so this is the first wizard step and its empty/loading edges.',
    fullBleed: true,
  }),
} satisfies Meta<typeof ChoosePackageModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  parameters: designerStory('Wizard start for Flex 25 with a new SIM. Review layout, step chrome, and the primary continue action.'),
};
