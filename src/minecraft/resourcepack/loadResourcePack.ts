import JSZip from "jszip"
import { ResourceBlock } from "../../types/ResourceBlock"
import { mod } from "three/tsl"



const TEXTURE_PATH = "assets/minecraft/textures/"
const MODEL_PATH = "assets/minecraft/models/"
const BLOCKSTATE_PATH = "assets/minecraft/blockstates/"

async function extractTextures(
  zip: JSZip,
  textures: Record<string, string>
): Promise<void> {
  for (const path of Object.keys(zip.files)) {
    if (!path.startsWith(`${TEXTURE_PATH}block/`) || !path.endsWith(".png")) {
      continue
    }

    const name = path.replace(TEXTURE_PATH, "").replace(".png", "")
    const file = zip.files[path]
    const imgBlob = await file.async("blob")
    textures[name] = URL.createObjectURL(imgBlob)
  }
}

function mergeParentModels(
  model: Record<string, any>,
  models: Record<string, any>,
  blockName: string
): void {
  while (model.parent) {
    const parentName = model.parent.replace("minecraft:", "")
    const parent = models[parentName]

    if (!parent) {
      console.warn(`Parent model ${parentName} not found for ${blockName}`)
      break
    }

    model.textures = { ...parent.textures, ...model.textures }
    model.elements = { ...parent.elements, ...model.elements }
    model.parent = parent.parent
  }
}

function resolveTextureReference(
  textureValue: string,
  modelTextures: Record<string, string>
): string {
  let resolved = textureValue

  let resolveChain = new Set<string>();
  resolveChain.add(textureValue);


  while (resolved.startsWith("#")) {
    const referencedKey = resolved.slice(1)

    if (modelTextures[referencedKey]) {
      resolved = modelTextures[referencedKey]
      if (resolveChain.has(resolved)) {
        console.warn(`Circular texture reference detected for ${textureValue} via ${resolved}`)
        return resolved
      } else {
        resolveChain.add(resolved)
      }
    } else {
      return resolved // return the current value if the reference cannot be resolved
    }
  }

  return resolved.replace("minecraft:", "")
}

async function extractModels(
  zip: JSZip,
  models: Record<string, any>
): Promise<void> {
  for (const path of Object.keys(zip.files)) {
    if (!path.startsWith(`${MODEL_PATH}block/`) || !path.endsWith(".json")) {
      continue
    }

    const name = path.replace(MODEL_PATH, "").replace(".json", "") ?? ""
    const file = zip.files[path]
    const model = JSON.parse(await file.async("text"))

    models[name] = model
  }
}

function resolveModelReferences(models: Record<string, any>): void {
  for (const [name, model] of Object.entries(models)) {
    mergeParentModels(model, models, name)

    if (model.textures) {
      for (const [key, value] of Object.entries(model.textures)) {
        if (typeof value === "string") {
          model.textures[key] = resolveTextureReference(value, model.textures)
          //if (model.textures[key].startsWith("#")) {
          //  console.warn(`Texture reference ${value} could not be resolved in model ${name}`)
          //}
        }
      }
    }
  }
}

async function extractBlockStates(
  zip: JSZip,
  blocks: ResourceBlock[]
): Promise<void> {
  for (const path of Object.keys(zip.files)) {
    if (!path.startsWith(BLOCKSTATE_PATH) || !path.endsWith(".json")) {
      continue
    }

    const name = path.replace(BLOCKSTATE_PATH, "").replace(".json", "") ?? ""
    const file = zip.files[path]
    const json = JSON.parse(await file.async("text"))

    blocks.push({
      name,
      blockStates: json,
      models: {}
    })
  }
}

function linkModelsToBlocks(
  blocks: ResourceBlock[],
  models: Record<string, any>
): void {
  for (const block of blocks) {
    if (block.blockStates.variants) {
      for (const [variant, data] of Object.entries(block.blockStates.variants)) {
        if (typeof data.model === "string") {
          const modelName = data.model.replace("minecraft:", "")
          block.models[modelName] = models[modelName]
        } else if (Array.isArray(data)) {
          const modelName = data[0].model.replace("minecraft:", "")
          block.models[modelName] = models[modelName]
        }
      }
    } else if (block.blockStates.multipart) {
      for (const part of block.blockStates.multipart) {
        // The apply can contain either a single model reference or an array of them

        const model = Array.isArray(part.apply) ? part.apply[0].model : part.apply.model;

        if (!model) {
          console.warn(`Multipart block ${block.name} has a part without a model reference`)
          continue
        }

        const modelName = model.replace("minecraft:", "")
        block.models[modelName] = models[modelName]
      }
    } else {
      console.warn(`Block ${block.name} has unsupported block state format`)
    }
  }
}

export async function loadResourcePack(url: string): Promise<{
  textures: Record<string, string>
  blockMap: Record<string, ResourceBlock>
}> {
  const response = await fetch(url)
  const blob = await response.blob()
  const zip = await JSZip.loadAsync(blob)

  const textures: Record<string, string> = {}
  const models: Record<string, any> = {}
  const blocks: ResourceBlock[] = []

  console.log("Extracting resource pack...")
  await extractTextures(zip, textures)
  console.log(`Extracted ${Object.keys(textures).length} textures`)
  await extractModels(zip, models)
  console.log(`Extracted ${Object.keys(models).length} models`)
  resolveModelReferences(models)
  console.log("Resolved model references")
  await extractBlockStates(zip, blocks)
  console.log(`Extracted ${blocks.length} block states`)

  linkModelsToBlocks(blocks, models)
  console.log("Linked models to blocks")

  // turn blocks into a map for easier access
  const blockMap: Record<string, ResourceBlock> = {}
  for (const block of blocks) {
    blockMap[block.name] = block
  }

  console.log("Resource pack loaded:", {
    textures: Object.keys(textures).length,
    models: Object.keys(models).length,
    blocks: blocks.length
  })

  console.debug(blockMap)

  return { textures, blockMap }
}

