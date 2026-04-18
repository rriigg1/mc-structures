import { Block } from "@react-three/fiber/dist/declarations/src/core/utils"

type PaletteEntry = {
    block: string,
    state?: Record<string, string>,
    weight: number,
    lightness: number
}

type PaletteMaterial = "stone" | "wood" | "adobe" | "other"

export class BlockPalette {
    public blocks: PaletteEntry[]
    private pillarsOnly: boolean
    private supportsStairs: boolean
    private supportsSlabs: boolean
    private weightSum: number
    private material: PaletteMaterial

    constructor(entries: PaletteEntry[], options?: {pillarsOnly?: boolean, supportsStairs?: boolean, supportsSlabs?: boolean, material?: PaletteMaterial}) {
        this.weightSum = 0
        this.blocks = entries.sort((e1, e2) => e1.lightness - e2.lightness)
        entries.forEach((entry: PaletteEntry) => {
            this.weightSum += entry.weight
        });
        this.pillarsOnly = options?.pillarsOnly ?? false
        this.supportsStairs = options?.supportsStairs ?? false
        this.supportsSlabs = options?.supportsSlabs ?? false
        this.material = options?.material ?? "other"
    }

    public samplePalette(): {block: PaletteEntry, index: number} {
        const rand = Math.random() * this.weightSum
        let sum = 0
        let index = 0
        for (const entry of this.blocks) {
            sum += entry.weight
            if (sum >= rand) {
                return {block: entry, index: index}
            }
            index++
        }
        // Fallback, though shouldn't reach here
        return {
            block: this.blocks[this.blocks.length - 1],
            index: this.blocks.length - 1
        }
    }

    public isPillarsOnly(): boolean {
        return this.pillarsOnly
    }

    public doesSupportStairs(): boolean {
        return this.supportsStairs
    }

    public doesSupportSlabs(): boolean {
        return this.supportsSlabs
    }

    public getMaterial(): PaletteMaterial {
        return this.material
    }
}

