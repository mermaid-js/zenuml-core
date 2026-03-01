import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useRef } from 'react'
import ZenUml from '../../core'

const sampleCode = `@Actor Client #FFAAAA
@Database Database #FFFFAA

Client -> Server: Request
Server -> Database.query() {
  Database -> Server: Result
}
Server -> Client: Response`

const ZenUmlWrapper = ({
  code,
  theme = 'default',
  enableScopedTheming = false,
  mode = 'Static' as any,
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
  title: 'ZenUML/Config',
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

export const Themes: Story = {
  args: {
    code: sampleCode,
    theme: 'default',
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

export const StickyWithOffset: StoryObj = {
  render: () => <StickyDemoWrapper code={longCode} stickyOffset={50} />,
  parameters: { layout: 'fullscreen' },
}

export const RenderMode: Story = {
  args: {
    code: sampleCode,
    mode: 'Dynamic',
    theme: 'default',
  },
}

export const ScopedTheming: Story = {
  args: {
    code: sampleCode,
    theme: 'blue',
    enableScopedTheming: true,
  },
}
