import { useContext, useEffect, useMemo, useRef } from "react"
import InstancedBlocks from "./instancing/InstancedBlocks"
import { Block, PaletteBlock } from "../types/Block"
import { ResourcePackContext } from "../app/providers/ResourcePackProvider"
import { groupBlocks } from "../minecraft/blocks/groupBlocks"
import { useThree } from "@react-three/fiber"

type Props = {
  blocks: Block[]
  palette?: Record<number, PaletteBlock>
}

export default function StructureRenderer({ blocks, palette }: Props) {
  const groups = groupBlocks(blocks)
  const resourcePack = useContext(ResourcePackContext)
  const { gl } = useThree()
  const shadowUpdateTimeout = useRef<NodeJS.Timeout | null>(null)
  const pendingFrameId = useRef<number | null>(null)

  useEffect(() => {
    // Only update shadows if we have both palette and resource pack loaded
    if (!palette || !resourcePack) {
      return
    }

    // Cancel any pending shadow updates
    if (shadowUpdateTimeout.current) {
      clearTimeout(shadowUpdateTimeout.current)
    }

    // Debounce with a small delay to catch rapid updates, then defer to next fram
    shadowUpdateTimeout.current = setTimeout(() => {
      requestAnimationFrame(() => {
        gl.shadowMap.needsUpdate = true;
      })
    }, 50)

    return () => {
      if (shadowUpdateTimeout.current) {
        clearTimeout(shadowUpdateTimeout.current)
      }
    }
  }, [gl, palette, resourcePack, blocks.length])

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