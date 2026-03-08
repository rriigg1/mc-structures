
import { Block, PaletteBlock } from "../../types/Block"
import { read, NamedNbtTag } from "@webmc/nbt"

interface BlockEntry {
  pos: { value: { value: [number, number, number] } }
  state: { value: number }
}

interface PaletteEntry {
  Name: { value: string }
  Properties?: { value: Record<string, any> }
}

interface StructureRoot {
  palette: { value: { value: PaletteEntry[] } }
  blocks: { value: { value: BlockEntry[] } }
}

export async function parseStructure(buffer: ArrayBuffer): Promise<{
    blocks: Block[],
    palette: Record<number, PaletteBlock>
}> {
  const uint8Array = new Uint8Array(buffer)
  const namedTag: NamedNbtTag = read(uint8Array).result

  const root = namedTag.value as any as StructureRoot
  const paletteList = root.palette.value.value
  const blocksList = root.blocks.value.value

  const blocks: Block[] = []
  const paletteMap: Record<number, PaletteBlock> = {}

  for (const blockEntry of blocksList) {
    const [x, y, z] = blockEntry.pos.value.value
    const stateIndex = blockEntry.state.value

    const paletteEntry = paletteList[stateIndex]
    const blockName = paletteEntry.Name.value

    if (blockName === "minecraft:air") {
      continue
    }

    blocks.push({ x, y, z, paletteIndex: stateIndex })
    paletteMap[stateIndex] = {
      name: blockName,
      properties: paletteEntry.Properties
        ? Object.entries(paletteEntry.Properties.value).reduce((acc, [key, val]) => {
            acc[key] = val.value
            return acc
          }, {} as Record<string, string>)
        : undefined
    }
  }

  return { blocks, palette: paletteMap }
}