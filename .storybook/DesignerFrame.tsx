import type { Decorator } from '@storybook/react-vite';

function lastTitleSegment(title: string): string {
  const segment = title.split('/').at(-1);
  return segment ?? title;
}

export const withDesignerFrame: Decorator = (Story, context) => {
  const subtitle = context.parameters.componentSubtitle as string | undefined;
  const storyDescription = context.parameters.docs?.description?.story as string | undefined;
  const fullBleed = Boolean(context.parameters.fullBleed);
  const isDocs = context.viewMode === 'docs';

  const stage = fullBleed ? (
    <Story />
  ) : (
    <div className={`flex w-full justify-center px-8 ${isDocs ? 'py-6' : 'py-12'}`}>
      <Story />
    </div>
  );

  if (isDocs) {
    return stage;
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200 px-8 py-6">
        <div className="mx-auto max-w-3xl">
          <p className="font-manrope text-xs uppercase tracking-[0.16em] text-neutral-500">
            {context.title.replaceAll('/', ' / ')}
          </p>
          <h1 className="mt-1 font-grotesque text-3xl font-bold tracking-tight">
            {lastTitleSegment(context.title)}
          </h1>
          {subtitle ? (
            <p className="mt-1 font-manrope text-base text-neutral-600">{subtitle}</p>
          ) : null}
          <div className="mt-5 border-t border-neutral-200 pt-4">
            <p className="font-manrope text-xs uppercase tracking-[0.16em] text-neutral-500">State</p>
            <h2 className="mt-1 font-grotesque text-xl font-semibold">{context.name}</h2>
            {storyDescription ? (
              <p className="mt-1 max-w-2xl font-manrope text-sm leading-6 text-neutral-600">
                {storyDescription}
              </p>
            ) : null}
          </div>
        </div>
      </header>
      {stage}
    </div>
  );
};
