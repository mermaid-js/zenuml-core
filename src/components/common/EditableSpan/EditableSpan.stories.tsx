import type { Meta, StoryObj } from '@storybook/react'
import { EditableSpan } from './EditableSpan'
import { useState } from 'react'

const meta: Meta<typeof EditableSpan> = {
  title: 'Components/Common/EditableSpan',
  component: EditableSpan,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A pure, reusable inline-editable span component with no external dependencies. Supports double-click to edit, keyboard navigation (Enter/Tab to save, Escape to cancel), and hover hints.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minWidth: '300px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    text: {
      control: 'text',
      description: 'The displayed/editable text',
    },
    isEditable: {
      control: 'boolean',
      description: 'Whether editing is allowed',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    title: {
      control: 'text',
      description: 'Tooltip text',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Interactive wrapper to demonstrate state changes
const InteractiveEditableSpan = (props: { text: string; isEditable?: boolean }) => {
  const [value, setValue] = useState(props.text)
  const [lastAction, setLastAction] = useState<string>('')

  return (
    <div>
      <EditableSpan
        text={value}
        isEditable={props.isEditable}
        onSave={(newText) => {
          setValue(newText)
          setLastAction(`Saved: "${newText}"`)
        }}
      />
      {lastAction && (
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Last action: {lastAction}
        </p>
      )}
    </div>
  )
}

export const Default: Story = {
  render: () => <InteractiveEditableSpan text="Double-click to edit me" />,
}

export const Editable: Story = {
  render: () => <InteractiveEditableSpan text="Editable text" isEditable={true} />,
}

export const NonEditable: Story = {
  render: () => <InteractiveEditableSpan text="Read-only text" isEditable={false} />,
}

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Normal State</p>
        <p style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Hover to see hint, double-click to edit</p>
        <InteractiveEditableSpan text="Hover over me" />
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Non-Editable</p>
        <p style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Cannot be edited</p>
        <InteractiveEditableSpan text="Read-only" isEditable={false} />
      </div>
    </div>
  ),
}

export const KeyboardNavigation: Story = {
  render: () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666', textAlign: 'left' }}>
        <p><strong>Keyboard Controls:</strong></p>
        <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
          <li><strong>Double-click</strong> - Start editing</li>
          <li><strong>Enter / Tab</strong> - Save changes</li>
          <li><strong>Escape</strong> - Cancel and restore original text</li>
          <li><strong>Click outside</strong> - Save changes (blur)</li>
        </ul>
      </div>
      <InteractiveEditableSpan text="Try editing me!" />
    </div>
  ),
}

export const MultipleInstances: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '80px', fontSize: '14px' }}>Name:</span>
        <InteractiveEditableSpan text="Alice" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '80px', fontSize: '14px' }}>Method:</span>
        <InteractiveEditableSpan text="sendMessage()" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '80px', fontSize: '14px' }}>Return:</span>
        <InteractiveEditableSpan text="result" />
      </div>
    </div>
  ),
}

// Interactive wrapper to demonstrate ESC cancel behavior
const ESCDemoEditableSpan = (props: { text: string }) => {
  const [value, setValue] = useState(props.text)
  const [saveCount, setSaveCount] = useState(0)

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <EditableSpan
          text={value}
          onSave={(newText) => {
            setValue(newText)
            setSaveCount(prev => prev + 1)
          }}
        />
      </div>
      <div style={{ fontSize: '12px', color: '#666', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Current value:</strong> "{value}"
        </div>
        <div>
          <strong>Save count:</strong> {saveCount} (ESC should NOT increment this)
        </div>
      </div>
    </div>
  )
}

export const ESCCancelBehavior: Story = {
  render: () => (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Test ESC Cancel Behavior:</strong></p>
        <ol style={{ paddingLeft: '20px', margin: '10px 0' }}>
          <li>Double-click the text below to start editing</li>
          <li>Type some changes</li>
          <li>Press <strong>ESC</strong> to cancel - text should revert and save count should NOT change</li>
          <li>Try again and press <strong>Enter</strong> to save - text should update and save count should increment</li>
        </ol>
      </div>
      <ESCDemoEditableSpan text="Edit me and press ESC" />
    </div>
  ),
}
