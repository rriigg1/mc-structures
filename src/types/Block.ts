import * as THREE from "three"

export type FaceName = "north" | "south" | "east" | "west" | "up" | "down"

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


export const FACE_DEFS: Record<FaceName, {
  dir: THREE.Vector3,
  corners: number[][]
}> = {
  north: { dir: new THREE.Vector3(0, 0, -1), corners: [[0,1,0],[1,1,0],[1,0,0],[0,0,0]] },
  south: { dir: new THREE.Vector3(0, 0, 1),  corners: [[1,1,1],[0,1,1],[0,0,1],[1,0,1]] },
  west:  { dir: new THREE.Vector3(-1,0,0),  corners: [[0,1,1],[0,1,0],[0,0,0],[0,0,1]] },
  east:  { dir: new THREE.Vector3(1,0,0),   corners: [[1,1,0],[1,1,1],[1,0,1],[1,0,0]] },
  up:    { dir: new THREE.Vector3(0,1,0),   corners: [[1,1,0],[0,1,0],[0,1,1],[1,1,1]] },
  down:  { dir: new THREE.Vector3(0,-1,0),  corners: [[1,0,1],[0,0,1],[0,0,0],[1,0,0]] },
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
  faces: Record<FaceName, {
    texture: string
    uv?: [number, number, number, number]
    tintindex?: number
    rotation?: number
  }>
}

export type RenderElement = {
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
  tinted: Record<string, boolean>
  faceRotations: Record<string, number | undefined>
  modelRotation: {
    x?: number
    y?: number
    z?: number
    uvlock?: boolean
  }
}