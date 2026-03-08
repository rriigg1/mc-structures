import { useContext, useMemo } from "react"
import InstancedBlocks from "./instancing/InstancedBlocks"
import { Block, PaletteBlock } from "../types/Block"
import { ResourcePackContext } from "../app/providers/ResourcePackProvider"
import { groupBlocks } from "../minecraft/blocks/groupBlocks"

type Props = {
  blocks: Block[]
  palette?: Record<number, PaletteBlock>
}

export default function StructureRenderer({ blocks, palette }: Props) {
  const groups = groupBlocks(blocks)
  const resourcePack = useContext(ResourcePackContext)

  const filteredGroups = useMemo(() => {
    const result: Record<number, Block[]> = {}
    for (const [paletteIndex, groupBlocks] of Object.entries(groups)) {
      const paletteEntry = palette ? palette[parseInt(paletteIndex)] : undefined
      if (paletteEntry) {
        result[parseInt(paletteIndex)] = groupBlocks
      }
    }
    return result
  }, [groups, palette])

  if (!palette) {
    return null
  }

  return (
    <>
      {Object.entries(filteredGroups).map(([paletteIndex, groupBlocks]) => {
        if (!resourcePack) return null

        return (
          <InstancedBlocks
            key={paletteIndex}
            blocks={groupBlocks}
            paletteBlock={palette[parseInt(paletteIndex)]}
          />
        )
      })}
    </>
  )
}