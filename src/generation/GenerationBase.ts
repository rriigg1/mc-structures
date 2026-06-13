import { SemanticMap, SemanticBlockType, SemanticBlock } from "../types/RandomGeneration"
import { GenerationResult } from "./GenerationUtils";
import { Vector3 } from "three";
import { BlockPalette } from "./PaletteProvider";
import { PaletteBlock } from "../types/Block";

class PaletteMap {
    map: Map<string, number> = new Map()

    private key(block: PaletteBlock): string {
        if (block.properties) {
            const propString = Object.keys(block.properties)
                .sort()
                .map(k => `${k}=${block.properties? block.properties[k] : null}`)
                .join(",")
            return `${block.name}[${propString}]`
        } else {
            return `${block.name}`
        }
    }

    set(block: PaletteBlock, value: number): void {
        this.map.set(this.key(block), value);
    }

    get(block: PaletteBlock): number | undefined {
        return this.map.get(this.key(block));
    }

    has(block: PaletteBlock): boolean {
        return this.map.has(this.key(block))
    }

    clear() {
        this.map.clear()
    }
}

export abstract class Texturer {
    semanticMap: SemanticMap
    generationResult: GenerationResult
    paletteMap: PaletteMap = new PaletteMap()

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

    abstract texture(palette: BlockPalette, texturePredicate: (block: SemanticBlock) => boolean): Texturer;

    textureType(palette: BlockPalette, type: SemanticBlockType): Texturer {
        return this.texture(palette, (block) => block.type === type);
    }

    textureGroup(palette: BlockPalette, group: string): Texturer {
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

    for (let x = 0; x < properties.dimensions.length; x++) {
        const pos = properties.axis === "x"
                ? new Vector3(x + properties.offset.x, properties.offset.y, properties.offset.z)
                : new Vector3(properties.offset.x, properties.offset.y, x + properties.offset.z)
        map.set(pos, {type: SemanticBlockType.BEAM, groups: properties.groups ?? ["beam"], properties: blockProperties})
    }

    return map
}

export type TriangleGableGenerationProperties = BeamGenerationProperties

export function generateTriangleGable(map: SemanticMap, properties: TriangleGableGenerationProperties, blockProperties: Record<string, any> = {}): SemanticMap {
    const length = properties.dimensions.length
    const height = Math.ceil(length / 2) - 1
    const direction: Vector3 = properties.axis === "x" ? new Vector3(1, 0, 0) : new Vector3(0, 0, 1)

    for (let y = 0; y < height; y++) {
        const rowLength = length - 2 * y - 2
        const offset = y + 1
        for (let i = 0; i < rowLength; i++) {
            const pos = properties.offset.clone().addScaledVector(direction, i + offset).add(new Vector3(0, y, 0))
            map.set(pos, {type: SemanticBlockType.GABLE, groups: properties.groups ?? ["wall", "gable"], properties: blockProperties})
        }
    }

    return map
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