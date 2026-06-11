import { SemanticBlock, SemanticMap } from "../types/RandomGeneration.ts";
import { Texturer } from "./GenerationBase.ts";
import { GenerationResult } from "./GenerationUtils.ts";
import { BlockPalette } from "./PaletteProvider.ts";
import { PaletteBlock } from "../types/Block.ts";

export class RandomTexturer extends Texturer {

    texture(palette: BlockPalette, texturePredicate: (block: SemanticBlock) => boolean): GenerationResult {
        for (const [pos, block] of this.semanticMap) {
            if (texturePredicate(block)) {
                const {block: paletteBlock, index} = palette.samplePalette()
                let properties = {...paletteBlock.state, ...block.properties}
                
                const blockWithProperties: PaletteBlock = {name:`minecraft:${paletteBlock.block}`, properties: properties}
                let blockIndex: number
                
                if (!this.paletteMap.has(blockWithProperties)) {
                    blockIndex = Object.keys(this.generationResult.palette).length
                    this.generationResult.palette[blockIndex] = blockWithProperties
                    this.paletteMap.set(blockWithProperties, blockIndex)
                } else {
                    blockIndex = this.paletteMap.get(blockWithProperties)!
                }
                
                this.generationResult.blocks.push({
                    x: pos.x,
                    y: pos.y,
                    z: pos.z,
                    paletteIndex: blockIndex
                })
            }
        }
        return this.generationResult;
    }
}