import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useRef } from 'react'
import ZenUml from './core'

const ZenUmlWrapper = ({
  code,
  theme = 'default',
  enableScopedTheming = false,
  mode = 'Dynamic' as any,
  stickyOffset,
}: {
  code: string
  theme?: string
  enableScopedTheming?: boolean
  mode?: 'Static' | 'Dynamic'
  stickyOffset?: number | false
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
      zenUmlRef.current.render(code, {
        theme,
        enableScopedTheming,
        mode: mode as any,
        stickyOffset,
      })
    }
  }, [code, theme, enableScopedTheming, mode, stickyOffset])

  return <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
}

const meta: Meta<typeof ZenUmlWrapper> = {
  title: 'ZenUML/Complete Integration',
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
    enableScopedTheming: { control: 'boolean' },
    mode: {
      control: 'select',
      options: ['Static', 'Dynamic'],
    },
    stickyOffset: {
      control: 'select',
      options: [0, 50, false],
      description: 'Sticky offset in pixels, or false to disable sticky participants',
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
    enableScopedTheming: false,
    mode: 'Static',
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
    enableScopedTheming: false,
    mode: 'Static',
  },
}

export const AsyncMessaging: Story = {
  args: {
    code: `Frontend -> Backend: Sync request
Frontend ->> MessageQueue: Async message
MessageQueue ->> Worker: Process job
Worker -->> MessageQueue: Job completed
MessageQueue -->> Frontend: Notification
Backend --> Frontend: Response`,
    theme: 'blue',
    enableScopedTheming: false,
    mode: 'Static',
  },
}

export const NestedFragments: Story = {
  args: {
    code: `User -> System: Login request

alt authentication {
  System -> Database: Validate credentials

  alt valid {
    Database -> System: Success

    opt remember me {
      System -> CacheService: Store session
      CacheService -> System: Cached
    }

    System -> User: Login successful
  } else invalid {
    Database -> System: Failure
    System -> User: Login failed

    critical rate limiting {
      System -> RateLimiter: Check attempts

      alt too many attempts {
        RateLimiter -> System: Block user
        System -> User: Account locked
      } else within limits {
        RateLimiter -> System: Allow retry
      }
    }
  }
}`,
    theme: 'default',
    enableScopedTheming: false,
    mode: 'Static',
  },
}

const longCode = Array.from({ length: 30 }, (_, i) =>
  i % 2 === 0
    ? `Alice -> Bob: Request ${i + 1}`
    : `Bob -> Alice: Response ${i + 1}`
).join('\n')

const StickyDemoWrapper = ({
  code,
  stickyOffset,
}: {
  code: string
  stickyOffset?: number | false
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
      zenUmlRef.current.render(code, { stickyOffset })
    }
  }, [code, stickyOffset])

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '10px' }}>
        stickyOffset: {String(stickyOffset)} — Scroll down to see the effect
      </h2>
      <div ref={containerRef} style={{ width: '100%' }} />
    </div>
  )
}

export const StickyEnabled: StoryObj = {
  render: () => <StickyDemoWrapper code={longCode} stickyOffset={0} />,
  parameters: { layout: 'fullscreen' },
}

export const StickyDisabled: StoryObj = {
  render: () => <StickyDemoWrapper code={longCode} stickyOffset={false} />,
  parameters: { layout: 'fullscreen' },
}