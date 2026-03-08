/// <reference types="vite/client" />
import './App.css'
import { Scene } from '../renderer/Scene'
import { ResourcePackProvider } from './providers/ResourcePackProvider'
import StructureRenderer from '../renderer/StructureRenderer'
import { Block, PaletteBlock } from '../types/Block'
import { useEffect, useState } from 'react'
import { parseStructure } from '../minecraft/structures/parseStructure'
import StructureUpload from '../components/StructureUpload'

export default function App() {
  const [blocks,setBlocks] = useState<Block[]>([])
  const [palette, setPalette] = useState<Record<number, PaletteBlock>>({})

  useEffect(() => {
    async function loadDefault() {
      const response = await fetch(import.meta.env.BASE_URL + "default_structure.nbt")
      const arrayBuffer = await response.arrayBuffer()
      await loadStructure(arrayBuffer)
    }

    loadDefault()
  }, [])


  async function loadStructure(buffer: ArrayBuffer){
    const { blocks: parsedBlocks, palette: parsedPalette } = await parseStructure(buffer)
    setBlocks(parsedBlocks)
    setPalette(parsedPalette)
  }

  return (
    <ResourcePackProvider>
      <StructureUpload onLoad={loadStructure} />
      <Scene>
        <StructureRenderer blocks={blocks} palette={palette} />
      </Scene>
    </ResourcePackProvider>
  )
}
