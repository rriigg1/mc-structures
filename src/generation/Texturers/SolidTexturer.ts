import { SemanticBlock } from "../../types/RandomGeneration.ts";
import { Texturer } from "../GenerationBase.ts";
import { BlockPalette } from "../PaletteProvider.ts";
import { PaletteBlock } from "../../types/Block.ts";

export class SolidTexturer extends Texturer {

    texture(palette: BlockPalette, texturePredicate: (block: SemanticBlock) => boolean): Texturer {
        this.updatePaletteMap()
        const {block: paletteBlock, index} = palette.samplePalette()
        for (const [pos, block] of this.semanticMap) {
            if (texturePredicate(block)) {
                const shapedPaletteBlock = palette.getBlockWithShape(paletteBlock, block.blockShape)

                let properties = {...shapedPaletteBlock.state, ...block.properties}

                const blockWithProperties: PaletteBlock = {name:`minecraft:${shapedPaletteBlock.block}`, properties: properties}
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