import { Block } from "../../types/Block"

export function groupBlocks(blocks: Block[]) {

  const groups: Record<number, Block[]> = {}

  for (const block of blocks) {

    if (!groups[block.paletteIndex]) {
      groups[block.paletteIndex] = []
    }

    groups[block.paletteIndex].push(block)
  }

  return groups
}