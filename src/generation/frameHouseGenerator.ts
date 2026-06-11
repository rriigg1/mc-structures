import { PaletteProvider } from "./PaletteProvider"
import { getRandomDimensions, getRandomSubdivision, random, randomChoice } from "./RandomUtils"
import { buildPillarFrame, buildSimpleFrame, FrameBuilderProperties } from "./FrameBuilder"
import { joinGenerationResults, GenerationResult } from "./GenerationUtils"
import { Texturer } from "./GenerationBase"
import { SemanticMap } from "../types/RandomGeneration"
import { RandomTexturer } from "./RandomTexturer"
import { Vector3 } from "three"


export function generateFrame(): GenerationResult {
    const dimensions = getRandomDimensions()
    const xShorterThanZ = dimensions.width < dimensions.depth

    // Subdivide edges
    let xSubdivisions = getRandomSubdivision(dimensions.width, xShorterThanZ || random() < 0.2)
    let zSubdivisions = getRandomSubdivision(dimensions.depth, !xShorterThanZ || random() < 0.2)

    // Get palettes
    const wallPalette = PaletteProvider.getRandomPaletteWithProperties(palette => !palette.isPillarsOnly() && palette.getMaterial() !== "wood")
    const pillarPalette = PaletteProvider.getRandomPillarPalette()
    const topWallMaterial = randomChoice(["wood", "adobe"])
    const topWallPalette = PaletteProvider.getRandomPaletteWithProperties(palette => !palette.isPillarsOnly() && palette.getMaterial() === topWallMaterial)

    const topFrame = random() < 0.5
    const bottomFrame = topFrame && random() < 0.5

    const houseMap: SemanticMap = new SemanticMap()

    const lowerFrameProperties: FrameBuilderProperties = {
        offset: new Vector3(0, 0, 0),
        groups: ["floor1"],
        dimensions,
        xSubdivisions: xSubdivisions,
        zSubdivisions: zSubdivisions,
        bottomFrame,
        topFrame
    }

    buildSimpleFrame(houseMap, lowerFrameProperties)

    
    xSubdivisions[0] += 1
    zSubdivisions[0] += 1
    xSubdivisions[xSubdivisions.length - 1] += 1
    zSubdivisions[zSubdivisions.length - 1] += 1

    const upperFrameProperties: FrameBuilderProperties = {
        offset: new Vector3(-1, dimensions.height, -1),
        groups: ["floor2"],
        dimensions: {width: dimensions.width + 2, height: dimensions.height, depth: dimensions.depth + 2},
        xSubdivisions: xSubdivisions,
        zSubdivisions: zSubdivisions,
        bottomFrame: false,
        topFrame: true
    }

    buildPillarFrame(houseMap, upperFrameProperties)


    const texturer: Texturer = new RandomTexturer(houseMap, {blocks: [], palette: {0: {name: "minecraft:air", properties: {}}}})

    // texture bottom floor
    texturer.texture(wallPalette, (block) => block.groups.includes("wall") && block.groups.includes("floor1"))

    // texture top floor
    texturer.texture(topWallPalette, (block) => block.groups.includes("wall") && block.groups.includes("floor2"))
    texturer.textureGroup(pillarPalette, "pillar")
    texturer.textureGroup(pillarPalette, "beam")

    console.log("Generated frame with dimensions", dimensions, "and subdivisions", xSubdivisions, zSubdivisions)
    console.log(texturer.semanticMap)
    console.log(texturer.generationResult)

    return texturer.generationResult
}
