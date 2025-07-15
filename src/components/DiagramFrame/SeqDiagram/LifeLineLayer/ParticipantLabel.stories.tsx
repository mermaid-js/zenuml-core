import type { Meta, StoryObj } from '@storybook/react'
import { ParticipantLabel } from './ParticipantLabel'
import { Provider } from 'jotai'
import store, { modeAtom, RenderMode } from '../../../../store/Store'

const meta: Meta<typeof ParticipantLabel> = {
  title: 'Components/ParticipantLabel',
  component: ParticipantLabel,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
  argTypes: {
    labelText: { control: 'text' },
    assignee: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    store.set(modeAtom, RenderMode.Static)
    return <ParticipantLabel {...args} />
  },
  args: {
    labelText: 'Alice',
    labelPositions: [[0, 5]],
  },
}

export const WithAssignee: Story = {
  render: (args) => {
    store.set(modeAtom, RenderMode.Static)
    return <ParticipantLabel {...args} />
  },
  args: {
    labelText: 'WebServer',
    assignee: 'server',
    labelPositions: [[0, 9]],
    assigneePositions: [[0, 6]],
  },
}

export const LongText: Story = {
  render: (args) => {
    store.set(modeAtom, RenderMode.Static)
    return <ParticipantLabel {...args} />
  },
  args: {
    labelText: 'DatabaseConnectionPool',
    labelPositions: [[0, 22]],
  },
}

export const SpecialCharacters: Story = {
  render: (args) => {
    store.set(modeAtom, RenderMode.Static)
    return <ParticipantLabel {...args} />
  },
  args: {
    labelText: '"User Account"',
    labelPositions: [[0, 14]],
  },
}