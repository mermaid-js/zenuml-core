import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

// Simple demo component for Storybook that demonstrates StylePanel functionality
const StylePanelDemo = () => <div />

const meta: Meta<typeof StylePanelDemo> = {
  title: 'Components/StylePanel',
  component: StylePanelDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A floating style panel that allows toggling text styling (bold, italic, underline, strikethrough) for sequence diagram messages.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '40px', backgroundColor: '#f5f5f5', position: 'relative', minHeight: '200px' }}>
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          <p><strong>StylePanel Demo:</strong></p>
          <p>• Toggle bold (B), italic (I), underline (U), or strikethrough (S)</p>
          <p>• Panel shows floating UI with style buttons</p>
          <p>• Check browser console for code updates</p>
        </div>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    autoTrigger: {
      control: 'boolean',
      description: 'Automatically trigger the style panel on mount',
      defaultValue: false,
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const DefaultDemo = () => {
      const [isOpen, setIsOpen] = useState(false)
      const [existingStyles] = useState<string[]>([]) // No existing styles

      const btns = [
        { name: "bold", content: "B", class: "font-bold" },
        { name: "italic", content: "I", class: "italic" },
        { name: "underline", content: "U", class: "underline" },
        { name: "strikethrough", content: "S", class: "line-through" },
      ]

      const onToggleStyle = (style: string) => {
        console.log('Toggling style:', style)
        setIsOpen(false) // Close panel after clicking
      }

      return (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#007acc',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            Click to show StylePanel
          </div>

          {isOpen && (
            <div style={{
              position: 'absolute',
              top: '60px',
              left: '10px',
              zIndex: 1000,
              display: 'flex',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              padding: '4px'
            }}>
              {btns.map((btn) => (
                <div onClick={() => onToggleStyle(btn.class)} key={btn.name}>
                  <div
                    style={{
                      width: '24px',
                      margin: '0 4px',
                      padding: '4px 0',
                      borderRadius: '6px',
                      color: 'black',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: existingStyles.includes(btn.class) ? '#f3f4f6' : 'transparent',
                      fontWeight: btn.class === 'font-bold' ? 'bold' : 'normal',
                      fontStyle: btn.class === 'italic' ? 'italic' : 'normal',
                      textDecoration: btn.class === 'underline' ? 'underline' : btn.class === 'line-through' ? 'line-through' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = existingStyles.includes(btn.class) ? '#f3f4f6' : 'transparent'
                    }}
                  >
                    {btn.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <DefaultDemo />
  },
}

export const AutoTriggered: Story = {
  render: () => {
    const AutoTriggeredDemo = () => {
      const [isOpen, setIsOpen] = useState(true) // Start with panel open
      const [existingStyles] = useState<string[]>(['font-bold']) // Pre-select bold

      const btns = [
        { name: "bold", content: "B", class: "font-bold" },
        { name: "italic", content: "I", class: "italic" },
        { name: "underline", content: "U", class: "underline" },
        { name: "strikethrough", content: "S", class: "line-through" },
      ]

      const onToggleStyle = (style: string) => {
        console.log('Toggling style:', style)
        setIsOpen(false) // Close panel after clicking
      }

      return (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              userSelect: 'none',
              fontWeight: 'bold' // Show it's styled
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            Auto-triggered StylePanel (bold)
          </div>

          {isOpen && (
            <div style={{
              position: 'absolute',
              top: '60px',
              left: '10px',
              zIndex: 1000,
              display: 'flex',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              padding: '4px'
            }}>
              {btns.map((btn) => (
                <div onClick={() => onToggleStyle(btn.class)} key={btn.name}>
                  <div
                    style={{
                      width: '24px',
                      margin: '0 4px',
                      padding: '4px 0',
                      borderRadius: '6px',
                      color: 'black',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: existingStyles.includes(btn.class) ? '#f3f4f6' : 'transparent',
                      fontWeight: btn.class === 'font-bold' ? 'bold' : 'normal',
                      fontStyle: btn.class === 'italic' ? 'italic' : 'normal',
                      textDecoration: btn.class === 'underline' ? 'underline' : btn.class === 'line-through' ? 'line-through' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = existingStyles.includes(btn.class) ? '#f3f4f6' : 'transparent'
                    }}
                  >
                    {btn.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <AutoTriggeredDemo />
  },
  parameters: {
    docs: {
      description: {
        story: 'StylePanel automatically shown on story load to demonstrate the floating panel appearance and functionality. The bold style is pre-selected.',
      },
    },
  },
}

export const WithExistingStyles: Story = {
  render: () => {
    const ExistingStylesDemo = () => {
      const [isOpen, setIsOpen] = useState(true) // Start open to show existing styles
      const [existingStyles] = useState(['font-bold', 'italic']) // Pre-populate with styles

      const btns = [
        { name: "bold", content: "B", class: "font-bold" },
        { name: "italic", content: "I", class: "italic" },
        { name: "underline", content: "U", class: "underline" },
        { name: "strikethrough", content: "S", class: "line-through" },
      ]

      const onToggleStyle = (style: string) => {
        console.log('Toggling style:', style)
      }

      return (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              userSelect: 'none',
              fontWeight: 'bold',
              fontStyle: 'italic'
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            Styled Message (bold + italic)
          </div>

          {isOpen && (
            <div style={{
              position: 'absolute',
              top: '60px',
              left: '10px',
              zIndex: 1000,
              display: 'flex',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              padding: '4px'
            }}>
              {btns.map((btn) => (
                <div onClick={() => onToggleStyle(btn.class)} key={btn.name}>
                  <div
                    style={{
                      width: '24px',
                      margin: '0 4px',
                      padding: '4px 0',
                      borderRadius: '6px',
                      color: 'black',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: existingStyles.includes(btn.class) ? '#f3f4f6' : 'transparent',
                      fontWeight: btn.class === 'font-bold' ? 'bold' : 'normal',
                      fontStyle: btn.class === 'italic' ? 'italic' : 'normal',
                      textDecoration: btn.class === 'underline' ? 'underline' : btn.class === 'line-through' ? 'line-through' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = existingStyles.includes(btn.class) ? '#f3f4f6' : 'transparent'
                    }}
                  >
                    {btn.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <ExistingStylesDemo />
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the StylePanel when a message already has existing styles applied. Active styles (bold and italic) are highlighted in gray.',
      },
    },
  },
}

export const Interactive: Story = {
  render: () => {
    const InteractiveDemo = () => {
      const [isOpen, setIsOpen] = useState(false)
      const [existingStyles, setExistingStyles] = useState<string[]>([])

      const btns = [
        { name: "bold", content: "B", class: "font-bold" },
        { name: "italic", content: "I", class: "italic" },
        { name: "underline", content: "U", class: "underline" },
        { name: "strikethrough", content: "S", class: "line-through" },
      ]

      const onToggleStyle = (style: string) => {
        const newStyles = existingStyles.includes(style)
          ? existingStyles.filter(s => s !== style)
          : [...existingStyles, style]

        setExistingStyles(newStyles)
        console.log('Styles updated:', newStyles)
      }

      return (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '12px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              userSelect: 'none',
              margin: '10px',
              border: '2px dashed #007acc'
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            Bob {'->'} Alice: Style me!
          </div>

          {isOpen && (
            <div style={{
              position: 'absolute',
              top: '60px',
              left: '10px',
              zIndex: 1000,
              display: 'flex',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              padding: '4px'
            }}>
              {btns.map((btn) => (
                <div onClick={() => onToggleStyle(btn.class)} key={btn.name}>
                  <div
                    style={{
                      width: '24px',
                      margin: '0 4px',
                      padding: '4px 0',
                      borderRadius: '6px',
                      color: 'black',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: existingStyles.includes(btn.class) ? '#f3f4f6' : 'transparent',
                      fontWeight: btn.class === 'font-bold' ? 'bold' : 'normal',
                      fontStyle: btn.class === 'italic' ? 'italic' : 'normal',
                      textDecoration: btn.class === 'underline' ? 'underline' : btn.class === 'line-through' ? 'line-through' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = existingStyles.includes(btn.class) ? '#f3f4f6' : 'transparent'
                    }}
                  >
                    {btn.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <InteractiveDemo />
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive StylePanel demo. Click the message to open the panel and experiment with different styling options. Styles persist as you toggle them.',
      },
    },
  },
}