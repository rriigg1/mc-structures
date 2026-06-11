import { toCumulativeSubdivisions } from "./GenerationUtils";
import { Dimensions, SemanticMap } from "../types/RandomGeneration";
import { generatePillar, generateWall, WallGenerationProperties, BeamGenerationProperties, generateBeam, GenerationPropertiesBase } from "./GenerationBase";
import { Vector3 } from "three";

export type FrameBuilderProperties = GenerationPropertiesBase & {
    dimensions: Dimensions,
    xSubdivisions: number[],
    zSubdivisions: number[]
    bottomFrame?: boolean,
    topFrame?: boolean
}


export function buildPillarFrame(map: SemanticMap, properties: FrameBuilderProperties): SemanticMap {
    buildSimpleFrame(map, properties)

    const cumulativeXSubdivisions = toCumulativeSubdivisions(properties.xSubdivisions)
    const cumulativeZSubdivisions = toCumulativeSubdivisions(properties.zSubdivisions)

    let pillarProperties = {
        offset: new Vector3(properties.offset.x, properties.offset.y, properties.offset.z),
        dimensions: {height: properties.dimensions.height},
        groups: [...properties.groups ?? [], "pillar"]
    }
    
    for (let i = 0; i < cumulativeXSubdivisions.length; i++) {
        pillarProperties.offset.x = properties.offset.x + cumulativeXSubdivisions[i]
        pillarProperties.offset.z = properties.offset.z
        generatePillar(map, pillarProperties)
        pillarProperties.offset.z = properties.offset.z + properties.dimensions.depth - 1
        generatePillar(map, pillarProperties)
    }

    for (let i = 0; i < cumulativeZSubdivisions.length; i++) {
        pillarProperties.offset.x = properties.offset.x
        pillarProperties.offset.z = properties.offset.z + cumulativeZSubdivisions[i]
        generatePillar(map, pillarProperties)
        pillarProperties.offset.x = properties.offset.x + properties.dimensions.width - 1
        generatePillar(map, pillarProperties)
    }

    // Generate beams on the top and bottom if needed
    if (properties.bottomFrame) {
        // Beams on the x axis
        let beamProperties: BeamGenerationProperties = {
            offset: new Vector3(properties.offset.x, properties.offset.y, properties.offset.z),
            axis: "x",
            dimensions: {length: properties.dimensions.width},
            groups: [...properties.groups ?? [], "beam"]
        }
        generateBeam(map, beamProperties)
        beamProperties.offset.z += properties.dimensions.depth - 1
        generateBeam(map, beamProperties)
    
        // Beams on the z axis
        beamProperties.axis = "z"
        beamProperties.dimensions.length = properties.dimensions.depth
        beamProperties.offset.z = properties.offset.z
        generateBeam(map, beamProperties)
        beamProperties.offset.x += properties.dimensions.width - 1
        generateBeam(map, beamProperties)
    }

    if (properties.topFrame) {
        // Beams on the x axis
        let beamProperties: BeamGenerationProperties = {
            offset: new Vector3(properties.offset.x, properties.offset.y + properties.dimensions.height - 1, properties.offset.z),
            axis: "x",
            dimensions: {length: properties.dimensions.width},
            groups: [...properties.groups ?? [], "beam"]
        }
        generateBeam(map, beamProperties)
        beamProperties.offset.z += properties.dimensions.depth - 1
        generateBeam(map, beamProperties)
    
        // Beams on the z axis
        beamProperties.axis = "z"
        beamProperties.dimensions.length = properties.dimensions.depth
        beamProperties.offset.z = properties.offset.z
        generateBeam(map, beamProperties)
        beamProperties.offset.x += properties.dimensions.width - 1
        generateBeam(map, beamProperties)
    }

    return map
}

export function buildSimpleFrame(map: SemanticMap, properties: FrameBuilderProperties): SemanticMap {
    let wallProperties: WallGenerationProperties = {
        offset: new Vector3(properties.offset.x, properties.offset.y, properties.offset.z),
        axis: "x",
        dimensions: {length: properties.dimensions.width, height: properties.dimensions.height},
        groups: [...properties.groups ?? [], "wall"]
    }

    generateWall(map, wallProperties)
    wallProperties.offset.z += properties.dimensions.depth - 1
    generateWall(map, wallProperties)

    wallProperties.axis = "z"
    wallProperties.offset.z = properties.offset.z
    wallProperties.dimensions.length = properties.dimensions.depth
    generateWall(map, wallProperties)
    wallProperties.offset.x += properties.dimensions.width - 1
    generateWall(map, wallProperties)

    return map
}