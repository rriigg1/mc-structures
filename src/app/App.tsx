/// <reference types="vite/client" />
import './App.css'
import { Scene } from '../renderer/Scene'
import { ResourcePackProvider } from './providers/ResourcePackProvider'
import StructureRenderer from '../renderer/StructureRenderer'
import { Block } from '../types/Block'
import { useEffect, useState } from 'react'
import { parseStructure } from '../minecraft/structures/parseStructure'
import StructureUpload from '../components/StructureUpload'

export default function App() {
  const [blocks,setBlocks] = useState<Block[]>([])

  useEffect(() => {
    async function loadDefault() {
      const response = await fetch(import.meta.env.BASE_URL + "default_structure.nbt")
      const arrayBuffer = await response.arrayBuffer()
      const parsedBlocks = await parseStructure(arrayBuffer)
      setBlocks(parsedBlocks)
    }

    loadDefault()
  }, [])


  async function loadStructure(buffer: ArrayBuffer){
    const parsedBlocks = await parseStructure(buffer)
    setBlocks(parsedBlocks)
  }

  return (
    <ResourcePackProvider>
      <StructureUpload onLoad={loadStructure} />
      <Scene>
        <StructureRenderer blocks={blocks} />
      </Scene>
    </ResourcePackProvider>
  )
}
