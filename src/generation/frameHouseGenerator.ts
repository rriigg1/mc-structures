import { PaletteProvider } from "./PaletteProvider"
import { getRandomDimensions, getRandomSubdivision } from "./RandomUtils"
import { buildFrame } from "./FrameBuilder"
import { joinGenerationResults, GenerationResult } from "./GenerationUtils"


export function generateFrame(): GenerationResult {
    const dimensions = getRandomDimensions()
    const xShorterThanZ = dimensions.width < dimensions.depth

    // Subdivide edges
    let xSubdivisions = getRandomSubdivision(dimensions.width, xShorterThanZ || Math.random() < 0.2)
    let zSubdivisions = getRandomSubdivision(dimensions.depth, !xShorterThanZ || Math.random() < 0.2)

    // Get palettes
    const wallPalette = PaletteProvider.getRandomPaletteWithProperties(palette => !palette.isPillarsOnly() && palette.getMaterial() !== "wood")
    const pillarPalette = PaletteProvider.getRandomPillarPalette()
    const topWallMaterial = Math.random() < 0.5 ? "wood" : "adobe"
    const topWallPalette = PaletteProvider.getRandomPaletteWithProperties(palette => !palette.isPillarsOnly() && palette.getMaterial() === topWallMaterial)

    const topFrame = Math.random() < 0.5
    const bottomFrame = topFrame && Math.random() < 0.5

    let lowerFrame = buildFrame({offset: {x: 0, y: 0, z: 0}, dimensions, xSubdivisions, zSubdivisions, wallPalette, pillarPalette: undefined, bottomFrame, topFrame})
    
    xSubdivisions[0] += 1
    zSubdivisions[0] += 1
    xSubdivisions[xSubdivisions.length - 1] += 1
    zSubdivisions[zSubdivisions.length - 1] += 1
    let upperFrame = buildFrame({offset: {x: -1, y: dimensions.height, z: -1}, dimensions: {width: dimensions.width+2, height: dimensions.height, depth: dimensions.depth+2}, xSubdivisions, zSubdivisions, wallPalette: topWallPalette, pillarPalette, bottomFrame: true, topFrame})
    
    return joinGenerationResults([lowerFrame, upperFrame])
}
