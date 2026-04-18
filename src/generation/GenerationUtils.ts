import { Block, PaletteBlock } from "../types/Block"
import { Dimensions } from "../types/RandomGeneration"

export type GenerationResult = {
    blocks: Block[]
    palette: Record<number, PaletteBlock>
}

export function getEmptyStructure(dimensions: Dimensions): number[][][] {
    return new Array(dimensions.width).fill(0).map(() =>
        new Array(dimensions.height).fill(0).map(() =>
            new Array(dimensions.depth).fill(0)
        )
    )
}

export function joinGenerationResults(results: GenerationResult[]): GenerationResult {
    let joinedResults: GenerationResult = {
        blocks: [],
        palette: {}
    }
    
    for (let i = 0; i < results.length; i++) {
        let translatedEntries: Record<number, number> = {}

        for (let entry of Object.entries(results[i].palette)) {
            for (let joined of Object.entries(joinedResults.palette)) {
                if (joinedResults.palette[parseInt(joined[0])] === entry[1]) {
                    translatedEntries[parseInt(entry[0])] = parseInt(joined[0])
                    break
                }
            }
            if (!translatedEntries[parseInt(entry[0])]) {
                const newKey = Object.keys(joinedResults.palette).length
                translatedEntries[parseInt(entry[0])] = newKey
                joinedResults.palette[newKey] = entry[1]
            }
        }

        for (let block of results[i].blocks) {
            joinedResults.blocks.push({
                x: block.x,
                y: block.y,
                z: block.z,
                paletteIndex: translatedEntries[block.paletteIndex]
            })
        }
    }

    return joinedResults
}