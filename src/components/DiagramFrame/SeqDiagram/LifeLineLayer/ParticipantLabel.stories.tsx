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
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced ParticipantLabel with single-click editing, hover hints, and improved focus styling.',
      },
    },
  },
  argTypes: {
    labelText: { 
      control: 'text',
      description: 'The participant label text'
    },
    assignee: { 
      control: 'text',
      description: 'Optional assignee (variable name)'
    },
    editable: { 
      control: 'boolean',
      description: 'Enable editing mode (Dynamic vs Static)',
      defaultValue: true,
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const { editable, ...participantProps } = args as any
    store.set(modeAtom, editable ? RenderMode.Dynamic : RenderMode.Static)
    return <ParticipantLabel {...participantProps} />
  },
  args: {
    labelText: 'Alice',
    labelPositions: [[0, 5]],
    editable: true,
  },
}

export const WithAssignee: Story = {
  render: (args) => {
    const { editable, ...participantProps } = args as any
    store.set(modeAtom, editable ? RenderMode.Dynamic : RenderMode.Static)
    return <ParticipantLabel {...participantProps} />
  },
  args: {
    labelText: 'WebServer',
    assignee: 'server',
    labelPositions: [[0, 9]],
    assigneePositions: [[0, 6]],
    editable: true,
  },
}

export const LongText: Story = {
  render: (args) => {
    const { editable, ...participantProps } = args as any
    store.set(modeAtom, editable ? RenderMode.Dynamic : RenderMode.Static)
    return <ParticipantLabel {...participantProps} />
  },
  args: {
    labelText: 'DatabaseConnectionPool',
    labelPositions: [[0, 22]],
    editable: true,
  },
}

export const SpecialCharacters: Story = {
  render: (args) => {
    const { editable, ...participantProps } = args as any
    store.set(modeAtom, editable ? RenderMode.Dynamic : RenderMode.Static)
    return <ParticipantLabel {...participantProps} />
  },
  args: {
    labelText: '"User Account"',
    labelPositions: [[0, 14]],
    editable: true,
  },
}

export const ImprovedEditingDemo: Story = {
  render: (args) => {
    const { editable, ...participantProps } = args as any
    store.set(modeAtom, editable ? RenderMode.Dynamic : RenderMode.Static)
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          <p><strong>✨ Enhanced Editing Experience:</strong></p>
          <p>• <strong>Single-click</strong> to edit (no more double-click!)</p>
          <p>• <strong>Hover</strong> to see visual hints</p>
          <p>• <strong>Clean focus</strong> styling without cursor-hiding ring</p>
          <p>• <strong>Press Enter/Escape</strong> to finish editing</p>
        </div>
        <ParticipantLabel {...participantProps} />
      </div>
    )
  },
  args: {
    labelText: 'UserService',
    assignee: 'service',
    labelPositions: [[0, 11]],
    assigneePositions: [[0, 7]],
    editable: true,
  },
}

export const EditableExample: Story = {
  render: (args) => {
    const { editable, ...participantProps } = args as any
    store.set(modeAtom, editable ? RenderMode.Dynamic : RenderMode.Static)
    return (
      <div>
        <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
          Double-click labels to edit when editable mode is enabled
        </p>
        <ParticipantLabel {...participantProps} />
      </div>
    )
  },
  args: {
    labelText: 'EditableParticipant',
    assignee: 'variable',
    labelPositions: [[0, 18]],
    assigneePositions: [[0, 8]],
    editable: true,
  },
}