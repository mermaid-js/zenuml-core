import type { Meta, StoryObj } from '@storybook/react'
import { ArrowHead } from './ArrowHead'

const meta: Meta<typeof ArrowHead> = {
  title: 'Components/ArrowHead',
  component: ArrowHead,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const AllVariations: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', textAlign: 'center' }}>
      <div>
        <p style={{ marginBottom: '10px', fontSize: '14px' }}>Filled (Sync) LTR</p>
        <ArrowHead fill={true} rtl={false} />
      </div>
      <div>
        <p style={{ marginBottom: '10px', fontSize: '14px' }}>Open (Async) LTR</p>
        <ArrowHead fill={false} rtl={false} />
      </div>
      <div>
        <p style={{ marginBottom: '10px', fontSize: '14px' }}>Filled (Sync) RTL</p>
        <ArrowHead fill={true} rtl={true} />
      </div>
      <div>
        <p style={{ marginBottom: '10px', fontSize: '14px' }}>Open (Async) RTL</p>
        <ArrowHead fill={false} rtl={true} />
      </div>
    </div>
  ),
}
