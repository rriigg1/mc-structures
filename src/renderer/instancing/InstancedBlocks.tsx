import { useRef, useEffect, useContext, useMemo } from "react"
import * as THREE from "three"
import { Block, PaletteBlock, BlockElement, RenderElement, FaceName, FACE_DEFS } from "../../types/Block"
import { ResourcePackContext } from "../../app/providers/ResourcePackProvider"
import { ResourceBlock } from "../../types/ResourceBlock"
import { resolveTexture } from "../../minecraft/resourcepack/textureResolver"
import { buildElementGeometry } from "../geometryBuilder"



type InstancedBlocksProps = {
  blocks: Block[]
  paletteBlock: PaletteBlock
}

export default function InstancedBlocks({
  blocks,
  paletteBlock,
}: InstancedBlocksProps) {

  const refs = useRef(new Map<number, THREE.InstancedMesh>())
  const resourcePack = useContext(ResourcePackContext)

  const emptyTexture = useMemo(() => {
    return new THREE.TextureLoader().load("empty_texture.png", (data) => {
      data.magFilter = THREE.NearestFilter
      data.minFilter = THREE.NearestFilter
    });
  }, []);

  useEffect(() => {
    const matrix = new THREE.Matrix4()

    refs.current.forEach((mesh) => {
      blocks.forEach((block, i) => {
        matrix.setPosition(block.x, block.y, block.z)
        mesh.setMatrixAt(i, matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingBox()
      mesh.computeBoundingSphere()
    })
  }, [blocks])

  if (!resourcePack || !paletteBlock) {
    return null
  }

  const blockName = paletteBlock.name.replace("minecraft:", "")
  
  const resourceBlock = resourcePack.blockMap[blockName]
  if (!resourceBlock) {
    console.warn(`No resource block found for ${blockName}`)
    return null
  }

  const blockStates = determineBlockState(resourceBlock, paletteBlock)

  if (!blockStates || blockStates.length === 0) {
    console.warn(`No block states found for ${blockName} with properties ${JSON.stringify(paletteBlock.properties)}`)
    return null
  }

  const renderData = []

  for (let state of blockStates) {
    if (!state.model && (!Array.isArray(state) || !state[0].model)) {
      continue
    }

    if (Array.isArray(state)) {
      state = state[0]
    }

    if (!state.model) {
      console.warn(`State for block ${blockName} has no model reference`)
      continue
    }

    const modelName = state.model.replace("minecraft:", "")
    const model = resourceBlock.models[modelName]

    if (!model) {
      console.warn(`No model found for ${modelName} of block ${blockName}`)
      continue
    }

    const modelRotation: {x: number, y:number, z:number, uvlock: boolean} = {x: 0, y: 0, z: 0, uvlock: false}
    modelRotation.x = state.x ?? 0
    modelRotation.y = state.y ?? 0
    modelRotation.z = state.z ?? 0
    modelRotation.uvlock = state.uvlock ?? false;

    if (!model.elements) {
      console.warn(`Model ${modelName} for block ${blockName} has no elements`)
      continue
    }

    const elements: BlockElement[] = Object.values(model.elements)
    if (!elements || elements.length === 0) {
      console.warn(`Model ${modelName} for block ${blockName} has no elements`)
      continue
    }

    if (!model.textures) {
      console.warn(`Model ${modelName} for block ${blockName} has no texture mapping`)
      continue
    }

    for (const element of elements) {
      if (!element.faces) {
        console.warn(`Element in model ${modelName} for block ${blockName} has no faces`)
        continue
      }
      const renderElement: RenderElement = {
        pos: [element.from[0] / 16, element.from[1] / 16, element.from[2] / 16],
        size: [(element.to[0] - element.from[0]) / 16, (element.to[1] - element.from[1]) / 16, (element.to[2] - element.from[2]) / 16],
        rotation: element.rotation
          ? {
            origin: [element.rotation.origin[0] / 16, element.rotation.origin[1] / 16, element.rotation.origin[2] / 16],
            axis: element.rotation.axis,
            angle: element.rotation.angle,
            rescale: element.rotation.rescale
          }
          : undefined,
        textures: {
          "east": undefined,
          "west": undefined,
          "up": undefined,
          "down": undefined,
          "south": undefined,
          "north": undefined,
        },
        uvs: {
          "east": undefined,
          "west": undefined,
          "up": undefined,
          "down": undefined,
          "south": undefined,
          "north": undefined,
        },
        tinted: {
          "east": false,
          "west": false,
          "up": false,
          "down": false,
          "south": false,
          "north": false,
        },
        faceRotations: {
          "east": undefined,
          "west": undefined,
          "up": undefined,
          "down": undefined,
          "south": undefined,
          "north": undefined,
        },
        modelRotation
      }
      
      // Resolve textures for each face
      for (const [faceName, face] of Object.entries(element.faces)) {
        if (!face.texture) {
          console.warn(`Face ${faceName} in model ${modelName} for block ${blockName} has no texture`)
          continue
        } else {
          const textureRef = face.texture.replace("#", "")
          const textureName = model.textures[textureRef]
          if (!textureName) {
            console.warn(`No texture found for reference ${textureRef} in model ${modelName} for block ${blockName}`)
            continue
          }
          const url = resolveTexture(textureName, resourcePack.textures)
          if (!url) {
            console.warn(`No URL found for texture ${textureName} in block ${blockName}`)
            continue
          }
          renderElement.textures[faceName] = url
        }
        if (face.uv) {
          renderElement.uvs[faceName] = face.uv
        }
        if (face.tintindex != undefined) {
          renderElement.tinted[faceName] = true
        }

        renderElement.faceRotations[faceName] = face.rotation ?? 0
      }

      renderData.push(renderElement)
    }
  }

  return (
    <>
      {renderData.map((element: RenderElement, index: number) => {
        const textureMap = new Map<string, number>() // texture URL → materialIndex
        const materials: THREE.Material[] = []

        for (const faceName of Object.keys(FACE_DEFS) as FaceName[]) {
          const url = element.textures[faceName]
          if (!url) continue
          if (!textureMap.has(url)) {
            const texture = new THREE.TextureLoader().load(url)
            texture.magFilter = THREE.NearestFilter
            texture.minFilter = THREE.NearestFilter
            const mat = element.tinted[faceName]
            ? new THREE.MeshStandardMaterial({ map: texture, transparent: false, alphaTest: 0.5, color: 0x60bb30 })
            : new THREE.MeshStandardMaterial({ map: texture, transparent: false, alphaTest: 0.5 })
            materials.push(mat)
            textureMap.set(url, materials.length - 1)
          }
        }

        const geometry = buildElementGeometry(element, textureMap)

        return (
          <instancedMesh
              key={index}
              castShadow receiveShadow
              ref={(el) => el && refs.current.set(index, el)}
              args={[geometry, materials, blocks.length]}
          />
        )
      })}
    </>
  )
}

function determineBlockState(resourceBlock: ResourceBlock, paletteBlock: PaletteBlock): any[] {
  if (resourceBlock.blockStates.variants) {
    for (const [variant, data] of Object.entries(resourceBlock.blockStates.variants)) {
      if (variant === "") {
        return [data]
      }
      const variantProperties = variant.split(",").reduce((acc, pair) => {
        const [key, value] = pair.split("=")
        acc[key] = value
        return acc
      }, {} as Record<string, string>)
      if (matchesProperties(variantProperties, paletteBlock.properties)) {
        return [data]
      }
    }
  } else if (resourceBlock.blockStates.multipart) {
    const matches = []
    for (const part of resourceBlock.blockStates.multipart) {
      if (!part.when) {
        matches.push(part.apply)
      } else if (matchesProperties(part.when, paletteBlock.properties)) {
        matches.push(part.apply)
      }
    }
    return matches
  }
  return []
}

function matchesProperties(variantProperties: Record<string, string>, blockProperties?: Record<string, string>): boolean {
  if (!blockProperties) {
    return false
  }
  for (const [key, value] of Object.entries(variantProperties)) {
    if (blockProperties[key] !== value) {
      return false
    }
  }
  return true
}