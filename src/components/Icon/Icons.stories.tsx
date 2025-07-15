import type { Meta, StoryObj } from '@storybook/react'
import Icon from './Icons'

const meta: Meta<typeof Icon> = {
  title: 'Components/Icons',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    name: {
      control: 'select',
      options: [
        'alt-fragment',
        'close',
        'collapse-expanded',
        'collapse-unexpanded',
        'critical-fragment',
        'debug',
        'loop-fragment',
        'non-selected-cycle',
        'numbering',
        'opt-fragment',
        'par-fragment',
        'privacy',
        'ref-fragment',
        'section-fragment',
        'selected-cycle',
        'theme',
        'tip',
        'try-catch-fragment',
        'zoom-in',
        'zoom-out',
      ],
    },
    className: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'close',
  },
}

export const AllIcons: Story = {
  render: () => {
    const iconNames = [
      'alt-fragment',
      'close',
      'collapse-expanded',
      'collapse-unexpanded',
      'critical-fragment',
      'debug',
      'loop-fragment',
      'non-selected-cycle',
      'numbering',
      'opt-fragment',
      'par-fragment',
      'privacy',
      'ref-fragment',
      'section-fragment',
      'selected-cycle',
      'theme',
      'tip',
      'try-catch-fragment',
      'zoom-in',
      'zoom-out',
    ]
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: '20px' }}>
        {iconNames.map((name) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Icon name={name as any} />
            <span style={{ fontSize: '12px', textAlign: 'center' }}>{name}</span>
          </div>
        ))}
      </div>
    )
  },
}