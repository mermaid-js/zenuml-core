import type { Meta, StoryObj } from '@storybook/react'
import { ThemeSelector } from './ThemeSelector'
import { Provider } from 'jotai'
import store from '../../store/Store'

const meta: Meta<typeof ThemeSelector> = {
  title: 'Components/ThemeSelector',
  component: ThemeSelector,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ThemeSelector />,
}