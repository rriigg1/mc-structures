import { toCumulativeSubdivisions } from "./GenerationUtils";
import { Dimensions, SemanticMap, SemanticBlockType, SemanticBlockShape } from "../types/RandomGeneration";
import { generatePillar, generateWall, WallGenerationProperties, BeamGenerationProperties, generateBeam, GenerationPropertiesBase, generateTriangleGable, TriangleGableGenerationProperties } from "./GenerationBase";
import { Vector3 } from "three";

export type SimpleFrameProperties = GenerationPropertiesBase & {
    dimensions: Dimensions
}

export type PillarFrameProperties = SimpleFrameProperties & {
    xSubdivisions: number[],
    zSubdivisions: number[]
    bottomBeam?: boolean,
    topBeam?: boolean,
    bottomBeamEnd?: boolean,
    topBeamEnd?: boolean
}


export function buildPillarFrame(map: SemanticMap, properties: PillarFrameProperties): SemanticMap {
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
    if (properties.bottomBeam) {
        const xIsShorterThanZ: boolean = properties.dimensions.width <= properties.dimensions.depth
        const xBeamExtension = (!xIsShorterThanZ && properties.bottomBeamEnd) ? 1 : 0
        const zBeamExtension = (xIsShorterThanZ && properties.bottomBeamEnd) ? 1 : 0

        // Beams on the x axis
        let beamProperties: BeamGenerationProperties = {
            offset: new Vector3(properties.offset.x + (1 - xBeamExtension), properties.offset.y, properties.offset.z),
            axis: "x",
            dimensions: {length: properties.dimensions.width - (2 - 2 * xBeamExtension)},
            groups: [...properties.groups ?? [], "beam"]
        }
        generateBeam(map, beamProperties)
        beamProperties.offset.z += properties.dimensions.depth - 1
        generateBeam(map, beamProperties)
    
        // Beams on the z axis
        beamProperties.axis = "z"
        beamProperties.dimensions.length = properties.dimensions.depth - (2 - 2 * zBeamExtension)
        beamProperties.offset.z = properties.offset.z + (1 - zBeamExtension)
        beamProperties.offset.x = properties.offset.x
        generateBeam(map, beamProperties)
        beamProperties.offset.x += properties.dimensions.width - 1
        generateBeam(map, beamProperties)
    }

    if (properties.topBeam) {
        const xIsShorterThanZ: boolean = properties.dimensions.width <= properties.dimensions.depth
        const xBeamExtension = (!xIsShorterThanZ && properties.topBeamEnd) ? 1 : 0
        const zBeamExtension = (xIsShorterThanZ && properties.topBeamEnd) ? 1 : 0

        // Beams on the x axis
        let beamProperties: BeamGenerationProperties = {
            offset: new Vector3(properties.offset.x + (1 - xBeamExtension), properties.offset.y + properties.dimensions.height - 1, properties.offset.z),
            axis: "x",
            dimensions: {length: properties.dimensions.width - (2 - 2 * xBeamExtension)},
            groups: [...properties.groups ?? [], "beam"]
        }
        generateBeam(map, beamProperties)
        beamProperties.offset.z += properties.dimensions.depth - 1
        generateBeam(map, beamProperties)
    
        // Beams on the z axis
        beamProperties.axis = "z"
        beamProperties.dimensions.length = properties.dimensions.depth - (2 - 2 * zBeamExtension)
        beamProperties.offset.z = properties.offset.z + (1 - zBeamExtension)
        beamProperties.offset.x = properties.offset.x
        generateBeam(map, beamProperties)
        beamProperties.offset.x += properties.dimensions.width - 1
        generateBeam(map, beamProperties)
    }

    return map
}

