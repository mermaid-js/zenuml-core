import type { StoryObj } from '@storybook/react-vite'
import { useEffect, useRef, useState } from 'react'
import ZenUml from '../../core'

const sampleCode = `Alice -> Bob: Hello
Bob -> Alice: Hi there!
Alice -> Bob: How are you?`

const PngExportDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const zenUmlRef = useRef<ZenUml | null>(null)
  const [pngUrl, setPngUrl] = useState<string | null>(null)

  useEffect(() => {
    if (containerRef.current && !zenUmlRef.current) {
      zenUmlRef.current = new ZenUml(containerRef.current)
      zenUmlRef.current.render(sampleCode, { mode: 'Static' as any })
    }
  }, [])

  const handleExport = async () => {
    if (zenUmlRef.current) {
      const dataUrl = await zenUmlRef.current.getPng()
      setPngUrl(dataUrl)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '10px' }}>PNG Export</h2>
      <p style={{ marginBottom: '16px', color: '#666' }}>
        Click the button to export the diagram as a PNG image using getPng().
      </p>
      <div ref={containerRef} style={{ width: '100%', marginBottom: '16px' }} />
      <button
        onClick={handleExport}
        style={{
          padding: '8px 16px',
          backgroundColor: '#4A90D9',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Export PNG
      </button>
      {pngUrl && (
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ marginBottom: '8px' }}>Exported PNG:</h3>
          <img src={pngUrl} alt="Exported diagram" style={{ border: '1px solid #ccc' }} />
        </div>
      )}
    </div>
  )
}

const SvgExportDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const zenUmlRef = useRef<ZenUml | null>(null)
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null)

  useEffect(() => {
    if (containerRef.current && !zenUmlRef.current) {
      zenUmlRef.current = new ZenUml(containerRef.current)
      zenUmlRef.current.render(sampleCode, { mode: 'Static' as any })
    }
  }, [])

  const handleExport = async () => {
    if (zenUmlRef.current) {
      const dataUrl = await zenUmlRef.current.getSvg()
      setSvgMarkup(dataUrl)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '10px' }}>SVG Export</h2>
      <p style={{ marginBottom: '16px', color: '#666' }}>
        Click the button to export the diagram as SVG using getSvg().
      </p>
      <div ref={containerRef} style={{ width: '100%', marginBottom: '16px' }} />
      <button
        onClick={handleExport}
        style={{
          padding: '8px 16px',
          backgroundColor: '#4A90D9',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Export SVG
      </button>
      {svgMarkup && (
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ marginBottom: '8px' }}>Exported SVG:</h3>
          <img src={svgMarkup} alt="Exported SVG diagram" style={{ border: '1px solid #ccc' }} />
        </div>
      )}
    </div>
  )
}

export default {
  title: 'ZenUML/Export',
  parameters: {
    layout: 'fullscreen',
  },
}

export const PNG: StoryObj = {
  render: () => <PngExportDemo />,
}

export const SVG: StoryObj = {
  render: () => <SvgExportDemo />,
}
