import type { Meta, StoryObj } from '@storybook/react'
import { DiagramFrame } from './DiagramFrame'
import { Provider } from 'jotai'
import store, { codeAtom, modeAtom, RenderMode } from '../../store/Store'

const meta: Meta<typeof DiagramFrame> = {
  title: 'Components/DiagramFrame',
  component: DiagramFrame,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <div style={{ width: '100%', height: '600px' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    store.set(codeAtom, `Alice -> Bob: Hello Bob
Bob -> Alice: Hello Alice`)
    store.set(modeAtom, RenderMode.Static)
    return <DiagramFrame />
  },
}

export const ComplexSequence: Story = {
  render: () => {
    store.set(codeAtom, `@Actor Client #FFAAAA
@Database Database #FFFFAA
@Boundary WebServer #AAFFAA

Client->WebServer.doPost() {
  WebServer->Database.load() {
    alt success {
      Database->WebServer: Data
    } else {
      Database->WebServer: Error
    }
  }
  
  WebServer->Client: Response
}`)
    store.set(modeAtom, RenderMode.Static)
    return <DiagramFrame />
  },
}

export const WithFragments: Story = {
  render: () => {
    store.set(codeAtom, `Alice -> Bob: Authentication Request

alt successful case {
  Bob -> Alice: Authentication Accepted
} else failure case {
  Bob -> Alice: Authentication Failure
  opt {
    loop 1000 times {
      Alice -> Bob: DNS Attack
    }
  }
}

Alice -> Bob: Another authentication Request
Alice <- Bob: another authentication Response`)
    store.set(modeAtom, RenderMode.Static)
    return <DiagramFrame />
  },
}

export const AsyncMessages: Story = {
  render: () => {
    store.set(codeAtom, `A -> B: Sync message
A ->> B: Async message
B -->> A: Async response
B --> A: Sync response`)
    store.set(modeAtom, RenderMode.Static)
    return <DiagramFrame />
  },
}