export function buildSimpleFrame(map: SemanticMap, properties: SimpleFrameProperties): SemanticMap {
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

export type SimpleGableProperties = SimpleFrameProperties & {
    dimensions: Dimensions
}

export function buildSimpleGable(map: SemanticMap, properties: SimpleGableProperties): SemanticMap {
    const shortAxis = properties.dimensions.width > properties.dimensions.depth ? "z" : "x"
    const shortLength = Math.min(properties.dimensions.width, properties.dimensions.depth)

    const gableProperties: TriangleGableGenerationProperties = {
        offset: new Vector3(properties.offset.x, properties.offset.y, properties.offset.z),
        axis: shortAxis,
        dimensions: {length: shortLength},
        groups: [...properties.groups ?? [], "wall", "gable"]
    }

    generateTriangleGable(map, gableProperties)

    if (shortAxis === "x") {
        gableProperties.offset.z += properties.dimensions.depth - 1
    } else {
        gableProperties.offset.x += properties.dimensions.width - 1
    }

    generateTriangleGable(map, gableProperties)

    // find pillars which abrupty end at the gable and extend them to the top of the gable
    for (let x = 0; x < properties.dimensions.width; x++) {
        for (let z = 0; z < properties.dimensions.depth; z++) {
            const pos = new Vector3(x + properties.offset.x, properties.offset.y - 1, z + properties.offset.z)
            if (map.get(pos)?.type === SemanticBlockType.PILLAR) {
                // Extend the pillar to the top of the gable
                let currentPos = pos.clone().add(new Vector3(0, 1, 0))
                while (map.get(currentPos)?.type === SemanticBlockType.GABLE) {
                    map.set(currentPos, {type: SemanticBlockType.PILLAR, groups: [...properties.groups ?? [], "pillar"], properties: {axis: "y"}})
                    currentPos.y += 1
                }
            }
        }
    }

    return map
}

export type SimpleGableRoofProperties = SimpleFrameProperties & {
    endOverhang?: number
    sideOverhang?: number
}

export function buildSimpleGableRoof(map: SemanticMap, properties: SimpleGableRoofProperties): SemanticMap {
    const xIsLongAxis = properties.dimensions.width > properties.dimensions.depth
    
    const actualOffset = properties.offset.clone()
    const actualDimensions = {...properties.dimensions}
    
    actualOffset.y -= properties.sideOverhang ?? 0
    actualDimensions.height += properties.sideOverhang ?? 0
    if (xIsLongAxis) {
        actualOffset.x -= properties.endOverhang ?? 0
        actualOffset.z -= properties.sideOverhang ?? 0
        actualDimensions.width += (properties.endOverhang ?? 0) * 2
        actualDimensions.depth += (properties.sideOverhang ?? 0) * 2
    } else {
        actualOffset.z -= properties.endOverhang ?? 0
        actualOffset.x -= properties.sideOverhang ?? 0
        actualDimensions.depth += (properties.endOverhang ?? 0) * 2
        actualDimensions.width += (properties.sideOverhang ?? 0) * 2
    }

    const shorterLength = xIsLongAxis ? actualDimensions.depth : actualDimensions.width
    const longerLength = !xIsLongAxis ? actualDimensions.depth : actualDimensions.width

    for (let u = 0; u < Math.floor(shorterLength/2); u++) {
        for (let v = 0; v < longerLength; v++) {
            const pos: Vector3 = xIsLongAxis
                ? new Vector3(actualOffset.x + v, actualOffset.y + u, actualOffset.z + u)
                : new Vector3(actualOffset.x + u, actualOffset.y + u, actualOffset.z + v)
            
            map.set(pos, {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.STAIRS,  groups: [...properties.groups ?? [], "roof"], properties: {facing: xIsLongAxis ? "south": "east", half: "bottom", shape: "straight"}})
            // place upside down stairs under roof to make it look supported
            if ((v < (properties.endOverhang ?? 0) || v >= longerLength - (properties.endOverhang ?? 0)) && u > 0) {
                map.set(new Vector3(pos.x, pos.y - 1, pos.z), {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.STAIRS,  groups: [...properties.groups ?? [], "roof"], properties: {facing: xIsLongAxis ? "north": "west", half: "top", shape: "straight"}})
            }

            if (xIsLongAxis) {
                pos.z = actualDimensions.depth - 1 - u + actualOffset.z
            } else {
                pos.x = actualDimensions.width - 1 - u + actualOffset.x
            }
            
            map.set(pos, {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.STAIRS, groups: [...properties.groups ?? [], "roof"], properties: {facing: xIsLongAxis ? "north": "west", half: "bottom", shape: "straight"}})
            // place upside down stairs under roof to make it look supported
            if ((v < (properties.endOverhang ?? 0) || v >= longerLength - (properties.endOverhang ?? 0)) && u > 0) {
                map.set(new Vector3(pos.x, pos.y - 1, pos.z), {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.STAIRS,  groups: [...properties.groups ?? [], "roof"], properties: {facing: xIsLongAxis ? "south": "east", half: "top", shape: "straight"}})
            }
        }
    }

    // The roof has an odd width and needs slaps or some block in the center
    if (shorterLength % 2 !== 0) {
        const mid = Math.floor(shorterLength/2)
        const height = Math.floor(shorterLength/2) + actualOffset.y
        for (let v = 0; v < longerLength; v++) {
            const pos: Vector3 = xIsLongAxis
                ? new Vector3(actualOffset.x + v, height, actualOffset.z + mid)
                : new Vector3(actualOffset.x + mid, height, actualOffset.z + v)
            
            map.set(pos, {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.SLAB, groups: [...properties.groups ?? [], "roof"], properties: {type: "bottom"}})
            
            
        }

        // Place upside down slabs under the top slab to make it appear supported
        for (let v = 0; v < (properties.endOverhang ?? 0); v++) {
            let pos: Vector3 = xIsLongAxis
                ? new Vector3(actualOffset.x + v, height-1, actualOffset.z + mid)
                : new Vector3(actualOffset.x + mid, height-1, actualOffset.z + v)
            if (v == 0) {
                map.set(pos, {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.STAIRS, groups: [...properties.groups ?? [], "roof"], properties: {facing: xIsLongAxis ? "east" : "south", half: "top", shape: "straight"}})
            } else {
                map.set(pos, {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.SLAB, groups: [...properties.groups ?? [], "roof"], properties: {type: "bottom"}})
            }

            pos = xIsLongAxis
                ? new Vector3(actualOffset.x + longerLength - v - 1, height-1, actualOffset.z + mid)
                : new Vector3(actualOffset.x + mid, height-1, actualOffset.z + longerLength - v - 1)
            if (v == 0) {
                map.set(pos, {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.STAIRS, groups: [...properties.groups ?? [], "roof"], properties: {facing: xIsLongAxis ? "west" : "north", half: "top", shape: "straight"}})
            } else {
                map.set(pos, {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.SLAB, groups: [...properties.groups ?? [], "roof"], properties: {type: "bottom"}})
            }

        }

        // extends top beams to support overhanging roof
        if ((properties.endOverhang ?? 0) > 0) {
            const cornerBlock = map.get(new Vector3(properties.offset.x, properties.offset.y - 1, properties.offset.z))
            if (cornerBlock?.type === SemanticBlockType.BEAM) {
                // all but the last block become beams
                for (let v = 0; v < (properties.endOverhang ?? 0); v++) {
                    let pos = xIsLongAxis
                        ? new Vector3(actualOffset.x + v, properties.offset.y-1, properties.offset.z)
                        : new Vector3(properties.offset.x, properties.offset.y-1, actualOffset.z + v)
                    if (v == 0) {
                        map.set(pos, {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.STAIRS, groups: [...properties.groups ?? [], "roof"], properties: {facing: xIsLongAxis ? "east" : "south", half: "top", shape: "straight"}})
                    } else {
                        map.set(pos, cornerBlock)
                    }

                    pos = xIsLongAxis
                        ? new Vector3(actualOffset.x + longerLength - v - 1, properties.offset.y-1, properties.offset.z)
                        : new Vector3(properties.offset.x, properties.offset.y-1, actualOffset.z + longerLength - v - 1)
                    if (v == 0) {
                        map.set(pos, {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.STAIRS, groups: [...properties.groups ?? [], "roof"], properties: {facing: xIsLongAxis ? "west" : "north", half: "top", shape: "straight"}})
                    } else {
                        map.set(pos, cornerBlock)
                    }

                    const shortLength = xIsLongAxis ? properties.dimensions.depth : properties.dimensions.width

                    pos = xIsLongAxis
                        ? new Vector3(actualOffset.x + v, properties.offset.y-1, properties.offset.z + shortLength - 1)
                        : new Vector3(properties.offset.x + shortLength - 1, properties.offset.y-1, actualOffset.z + v)
                    if (v == 0) {
                        map.set(pos, {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.STAIRS, groups: [...properties.groups ?? [], "roof"], properties: {facing: xIsLongAxis ? "east" : "south", half: "top", shape: "straight"}})
                    } else {
                        map.set(pos, cornerBlock)
                    }

                    pos = xIsLongAxis
                        ? new Vector3(actualOffset.x + longerLength - v - 1, properties.offset.y-1, properties.offset.z + shortLength - 1)
                        : new Vector3(properties.offset.x + shortLength - 1, properties.offset.y-1, actualOffset.z + longerLength - v - 1)
                    if (v == 0) {
                        map.set(pos, {type: SemanticBlockType.ROOF, blockShape: SemanticBlockShape.STAIRS, groups: [...properties.groups ?? [], "roof"], properties: {facing: xIsLongAxis ? "west" : "north", half: "top", shape: "straight"}})
                    } else {
                        map.set(pos, cornerBlock)
                    }
                }
            }
        }
    }

    return map
}