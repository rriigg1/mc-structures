import { SemanticMap, SemanticBlockType, SemanticBlock } from "../types/RandomGeneration"
import { GenerationResult } from "./GenerationUtils";
import { Vector3 } from "three";
import { BlockPalette } from "./PaletteProvider";
import { PaletteBlock } from "../types/Block";

export abstract class Texturer {
    semanticMap: SemanticMap
    generationResult: GenerationResult
    paletteMap: Map<PaletteBlock, number> = new Map()

    constructor(semanticMap: SemanticMap, generationResult: GenerationResult) {
        this.semanticMap = semanticMap
        this.generationResult = generationResult
        this.updatePaletteMap()
    }

    updatePaletteMap() {
        this.paletteMap.clear()
        for (const [index, paletteBlock] of Object.entries(this.generationResult.palette)) {
            this.paletteMap.set(paletteBlock, parseInt(index))
        }
    }

    abstract texture(palette: BlockPalette, texturePredicate: (block: SemanticBlock) => boolean): GenerationResult;

    textureType(palette: BlockPalette, type: SemanticBlockType): GenerationResult {
        return this.texture(palette, (block) => block.type === type);
    }

    textureGroup(palette: BlockPalette, group: string): GenerationResult {
        return this.texture(palette, (block) => block.groups?.includes(group) ?? false);
    }
}

export interface GenerationPropertiesBase {
    offset: Vector3;
    groups?: string[];
}

export type FloorGenerationProperties = GenerationPropertiesBase & {
    dimensions: {width: number, depth: number}
}

export function generateFloor(map: SemanticMap, properties: FloorGenerationProperties, blockProperties: Record<string, any> = {}): SemanticMap {
    for (let x = 0; x < properties.dimensions.width; x++) {
        for (let z = 0; z < properties.dimensions.depth; z++) {
            const pos = new Vector3(x + properties.offset.x, properties.offset.y, z + properties.offset.z)
            map.set(pos, {type: SemanticBlockType.FLOOR, groups: properties.groups ?? ["floor"], properties: blockProperties})
        }
    }
    return map
}

export type WallGenerationProperties = GenerationPropertiesBase & {
    axis: "x" | "z",
    dimensions: {length: number, height: number}
}

export function generateWall(map: SemanticMap, properties: WallGenerationProperties, blockProperties: Record<string, any> = {}): SemanticMap {
    for (let y = 0; y < properties.dimensions.height; y++) {
        for (let x = 0; x < properties.dimensions.length; x++) {
            const pos = properties.axis === "x"
            ? new Vector3(x + properties.offset.x, properties.offset.y + y, properties.offset.z)
            : new Vector3(properties.offset.x, properties.offset.y + y, x + properties.offset.z)
            map.set(pos, {type: SemanticBlockType.WALL, groups: properties.groups ?? ["wall"], properties: blockProperties})
        }
    }
    return map
}

export type BeamGenerationProperties = GenerationPropertiesBase & {
    axis: "x" | "z",
    dimensions: {length: number}
}

export function generateBeam(map: SemanticMap, properties: BeamGenerationProperties, blockProperties: Record<string, any> = {}): SemanticMap {
    if (Object.keys(blockProperties).length === 0) {
        blockProperties.axis = properties.axis
    }

    return generateWall(map, {
        offset: properties.offset,
        axis: properties.axis,
        dimensions: {length: properties.dimensions.length, height: 1},
        groups: properties.groups ?? ["beam"]
    }, blockProperties)
}

export type PillarGenerationProperties = GenerationPropertiesBase & {
    dimensions: {height: number}
}

export function generatePillar(map: SemanticMap, properties: PillarGenerationProperties, blockProperties: Record<string, any> = {axis: "y"}): SemanticMap {
    for (let y = 0; y < properties.dimensions.height; y++) {
        const pos = new Vector3(properties.offset.x, properties.offset.y + y, properties.offset.z)
        map.set(pos, {type: SemanticBlockType.PILLAR, groups: properties.groups ?? ["pillar"], properties: blockProperties})
    }
    return map
}