export class PaletteProvider {
    public static PALETTES: BlockPalette[] = [
        new BlockPalette([{block: "stone_bricks", weight: 5, lightness: 1}, {block: "cracked_stone_bricks", weight: 2, lightness: 0.8}, {block: "chiseled_stone_bricks", weight: 0.5, lightness: 0.4}, {block: "mossy_cobblestone", weight: 0.9, lightness: 0.2}, {block: "mossy_stone_bricks", weight: 1, lightness: 1.1}, {block: "andesite", weight: 2, lightness: 1.3}], {material: "stone" }),
        new BlockPalette([{block: "moss_block", weight: 1, lightness: 1.2}, {block: "cracked_stone_bricks", weight: 2, lightness: 0.8}, {block: "cobblestone", weight: 2, lightness: 0.4}, {block: "mossy_cobblestone", weight: 0.9, lightness: 1}, {block: "mossy_stone_bricks", weight: 1, lightness: 1.1}, {block: "andesite", weight: 2, lightness: 1.3}], {material: "stone" }),
        new BlockPalette([{block: "diorite", weight: 5, lightness: 1}, {block: "polished_diorite", weight: 1, lightness: 0.8}, {block: "calcite", weight: 3, lightness: 1.1}, {block: "smooth_quartz", weight: 0.5, lightness: 1.3}, {block: "quartz_block", weight: 0.8, lightness: 1.2}], {material: "adobe" }),
        new BlockPalette([{block: "diorite", weight: 5, lightness: 1}, {block: "polished_diorite", weight: 1, lightness: 0.8}, {block: "calcite", weight: 3, lightness: 1.1}], {material: "adobe"}),
        new BlockPalette([{block: "stone_bricks", weight: 10, lightness: 1}, {block: "cracked_stone_bricks", weight: 0.2, lightness: 0.9}], {material: "stone"}),
        new BlockPalette([{block: "stone", weight: 10, lightness: 1}, {block: "andesite", weight: 5, lightness: 1.1}], {material: "stone", supportsStairs: true, supportsSlabs: true}),
        new BlockPalette([{block: "deepslate", state: {axis: "y"}, weight: 5, lightness: 1}, {block: "cobbled_deepslate", weight: 4, lightness: 0.8}, {block: "tuff", weight: 3, lightness: 1.2}], {material: "stone"}),
        new BlockPalette([{block: "deepslate", state: {axis: "y"}, weight: 5, lightness: 0.9}, {block: "cobbled_deepslate", weight: 4, lightness: 0.8}, {block: "tuff", weight: 3, lightness: 1}, {block: "cobblestone", weight: 3, lightness: 1}, {block: "stone", weight: 1, lightness: 1.1}, {block: "andesite", weight: 0.8, lightness: 1.2}], {material: "stone"}),
        new BlockPalette([{block: "oak_planks", weight: 5, lightness: 1}, {block: "spruce_planks", weight: 4, lightness: 0.8}, {block: "birch_planks", weight: 3, lightness: 1.2}, {block: "jungle_planks", weight: 2, lightness: 1.1}, {block: "dark_oak_planks", weight: 1, lightness: 0.6}], {material: "wood", supportsSlabs: true, supportsStairs: true}),
        new BlockPalette([{block: "oak_log", state: {axis: "y"}, weight: 1, lightness: 1}], {pillarsOnly: true, material: "wood"}),
        new BlockPalette([{block: "spruce_log", state: {axis: "y"}, weight: 1, lightness: 0.8}], {pillarsOnly: true, material: "wood"}),
        new BlockPalette([{block: "birch_log", state: {axis: "y"}, weight: 1, lightness: 1.2}], {pillarsOnly: true, material: "wood"}),
        new BlockPalette([{block: "jungle_log", state: {axis: "y"}, weight: 1, lightness: 1.1}], {pillarsOnly: true, material: "wood"}),
        new BlockPalette([{block: "dark_oak_log", state: {axis: "y"}, weight: 1, lightness: 0.6}], {pillarsOnly: true, material: "wood"}),
        new BlockPalette([{block: "stripped_spruce_log", state: {axis: "y"}, weight: 1, lightness: 0.8}], {pillarsOnly: true, material: "wood"}),
        new BlockPalette([{block: "stripped_oak_log", state: {axis: "y"}, weight: 1, lightness: 0.8}], {pillarsOnly: true, material: "wood"}),
        new BlockPalette([{block: "stripped_dark_oak_log", state: {axis: "y"}, weight: 1, lightness: 0.8}], {pillarsOnly: true, material: "wood"}),
        new BlockPalette([{block: "stripped_dark_oak_log", state: {axis: "y"}, weight: 3, lightness: 0.8}, {block: "jungle_log", state: {axis: "y"}, weight: 1, lightness: 1.2}, {block: "mangrove_log", state: {axis: "y"}, weight: 3, lightness: 1}], {pillarsOnly: true, material: "wood"}),
        new BlockPalette([{block: "spruce_planks", weight: 1, lightness: 0.8}], {material: "wood", supportsStairs: true, supportsSlabs: true}),
        new BlockPalette([{block: "oak_planks", weight: 1, lightness: 1}], {material: "wood", supportsStairs: true, supportsSlabs: true})
    ]

    public static getRandomPalette(): BlockPalette {
        const i = Math.floor(Math.random() * PaletteProvider.PALETTES.length)
        return PaletteProvider.PALETTES[i]
    }

    public static getRandomPaletteWithProperties(predicate: (palette: BlockPalette) => boolean): BlockPalette {
        const filtered = PaletteProvider.PALETTES.filter(predicate)
        if (filtered.length === 0) {
            throw new Error("No palettes matching criteria")
        }
        const i = Math.floor(Math.random() * filtered.length)
        return filtered[i]
    }

    public static getRandomPillarPalette(): BlockPalette {
        return PaletteProvider.getRandomPaletteWithProperties(palette => palette.isPillarsOnly())
    }

    public static getRandomWallPalette(): BlockPalette {
        return PaletteProvider.getRandomPaletteWithProperties(palette => !palette.isPillarsOnly())
    }
}