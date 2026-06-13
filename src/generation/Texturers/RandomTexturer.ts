import { SemanticBlock } from "../../types/RandomGeneration.ts";
import { Texturer } from "../GenerationBase.ts";
import { BlockPalette, PaletteEntry } from "../PaletteProvider.ts";
import { PaletteBlock } from "../../types/Block.ts";

export class RandomTexturer extends Texturer {

    texture(palette: BlockPalette, texturePredicate: (block: SemanticBlock) => boolean): Texturer {
        this.updatePaletteMap()
        for (const [pos, block] of this.semanticMap) {
            if (texturePredicate(block)) {
                let {block: paletteBlock, index} = palette.sampleWithShape(block.blockShape)

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
        return this;
    }    
}