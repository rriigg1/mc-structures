import { useContext, useMemo } from "react"
import * as THREE from "three"
import InstancedBlocks from "./instancing/InstancedBlocks"
import { Block } from "../types/Block"
import { ResourcePackContext } from "../app/providers/ResourcePackProvider"
import { groupBlocks } from "../minecraft/blocks/groupBlocks"
import { resolveTexture } from "../minecraft/resourcepack/textureResolver"

type Props = {
  blocks: Block[]
}

export default function StructureRenderer({ blocks }: Props) {
  const groups = groupBlocks(blocks)
  const textures = useContext(ResourcePackContext)

  const textureMap = useMemo(() => {
    if (!textures) return {}

    const loader = new THREE.TextureLoader()
    const map: Record<string, THREE.Texture> = {}

    Object.keys(groups).forEach((blockName) => {
        const url = resolveTexture(blockName, textures)
        const tex = loader.load(url)
        tex.magFilter = THREE.NearestFilter
        tex.minFilter = THREE.NearestFilter
        map[blockName] = tex
    })

    return map
    }, [textures, groups])

  return (
    <>
      {Object.entries(groups).map(([blockName, groupBlocks]) => {
        if (!textures) return null

        const texture = textureMap[blockName];
        if (!texture) return null

        return (
          <InstancedBlocks
            key={blockName}
            blocks={groupBlocks}
            texture={texture}
          />
        )
      })}
    </>
  )
}