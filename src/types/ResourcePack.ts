import { ResourceBlock } from "./ResourceBlock"

export type ResourcePack = {
  textures: Record<string, string>
  blockMap: Record<string, ResourceBlock>
}