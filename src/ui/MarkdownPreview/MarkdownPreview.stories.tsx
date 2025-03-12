import { ComponentStory, ComponentMeta } from '@storybook/react';

import { MarkdownPreview } from './MarkdownPreview';

export default {
  component: MarkdownPreview,
} as ComponentMeta<typeof MarkdownPreview>;

const Template: ComponentStory<typeof MarkdownPreview> = args => (
  <MarkdownPreview {...args} />
);

export const MarkdownPreviewStory = Template.bind({});

MarkdownPreviewStory.args = {
  source: `
  # Orcanize
  ## Orcanize
  - Contribution 1
  - Contribution 2
  - Contribution 3 `,
};
