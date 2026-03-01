import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useRef } from 'react'
import ZenUml from '../../core'

const ZenUmlWrapper = ({
  code,
  theme = 'default',
}: {
  code: string
  theme?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const zenUmlRef = useRef<ZenUml | null>(null)

  useEffect(() => {
    if (containerRef.current && !zenUmlRef.current) {
      zenUmlRef.current = new ZenUml(containerRef.current)
    }
  }, [])

  useEffect(() => {
    if (zenUmlRef.current) {
      zenUmlRef.current.render(code, { theme, mode: 'Static' as any })
    }
  }, [code, theme])

  return <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
}

const meta: Meta<typeof ZenUmlWrapper> = {
  title: 'ZenUML/Getting Started',
  component: ZenUmlWrapper,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    code: { control: 'text' },
    theme: {
      control: 'select',
      options: ['default', 'blue', 'black-white', 'star-uml', 'blue-river'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const SimpleSequence: Story = {
  args: {
    code: `Alice -> Bob: Hello Bob
Bob -> Alice: Hello Alice
Alice -> Bob: How are you?
Bob -> Alice: I'm fine, thank you!`,
    theme: 'default',
  },
}

export const ComplexInteraction: Story = {
  args: {
    code: `@Actor Client #FFAAAA
@Database Database #FFFFAA
@Boundary WebServer #AAFFAA

Client->WebServer.authenticate() {
  WebServer->Database.checkCredentials() {
    alt valid credentials {
      Database->WebServer: User data
      WebServer->Client: Login successful
    } else invalid credentials {
      Database->WebServer: Error
      WebServer->Client: Login failed
      opt retry {
        Client->WebServer: Retry login
      }
    }
  }
}`,
    theme: 'default',
  },
}
