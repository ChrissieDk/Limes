import type { Meta, StoryObj } from "@storybook/react-vite";
import PackageFlowBreadcrumbs from "./PackageFlowBreadcrumbs";
import type { CatalogCategoryNode } from "../../../../types";

const meta = {
  title: "Dashboard/PackageFlowBreadcrumbs",
  component: PackageFlowBreadcrumbs,
  parameters: {
    design: {
      type: "figma",
      url: "",
    },
  },
} satisfies Meta<typeof PackageFlowBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCategories: CatalogCategoryNode[] = [
  {
    id: "cat-data",
    name: "Data Bundles",
    displayOrder: 1,
    children: [],
    productCount: 5,
    hasProducts: true,
  },
  {
    id: "cat-voice",
    name: "Voice Bundles",
    displayOrder: 2,
    children: [],
    productCount: 3,
    hasProducts: true,
  },
];

/** Top-level — no selections made yet. */
export const Initial: Story = {
  args: {
    state: {
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
    },
  },
};

/** Prepaid flow — choosing bundle category. */
export const PrepaidChooseBundle: Story = {
  args: {
    state: {
      packageType: "prepaid",
      contractFlowType: null,
      simStatus: "has-sim",
      iccidConfirmed: true,
      bundleCategories: mockCategories,
      selectedBundleCategory: null,
      showPackages: false,
      showPlanBuilder: false,
      planAllocation: null,
      comboBundleCount: 0,
    },
  },
};

/** Prepaid flow — viewing packages in a specific category. */
export const PrepaidViewingPackages: Story = {
  args: {
    state: {
      packageType: "prepaid",
      contractFlowType: null,
      simStatus: "has-sim",
      iccidConfirmed: true,
      bundleCategories: mockCategories,
      selectedBundleCategory: "cat-data",
      showPackages: true,
      showPlanBuilder: false,
      planAllocation: null,
      comboBundleCount: 0,
    },
  },
};

/** Contract flow — choosing contract type. */
export const ContractChooseType: Story = {
  args: {
    state: {
      packageType: "contract",
      contractFlowType: null,
      simStatus: null,
      iccidConfirmed: false,
      bundleCategories: [],
      selectedBundleCategory: null,
      showPackages: false,
      showPlanBuilder: false,
      planAllocation: null,
      comboBundleCount: 0,
    },
  },
};

/** Contract flow — dynamic plan builder. */
export const ContractDynamicBuilder: Story = {
  args: {
    state: {
      packageType: "contract",
      contractFlowType: "dynamic",
      simStatus: "has-sim",
      iccidConfirmed: true,
      bundleCategories: [],
      selectedBundleCategory: null,
      showPackages: false,
      showPlanBuilder: true,
      planAllocation: null,
      comboBundleCount: 0,
    },
  },
};

/** Contract flow — combo subscriptions. */
export const ContractCombo: Story = {
  args: {
    state: {
      packageType: "contract",
      contractFlowType: "combo",
      simStatus: "has-sim",
      iccidConfirmed: true,
      bundleCategories: [],
      selectedBundleCategory: null,
      showPackages: false,
      showPlanBuilder: false,
      planAllocation: null,
      comboBundleCount: 5,
    },
  },
};

/** SIM selection screen (needs SIM). */
export const NeedsSim: Story = {
  args: {
    state: {
      packageType: "prepaid",
      contractFlowType: null,
      simStatus: "needs-sim",
      iccidConfirmed: false,
      bundleCategories: [],
      selectedBundleCategory: null,
      showPackages: false,
      showPlanBuilder: false,
      planAllocation: null,
      comboBundleCount: 0,
    },
  },
};
