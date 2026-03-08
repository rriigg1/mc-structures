export type BlockStates = {
    variants?: Record<string, {model: string | string[], x: number, y: number, uvlock: boolean}>
    multipart?: {
        apply: {model: string | string[], x: number, y: number, uvlock: boolean},
        when?: Record<string, string>
    }[]
}

export type ResourceBlock = {
  name: string
  blockStates: BlockStates
  models: Record<string, any>
}