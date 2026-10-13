import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClickIntentDiagram } from "@/stories/ClickIntentDiagram";

type StoryArgs = { code: string; selectedParticipant?: string };

const meta: Meta<StoryArgs> = {
  title: "Components/Sequence Diagram/Participant Editor",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The participant editor is the inspector that opens when a participant box is clicked
(in the frame, not on the name). It edits every attribute a participant declaration
can carry — \`@Type <<stereotype>> Name as "Label" #color\` — without the user needing
to know that syntax, and shows the resulting DSL line at the bottom so they learn it.

- **Type**: one-click chips for the UML archetypes, plus a search box across all
  core and cloud icon keys (AWS, Azure, GCP). Picking a result writes \`@key\`.
- **Stereotype** / **Display as**: committed on Enter or blur; quoted automatically
  when they contain spaces.
- **Color**: preset swatches or any hex value.
- **Name**: renames the participant everywhere it is referenced.

Changes apply immediately and the editor stays open; Esc, the × button or a click
outside closes it. Editing an inferred participant (one with no declaration line)
first writes its declaration, then applies the change.
`,
      },
    },
  },
  argTypes: {
    code: { control: "text", description: "Diagram source (ZenUML DSL)." },
    selectedParticipant: {
      control: "text",
      description: "Participant to open the editor on when the story loads.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: StoryArgs) => (
  <ClickIntentDiagram
    mode="Dynamic"
    code={args.code}
    selectedParticipant={args.selectedParticipant}
  />
);

export const Open: Story = {
  name: "Open on a styled participant",
  args: {
    code: `@Database <<Service>> Alice as "Alice Smith" #3b82f6
@Actor Bob
Bob -> Alice: Request
Alice --> Bob: Response`,
    selectedParticipant: "Alice",
  },
  render,
};

export const InferredParticipant: Story = {
  name: "Open on an inferred participant",
  args: {
    code: `A -> B: Ping
B --> A: Pong`,
    selectedParticipant: "A",
  },
  render,
};

export const Playground: Story = {
  args: {
    code: `@Actor User
@Boundary Web
@Database DB
User -> Web: Submit
Web -> DB: Save
DB --> Web: OK`,
  },
  render,
};
