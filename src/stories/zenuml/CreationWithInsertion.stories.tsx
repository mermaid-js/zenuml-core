import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useRef } from 'react'
import ZenUml from '../../core'

// With message or divider insertion enabled, the first gap adds clearance
// above the first message. A created participant must move down with it:
// the «create» arrow meets the box at its vertical centre and the activation
// bar starts at the box bottom.
const CreationWithInsertion = ({
  code,
  enableMessageInsertion,
  enableDividerInsertion,
}: {
  code: string
  enableMessageInsertion: boolean
  enableDividerInsertion: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const zenUmlRef = useRef<ZenUml | null>(null)

  useEffect(() => {
    if (containerRef.current && !zenUmlRef.current) {
      zenUmlRef.current = new ZenUml(containerRef.current)
    }
  }, [])

  useEffect(() => {
    zenUmlRef.current?.render(code, {
      theme: 'theme-default',
      mode: 'dynamic' as any,
      enableMessageInsertion,
      enableDividerInsertion,
    })
  }, [code, enableMessageInsertion, enableDividerInsertion])

  return <div ref={containerRef} style={{ width: '100%', minHeight: '400px' }} />
}

const meta: Meta<typeof CreationWithInsertion> = {
  title: 'ZenUML/Creation with insertion controls',
  component: CreationWithInsertion,
  parameters: { layout: 'padded' },
  argTypes: {
    code: { control: 'text' },
    enableMessageInsertion: { control: 'boolean' },
    enableDividerInsertion: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const NewParticipantOnly: Story = {
  args: {
    code: 'new A',
    enableMessageInsertion: false,
    enableDividerInsertion: true,
  },
}

export const CreationAfterMessages: Story = {
  args: {
    code: `A
B
A->B.hello()
new C`,
    enableMessageInsertion: true,
    enableDividerInsertion: true,
  },
}

export const NestedCreations: Story = {
  args: {
    code: `Client -> Server: Connect
new Session
if(ready) {
  Server -> Session.process() {
    new Worker
  }
}`,
    enableMessageInsertion: true,
    enableDividerInsertion: true,
  },
}

export const InsertionOff: Story = {
  args: {
    code: 'new A',
    enableMessageInsertion: false,
    enableDividerInsertion: false,
  },
}
