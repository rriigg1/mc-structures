import { PaletteProvider } from "./PaletteProvider"
import { getRandomDimensions, getRandomInt, getRandomSubdivision, random, randomChoice } from "./RandomUtils"
import {
    buildPillarFrame, PillarFrameProperties,
    buildSimpleFrame, SimpleFrameProperties,
    buildSimpleGable, SimpleGableProperties,
    buildSimpleGableRoof, SimpleGableRoofProperties
} from "./FrameBuilder"
import { GenerationResult } from "./GenerationUtils"
import { Texturer } from "./GenerationBase"
import { SemanticBlockType, SemanticMap } from "../types/RandomGeneration"
import { RandomTexturer } from "./Texturers/RandomTexturer"
import { SolidTexturer } from "./Texturers/SolidTexturer"
import { Vector3 } from "three"


export function generateFrame(): GenerationResult {
    const dimensions = getRandomDimensions()
    const xShorterThanZ = dimensions.width < dimensions.depth

    // Subdivide edges
    let xSubdivisions = getRandomSubdivision(dimensions.width, xShorterThanZ || random() < 0.2)
    let zSubdivisions = getRandomSubdivision(dimensions.depth, !xShorterThanZ || random() < 0.2)

    const topBeam = random() < 0.7
    const bottomBeam = topBeam && random() < 0.5
    const bottomBeamEnd = bottomBeam && random() < 0.2
    const topBeamEnd = topBeam && random() < 0.5

    const houseMap: SemanticMap = new SemanticMap()

    const lowerFrameProperties: SimpleFrameProperties = {
        offset: new Vector3(0, 0, 0),
        groups: ["floor1"],
        dimensions
    }

    buildSimpleFrame(houseMap, lowerFrameProperties)

    
    xSubdivisions[0] += 1
    zSubdivisions[0] += 1
    xSubdivisions[xSubdivisions.length - 1] += 1
    zSubdivisions[zSubdivisions.length - 1] += 1

    const topFloorDimensions = {width: dimensions.width + 2, height: dimensions.height, depth: dimensions.depth + 2}

    const upperFrameProperties: PillarFrameProperties = {
        offset: new Vector3(-1, dimensions.height, -1),
        groups: ["floor2"],
        dimensions: topFloorDimensions,
        xSubdivisions: xSubdivisions,
        zSubdivisions: zSubdivisions,
        bottomBeam: bottomBeam,
        topBeam: topBeam,
        bottomBeamEnd: bottomBeamEnd,
        topBeamEnd: topBeamEnd
    }

    buildPillarFrame(houseMap, upperFrameProperties)



    const gableProperties: SimpleGableProperties = {
        offset: new Vector3(-1, dimensions.height + dimensions.height, -1),
        groups: ["floor2"],
        dimensions: topFloorDimensions
    }

    buildSimpleGable(houseMap, gableProperties)

    const gableRoofProperties: SimpleGableRoofProperties = {
        offset: new Vector3(-1, dimensions.height + dimensions.height, -1),
        dimensions: topFloorDimensions,
        endOverhang: getRandomInt(1, 3),
        sideOverhang: getRandomInt(0, 2)
    }

    buildSimpleGableRoof(houseMap, gableRoofProperties)


    const generationResult: GenerationResult = {blocks: [], palette: {0: {name: "minecraft:air", properties: {}}}}

    const randomTexturer: Texturer = new RandomTexturer(houseMap, generationResult)
    const solidTexturer: Texturer = new SolidTexturer(houseMap, generationResult)

    const texturers = [randomTexturer, solidTexturer]

    // Get palettes
    const wallPalette = PaletteProvider.getRandomPaletteWithProperties(palette => !palette.isPillarsOnly() && palette.getMaterial() !== "wood")
    const pillarPalette = PaletteProvider.getRandomPillarPalette()
    const topWallMaterial = randomChoice(["wood", "adobe"])
    const topWallPalette = PaletteProvider.getRandomPaletteWithProperties(palette => !palette.isPillarsOnly() && palette.getMaterial() === topWallMaterial)
    const roofPalette = PaletteProvider.getRandomMaterialPalette()
    
    // texture bottom floor
    randomChoice(texturers).texture(wallPalette, (block) => block.groups.includes("wall") && block.groups.includes("floor1"))

    // texture top floor
    randomChoice(texturers).texture(topWallPalette, (block) => block.groups.includes("wall") && block.groups.includes("floor2"))
    randomChoice(texturers)
            .textureGroup(pillarPalette, "pillar")
            .textureGroup(pillarPalette, "beam")

    randomChoice(texturers)
        .textureType(roofPalette, SemanticBlockType.ROOF)
    

    console.debug("Generated frame with dimensions", dimensions, "and subdivisions", xSubdivisions, zSubdivisions)
    
    console.log(generationResult)

    return generationResult
}
