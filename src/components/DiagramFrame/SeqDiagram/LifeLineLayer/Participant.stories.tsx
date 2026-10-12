import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ClickIntentDiagram,
  type ClickIntentMode,
} from "@/stories/ClickIntentDiagram";

type StoryArgs = { mode: ClickIntentMode };

const meta: Meta<StoryArgs> = {
  title: "Components/Sequence Diagram/Participant",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Try participant editing and the style toolbar in a real sequence diagram. In Dynamic mode, click a participant name to edit it; click empty space in its frame to select it and open the style toolbar. Message rows also show the dedicated drag handle on hover or keyboard focus: drag from the handle to reorder, while clicking a label edits and clicking an arrow opens the message menu. Editing any label temporarily disables insert and move controls. Static mode is read-only.",
      },
    },
  },
  argTypes: {
    mode: {
      control: "inline-radio",
      options: ["Dynamic", "Static"],
      description:
        "Dynamic enables editing, participant tools, and message reordering; Static is read-only.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = ({ mode }: StoryArgs) => (
  <ClickIntentDiagram
    mode={mode}
    code={`@Actor Alice
@Boundary Web
Alice -> Web: Request
Web --> Alice: Response
Alice.refresh() {
  Alice -> Web: Nested message
  Alice -> Alice: Self message
}`}
  />
);

export const Dynamic: Story = {
  args: { mode: "Dynamic" },
  render: (args) => <Demo {...args} />,
};

export const Static: Story = {
  args: { mode: "Static" },
  render: (args) => <Demo {...args} />,
};
