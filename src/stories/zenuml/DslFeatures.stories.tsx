import type { Meta, StoryObj } from '@storybook/react-vite'
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
  title: 'ZenUML/DSL Features',
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

export const AsyncMessaging: Story = {
  args: {
    code: `Frontend -> Backend: Sync request
Frontend ->> MessageQueue: Async message
MessageQueue ->> Worker: Process job
Worker -->> MessageQueue: Job completed
MessageQueue -->> Frontend: Notification
Backend --> Frontend: Response`,
    theme: 'blue',
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
  },
}

export const Participants: Story = {
  args: {
    code: `@Actor User #FFAAAA
@Boundary API #AAFFAA
@Control Service #AAAAFF
@Database DB #FFFFAA
@Entity Cache #FFAAFF

User -> API: Request
API -> Service: Process
Service -> DB: Query
DB -> Service: Result
Service -> Cache: Store
Cache -> Service: OK
Service -> API: Response
API -> User: Result`,
    theme: 'default',
  },
}

export const Creation: Story = {
  args: {
    code: `Client -> Server: Connect
new Session
Server -> Session: Initialize
Session -> Server: Ready
Server -> Client: Connected

Client -> Server: Request
Server -> Session.process() {
  Session -> Server: Done
}
Server -> Client: Response`,
    theme: 'default',
  },
}
