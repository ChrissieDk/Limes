import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import PackageFlowBreadcrumbs, { type PackageFlowBreadcrumbInput } from './PackageFlowBreadcrumbs';
import type { CatalogCategoryNode } from '../../../../types';

const base: PackageFlowBreadcrumbInput = {
  packageType: null,
  contractFlowType: null,
  simStatus: null,
  iccidConfirmed: false,
  bundleCategories: [],
  selectedBundleCategory: null,
  showPackages: false,
  showPlanBuilder: false,
  planAllocation: null,
  comboBundleCount: 0,
};

const categories: CatalogCategoryNode[] = [
  { id: 'data', name: 'Data', displayOrder: 1, children: [], productCount: 5, hasProducts: true },
];

const meta = {
  title: 'Dashboard/PackageFlowBreadcrumbs',
  component: PackageFlowBreadcrumbs,
  args: { state: base },
  parameters: designerMeta({
    subtitle: 'Where you are in choose-package',
    purpose:
      'Step trail for the package wizard. It grows as the customer picks subscription type, SIM status, category, and plan.',
    states: 'Start, Subscription type, Combo SIM pick, Packages shown, Plan builder.',
    usage: 'Place above the current step. Only show crumbs for steps already reached so it never spoils the path ahead.',
  }),
  render: (args) => (
    <div className="max-w-2xl">
      <PackageFlowBreadcrumbs {...args} />
    </div>
  ),
} satisfies Meta<typeof PackageFlowBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Start: Story = {
  parameters: designerStory('First screen of the flow. The trail is minimal because nothing has been chosen yet.'),
};

export const SubscriptionType: Story = {
  args: {
    state: { ...base, packageType: 'contract' },
  },
  parameters: designerStory('Contract selected. The crumb now names the subscription type.'),
};

export const ComboFlowSimPick: Story = {
  args: {
    state: { ...base, packageType: 'contract', contractFlowType: 'combo' },
  },
  parameters: designerStory('Combo path: next decision is whether they already have a SIM.'),
};

export const PackagesShown: Story = {
  args: {
    state: {
      ...base,
      packageType: 'contract',
      contractFlowType: 'combo',
      simStatus: 'has-sim',
      iccidConfirmed: true,
      bundleCategories: categories,
      showPackages: true,
    },
  },
  parameters: designerStory('Catalogue is on screen. Breadcrumbs include SIM confirmed and the package step.'),
};

export const PlanBuilderShown: Story = {
  args: {
    state: {
      ...base,
      packageType: 'contract',
      contractFlowType: 'dynamic',
      simStatus: 'needs-sim',
      showPlanBuilder: true,
      planAllocation: { data: 30 },
    },
  },
  parameters: designerStory('Dynamic plan builder step. The trail should make it obvious they can go back to SIM / type.'),
};
