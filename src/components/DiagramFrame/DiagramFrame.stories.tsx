import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramFrame } from './DiagramFrame'
import { createStore, Provider } from 'jotai'
import { codeAtom, modeAtom, RenderMode } from '../../store/Store'
import { useMemo } from 'react'
import '../../assets/tailwind.css'

const DiagramFrameWithCode = ({ code }: { code: string }) => {
  const store = useMemo(() => {
    const s = createStore()
    s.set(codeAtom, code)
    s.set(modeAtom, RenderMode.Static)
    return s
  }, [code])

  return (
    <Provider store={store}>
      <div className="zenuml" style={{ width: '100%', height: '600px' }}>
        <DiagramFrame />
      </div>
    </Provider>
  )
}

const meta: Meta<typeof DiagramFrameWithCode> = {
  title: 'Components/DiagramFrame',
  tags: ['autodocs'],
  component: DiagramFrameWithCode,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    code: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    code: `Alice -> Bob: Hello Bob
Bob -> Alice: Hello Alice`,
  },
}

export const ComplexSequence: Story = {
  args: {
    code: `@Actor Client #FFAAAA
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
}`,
  },
}

export const WithFragments: Story = {
  args: {
    code: `Alice -> Bob: Authentication Request

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
Alice <- Bob: another authentication Response`,
  },
}

export const AsyncMessages: Story = {
  args: {
    code: `A -> B: Sync message
A ->> B: Async message
B -->> A: Async response
B --> A: Sync response`,
  },
}
