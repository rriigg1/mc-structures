export type TextureMap = Record<string, string>

export function resolveTexture(
  blockName: string,
  textures: TextureMap
): string {
  const simpleName = blockName.includes(":")
    ? blockName.split(":")[1]
    : blockName

  if (textures[simpleName]) return textures[simpleName]

  if (textures["missing_texture"]) return textures["missing_texture"]

  return ""
}