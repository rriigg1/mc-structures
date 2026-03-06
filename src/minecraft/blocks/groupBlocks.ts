import { Block } from "../../types/Block"

export function groupBlocks(blocks: Block[]) {

  const groups: Record<string, Block[]> = {}

  for (const block of blocks) {

    if (!groups[block.block]) {
      groups[block.block] = []
    }

    groups[block.block].push(block)
  }

  return groups
}