import { BlockPalette, PaletteProvider } from "./PaletteProvider";
import { Block, PaletteBlock } from "../types/Block";
import { getEmptyStructure } from "./GenerationUtils";
import { Dimensions } from "../types/RandomGeneration";

export type FrameBuilderProperties = {
    offset: {x: number, y: number, z: number},
    dimensions: Dimensions,
    xSubdivisions: number[],
    zSubdivisions: number[],
    wallPalette: BlockPalette,
    pillarPalette?: BlockPalette,
    bottomFrame?: boolean,
    topFrame?: boolean
}

const AIR_INDEX = 0
const PILLAR_INDEX = 1
const BEAM_INDEX_X = 2
const BEAM_INDEX_Z = 3
const WALL_INDEX = 4

export function buildFrame(properties: FrameBuilderProperties): {blocks: Block[], palette: Record<number, PaletteBlock>} {
    const structure = getEmptyStructure(properties.dimensions)
    
    // Generate pillars
    for (let y = 0; y < properties.dimensions.height; y++) {
        structure[0][y][0] = properties.pillarPalette ? PILLAR_INDEX : WALL_INDEX

        for (let i = 0; i < properties.xSubdivisions.length; i++) {
            structure[properties.xSubdivisions.slice(0, i+1).reduce((a, b) => a + b - 1, 0)][y][0] =  properties.pillarPalette ? PILLAR_INDEX : WALL_INDEX
            structure[properties.xSubdivisions.slice(0, i+1).reduce((a, b) => a + b - 1, 0)][y][properties.dimensions.depth - 1] =  properties.pillarPalette ? PILLAR_INDEX : WALL_INDEX
        }
        for (let i = 0; i < properties.zSubdivisions.length; i++) {
            structure[0][y][properties.zSubdivisions.slice(0, i+1).reduce((a, b) => a + b - 1, 0)] =  properties.pillarPalette ? PILLAR_INDEX : WALL_INDEX
            structure[properties.dimensions.width - 1][y][properties.zSubdivisions.slice(0, i+1).reduce((a, b) => a + b - 1, 0)] =  properties.pillarPalette ? PILLAR_INDEX : WALL_INDEX
        }
    }

    // Generate beams on the top and bottom if needed
    if (properties.bottomFrame) {
        for (let x = 1; x < properties.dimensions.width - 1; x++) {
            if (structure[x][0][0] === AIR_INDEX) {
                structure[x][0][0] =  properties.pillarPalette ? BEAM_INDEX_X : WALL_INDEX
            }
            if (structure[x][0][properties.dimensions.depth - 1] === AIR_INDEX) {
                structure[x][0][properties.dimensions.depth - 1] = properties.pillarPalette ? BEAM_INDEX_X : WALL_INDEX
            }
        }

        for (let z = 1; z < properties.dimensions.depth - 1; z++) {
            if (structure[0][0][z] === AIR_INDEX) {
                structure[0][0][z] = properties.pillarPalette ? BEAM_INDEX_Z : WALL_INDEX
            }
            if (structure[properties.dimensions.width - 1][0][z] === AIR_INDEX) {
                structure[properties.dimensions.width - 1][0][z] = properties.pillarPalette ? BEAM_INDEX_Z : WALL_INDEX
            }
        }
    }

    if (properties.topFrame) {
        for (let x = 1; x < properties.dimensions.width - 1; x++) {
            if (structure[x][properties.dimensions.height - 1][0] === AIR_INDEX
                || structure[x][properties.dimensions.height - 1][0] === PILLAR_INDEX) {
                structure[x][properties.dimensions.height - 1][0] = properties.pillarPalette ? BEAM_INDEX_X : WALL_INDEX
            }
            if (structure[x][properties.dimensions.height - 1][properties.dimensions.depth - 1] === AIR_INDEX
                || structure[x][properties.dimensions.height - 1][properties.dimensions.depth - 1] === PILLAR_INDEX) {
                structure[x][properties.dimensions.height - 1][properties.dimensions.depth - 1] = properties.pillarPalette ? BEAM_INDEX_X : WALL_INDEX
            }
        }

        for (let z = 1; z < properties.dimensions.depth - 1; z++) {
            if (structure[0][properties.dimensions.height - 1][z] === AIR_INDEX
                || structure[0][properties.dimensions.height - 1][z] === PILLAR_INDEX) {
                structure[0][properties.dimensions.height - 1][z] = properties.pillarPalette ? BEAM_INDEX_Z : 1
            }
            if (structure[properties.dimensions.width - 1][properties.dimensions.height - 1][z] === AIR_INDEX
                || structure[properties.dimensions.width - 1][properties.dimensions.height - 1][z] === PILLAR_INDEX) {
                structure[properties.dimensions.width - 1][properties.dimensions.height - 1][z] = properties.pillarPalette ? BEAM_INDEX_Z : WALL_INDEX
            }
        }
    }

    // Fill walls with index 2
    for (let y = 0; y < properties.dimensions.height; y++) {
        for (let x = 0; x < properties.dimensions.width; x++) {
            structure[x][y][0] = structure[x][y][0] === AIR_INDEX ? WALL_INDEX : structure[x][y][0]
            structure[x][y][properties.dimensions.depth - 1] = structure[x][y][properties.dimensions.depth - 1] === AIR_INDEX ? WALL_INDEX : structure[x][y][properties.dimensions.depth - 1]
        }
        for (let z = 0; z < properties.dimensions.depth; z++) {
            structure[0][y][z] = structure[0][y][z] === AIR_INDEX ? WALL_INDEX : structure[0][y][z]
            structure[properties.dimensions.width - 1][y][z] = structure[properties.dimensions.width - 1][y][z] === AIR_INDEX ? WALL_INDEX : structure[properties.dimensions.width - 1][y][z]
        }
    }

    // The structure contains indices that indicate which palette to use so we need to get palettes for each index and then merge them
    // Afterwards we update the indices and convert the structure to a list of blocks
    const palette: Record<number, PaletteBlock> = {
        0: {name: "minecraft:air"}
    }

    let paletteIndex = 1

    if (properties.pillarPalette) {
        for (let entry of properties.pillarPalette.blocks) {
            palette[paletteIndex++] = {name: `minecraft:${entry.block}`, properties: {axis: "y"}}
            palette[paletteIndex++] = {name: `minecraft:${entry.block}`, properties: {axis: "x"}}
            palette[paletteIndex++] = {name: `minecraft:${entry.block}`, properties: {axis: "z"}}
        }
    }

    const wallIndexOffset = paletteIndex

    for (let entry of properties.wallPalette.blocks) {
        palette[paletteIndex++] = {name: `minecraft:${entry.block}`, properties: entry.state}
    }

    const blocks: Block[] = []
    for (let x = 0; x < properties.dimensions.width; x++) {
        for (let y = 0; y < properties.dimensions.height; y++) {
            for (let z = 0; z < properties.dimensions.depth; z++) {
                let blockIndex = structure[x][y][z]
                if (blockIndex === WALL_INDEX) {
                    blockIndex = properties.wallPalette.samplePalette().index + wallIndexOffset
                } else if (blockIndex === PILLAR_INDEX && properties.pillarPalette) {
                    blockIndex = properties.pillarPalette?.samplePalette().index * 3 + PILLAR_INDEX
                } else if (blockIndex === BEAM_INDEX_X && properties.pillarPalette) {
                    blockIndex = properties.pillarPalette?.samplePalette().index * 3 + 1 + PILLAR_INDEX
                } else if (blockIndex === BEAM_INDEX_Z && properties.pillarPalette) {
                    blockIndex = properties.pillarPalette?.samplePalette().index * 3 + 2 + PILLAR_INDEX
                }

                blocks.push({
                    x: x + properties.offset.x,
                    y: y + properties.offset.y,
                    z: z + properties.offset.z,
                    paletteIndex: blockIndex
                })
            }
        }
    }

    return { blocks: blocks, palette: palette }
}

export function buildGable() {

}