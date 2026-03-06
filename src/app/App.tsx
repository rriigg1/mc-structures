import './App.css'
import { Scene } from '../renderer/Scene'
import { ResourcePackProvider } from './providers/ResourcePackProvider'
import StructureRenderer from '../renderer/StructureRenderer'
import { Block } from '../types/Block'
import { useState } from 'react'
import { parseStructure } from '../minecraft/structures/parseStructure'
import StructureUpload from '../components/StructureUpload'

export default function App() {
  const [blocks,setBlocks] = useState<Block[]>([
    { x: 0, y: 0, z: 0, block: "minecraft:stone" },
    { x: 1, y: 0, z: 0, block: "minecraft:stone" },
    { x: 0, y: 1, z: 0, block: "minecraft:stone" },
    { x: 1, y: 1, z: 0, block: "minecraft:stone" },])

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
