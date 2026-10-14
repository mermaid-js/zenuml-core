import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ClickIntentDiagram } from "@/stories/ClickIntentDiagram";

type StoryArgs = { code: string; selectedParticipant?: string };

const meta: Meta<StoryArgs> = {
  title: "Components/Sequence Diagram/Participant Editor",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      // The editor is a fixed-position popover; an iframe keeps it inside
      // each story's frame instead of floating over the docs page.
      story: { inline: false, iframeHeight: 640 },
      description: {
        component: `
The participant editor opens when a participant box is clicked (in the frame, not on
the name). It is a **split editor**: small controls sit on the participant itself and a
one-line name row hangs below it, so the diagram stays visible while you edit.

- **Icon slot** (top left of the box): empty it shows a dashed "+"; filled it shows the
  type icon. Click it to open the **type picker** (UML archetypes plus a search box across
  core and cloud icon keys); picking writes \`@Type\`.
- **Colour slot** (top right): click it to open the **colour picker** (preset swatches or a
  custom hex); picking writes \`#color\`.
- **Stereotype** pill above the box: committed on Enter or blur, quoted when it has spaces.
- **Name row** below the box: **Name** renames the participant everywhere; **Display as**
  sets the label. Both commit on Enter or blur. The resulting DSL line is shown so users
  learn the syntax.
- **Clear**: hover (or focus) a filled slot to reveal its red x; click it, or press
  Delete/Backspace on the slot, to remove the type or colour.

Changes apply immediately and the editor stays open. Esc or a click outside closes it.
Editing an inferred participant (one with no declaration line) first writes its
declaration, then applies the change.

The five design states below match the canvas boards Split-1 to Split-5. States 2 to 5 use
a play function to reach the state, so they are ready when the story loads.
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

const EMPTY_CODE = `@Actor Bob
Alice
Bob -> Alice: Request
Alice --> Bob: Response`;

const FILLED_CODE = `@Database <<Service>> Alice as "Alice Smith" #1d4ed8
@Actor Bob
Bob -> Alice: Request
Alice --> Bob: Response`;

// The editor renders after fonts load and the selection applies, so every
// play step waits for its element. The iframe body is searched because the
// editor is positioned over the whole viewport.
const editor = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body);

/** Board 1: participant selected, no type or colour yet. */
export const Selected: Story = {
  name: "1 Selected (empty slots)",
  parameters: {
    docs: {
      description: {
        story:
          "Alice is selected and has no declaration. Both slots are dashed and empty; the name row sits below the box.",
      },
    },
  },
  args: { code: EMPTY_CODE, selectedParticipant: "Alice" },
  render,
  play: async ({ canvasElement }) => {
    await editor(canvasElement).findByRole("button", { name: "Set icon" });
  },
};

/** Board 2: the type picker is open. */
export const PickingType: Story = {
  name: "2 Picking type",
  parameters: {
    docs: {
      description: {
        story:
          "Click the icon slot. The type picker opens with archetype chips and an icon search box.",
      },
    },
  },
  args: { code: EMPTY_CODE, selectedParticipant: "Alice" },
  render,
  play: async ({ canvasElement }) => {
    const ui = editor(canvasElement);
    await userEvent.click(await ui.findByRole("button", { name: "Set icon" }));
    await ui.findByRole("dialog", { name: "Participant type" });
  },
};

/** Board 3: the colour picker is open. */
export const PickingColor: Story = {
  name: "3 Picking colour",
  parameters: {
    docs: {
      description: {
        story:
          "Click the colour slot. The colour picker opens with preset swatches and a custom hex field.",
      },
    },
  },
  args: { code: EMPTY_CODE, selectedParticipant: "Alice" },
  render,
  play: async ({ canvasElement }) => {
    const ui = editor(canvasElement);
    await userEvent.click(
      await ui.findByRole("button", { name: "Set color (none)" }),
    );
    await ui.findByRole("dialog", { name: "Participant colour" });
  },
};

/** Board 4: every attribute filled, name input focused. */
export const EditingName: Story = {
  name: "4 Editing name",
  parameters: {
    docs: {
      description: {
        story: `All attributes are set: \`@Database <<Service>> Alice as "Alice Smith" #1d4ed8\`. The Name input has focus; type a new name and press Enter to rename Alice everywhere.`,
      },
    },
  },
  args: { code: FILLED_CODE, selectedParticipant: "Alice" },
  render,
  play: async ({ canvasElement }) => {
    const ui = editor(canvasElement);
    const input = await ui.findByRole("textbox", { name: "Name" });
    input.focus();
    await waitFor(() => expect(input).toHaveFocus());
  },
};

/** Board 5: hovering a filled slot reveals its clear button. */
export const Clear: Story = {
  name: "5 Clear",
  parameters: {
    docs: {
      description: {
        story:
          "Hover the filled icon slot. A red x appears beside it; clicking it (or pressing Delete) removes the type. The colour slot behaves the same way.",
      },
    },
  },
  args: { code: FILLED_CODE, selectedParticipant: "Alice" },
  render,
  play: async ({ canvasElement }) => {
    const ui = editor(canvasElement);
    await userEvent.hover(
      await ui.findByRole("button", { name: "Set icon (Database)" }),
    );
    await ui.findByRole("button", { name: "Remove type" });
  },
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
