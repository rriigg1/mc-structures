export type Block = {
  x: number
  y: number
  z: number
  paletteIndex: number
};

export type PaletteBlock = {
  name: string
  properties?: Record<string, string>
}

export type BlockElement = {
  from: [number, number, number]
  to: [number, number, number]
  rotation?: {
    origin: [number, number, number]
    axis: "x" | "y" | "z"
    angle: number
    rescale?: boolean
  }
  faces: Record<string, {
    texture: string
    uv?: [number, number, number, number]
    tintindex?: number
    rotation?: number
  }>
}