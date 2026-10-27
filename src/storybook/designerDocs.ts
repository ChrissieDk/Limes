type DesignerMetaOptions = {
  subtitle: string;
  purpose: string;
  states: string;
  usage?: string;
  fullBleed?: boolean;
};

export function designerMeta({
  subtitle,
  purpose,
  states,
  usage,
  fullBleed = false,
}: DesignerMetaOptions) {
  const description = [
    `**Purpose.** ${purpose}`,
    `**States.** ${states}`,
    usage ? `**Usage.** ${usage}` : undefined,
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    componentSubtitle: subtitle,
    fullBleed,
    layout: 'fullscreen' as const,
    docs: {
      description: {
        component: description,
      },
    },
  };
}

export function designerStory(description: string) {
  return {
    docs: {
      description: {
        story: description,
      },
    },
  };
}
