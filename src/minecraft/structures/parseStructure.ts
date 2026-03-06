
import { Block } from "../../types/Block"
import { read, NamedNbtTag } from "@webmc/nbt"

/**
 * Parses a Minecraft structure file (.nbt) in the browser
 */
export async function parseStructure(buffer: ArrayBuffer): Promise<Block[]> {

    const uint8Array = new Uint8Array(buffer);

    const namedTag: NamedNbtTag = await read(uint8Array).result;

    // The root tag has "value" which is the compound
    const root = namedTag.value as Record<string, any>

    const paletteList = root.palette.value.value as any[]
    const blocksList = root.blocks.value.value as any[]

    const blocks: Block[] = []

    for (const b of blocksList) {

        const pos = b.pos.value.value as [number, number, number]
        const state = b.state.value as number

        // palette entry
        const paletteEntry = paletteList[state]
        const blockName = paletteEntry.Name.value as string

        if (blockName === "minecraft:air") continue
        
        blocks.push({
        x: pos[0],
        y: pos[1],
        z: pos[2],
        block: blockName
        })
    }

    return blocks
}