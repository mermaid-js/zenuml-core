import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ClickIntentDiagram,
  type ClickIntentMode,
} from "@/stories/ClickIntentDiagram";

type StoryArgs = { mode: ClickIntentMode };

const meta: Meta<StoryArgs> = {
  title: "Components/Sequence Diagram/Message",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Try message editing, the message menu, and reordering in a real sequence diagram. In Dynamic mode, click a message label to edit it; click its arrow to open the message menu. The handle stays hidden until you hover a message row or focus it with Tab. Its six-dot glyph is 32 × 14 px inside a 32 × 24 px hit area on the left. Drag only from that handle to reorder; releasing a drag does not open the menu. Editing any label temporarily disables insert and reorder controls. Static mode is read-only.",
      },
    },
  },
  argTypes: {
    mode: {
      control: "inline-radio",
      options: ["Dynamic", "Static"],
      description:
        "Dynamic enables editing, the message menu, and the drag handle; Static is read-only.",
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
Alice -> Web: Click this label to edit
Web --> Alice: Click this arrow to open the menu
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
