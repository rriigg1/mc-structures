import { useRef, useEffect, useContext } from "react"
import * as THREE from "three"
import { Block, PaletteBlock, BlockElement } from "../../types/Block"
import { ResourcePackContext } from "../../app/providers/ResourcePackProvider"
import { ResourceBlock } from "../../types/ResourceBlock"
import { resolveTexture } from "../../minecraft/resourcepack/textureResolver"

type RenderElement = {
  pos: [number, number, number]
  size: [number, number, number]
  rotation?: {
    origin: [number, number, number]
    axis: "x" | "y" | "z"
    angle: number
    rescale?: boolean
  }
  textures: Record<string, string | undefined>
  uvs: Record<string, [number, number, number, number] | undefined>
  modelRotation: {
    x?: number
    y?: number
    z?: number
  }
}

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

  useEffect(() => {
    const matrix = new THREE.Matrix4()

    refs.current.forEach((mesh) => {
      blocks.forEach((block, i) => {
        matrix.setPosition(block.x, block.y, block.z)
        mesh.setMatrixAt(i, matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
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

    const modelRotation: {x: number | undefined, y:number | undefined, z:number | undefined} = {x: undefined, y: undefined, z: undefined}
    modelRotation.x = state.x ?? 0
    modelRotation.y = state.y ?? 0
    modelRotation.z = state.z ?? 0

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
          "west": undefined,
          "east": undefined,
          "up": undefined,
          "down": undefined,
          "north": undefined,
          "south": undefined,
        },
        uvs: {
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
      }
      renderData.push(renderElement)
    }
  }

  return (
    <>
      {renderData.map((element: RenderElement, index: number) => {
        const textures = Object.values(element.textures)
            .map(tex => tex
              ? new THREE.TextureLoader().load(tex, (data) => {
                  data.magFilter = THREE.NearestFilter
                  data.minFilter = THREE.NearestFilter

                  if (data.height > data.width) {
                    data.repeat.set(1, data.width / data.height)
                  }
                })
              : null)
        
        const geometry = new THREE.BoxGeometry(element.size[0], element.size[1], element.size[2])
        geometry.translate(element.pos[0], element.pos[1], element.pos[2])
        // block and not element should be centered a 0
        geometry.translate(element.size[0] / 2, element.size[1] / 2, element.size[2] / 2)
        geometry.translate(-0.5, -0.5, -0.5)
        applyRotations(element, geometry)

        // adjust uvs
        const uvAttribute = geometry.attributes.uv
        let faceCounter = 0
        for (const [faceName, face] of Object.entries(element.uvs)) {
          if (!face) {
            faceCounter += 1
            continue
          }
          const [u1, v1, u2, v2] = face
        
          // Each face uses 4 vertices in the order: [0, 1, 2, 3]
          for (let i = 0; i < 4; i++) {
            const u = (i === 0 || i === 2) ? u1 : u2
            const v = (i === 0 || i === 1) ? v1 : v2
            uvAttribute.setXY(faceCounter * 4 + i, (u / 16), 1-(v / 16))
          }
          faceCounter += 1
        }

        const materials = textures.map(tex => new THREE.MeshStandardMaterial({ map: tex, transparent: true }))

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
        matches.push(part)
      } else if (matchesProperties(part.when, paletteBlock.properties)) {
        matches.push(part)
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


function applyRotations(element: RenderElement, geometry: THREE.BufferGeometry): void {
  if (element.rotation) {
    if (element.rotation.axis === "x") {
      geometry.rotateX(THREE.MathUtils.degToRad(element.rotation.angle))
    } else if (element.rotation.axis === "y") {
      geometry.rotateY(-THREE.MathUtils.degToRad(element.rotation.angle))
    } else if (element.rotation.axis === "z") {
      geometry.rotateZ(THREE.MathUtils.degToRad(element.rotation.angle))
    }
  }

  if (element.modelRotation) {
    geometry.rotateX(THREE.MathUtils.degToRad(element.modelRotation.x ?? 0))
    geometry.rotateY(THREE.MathUtils.degToRad(-(element.modelRotation.y ?? 0)))
  }
}