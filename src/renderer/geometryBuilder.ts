import { RenderElement, FaceName, FACE_DEFS } from "../types/Block"
import * as THREE from "three"

export function buildElementGeometry(element: RenderElement, textureMap: Map<string, number>, cullFaces?: Partial<Record<FaceName, boolean>>): THREE.BufferGeometry {
    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const indices: number[] = []

    let indexOffset = 0

    const from = new THREE.Vector3(...element.pos)
    const size = new THREE.Vector3(...element.size)
    const geo = new THREE.BufferGeometry()

    for (const faceName of Object.keys(FACE_DEFS) as FaceName[]) {

        if (!element.textures[faceName]) continue
        if (cullFaces?.[faceName]) continue

        const def = FACE_DEFS[faceName]

        const verts = def.corners.map(corner => {
            return new THREE.Vector3(
                from.x + corner[0] * size.x,
                from.y + corner[1] * size.y,
                from.z + corner[2] * size.z
            ).subScalar(0.5) // center block
        })

        const normal = def.dir.clone()

        if (element.rotation) {
            const origin = new THREE.Vector3(...element.rotation.origin).subScalar(0.5)

            const axis = new THREE.Vector3(
                element.rotation.axis === "x" ? 1 : 0,
                element.rotation.axis === "y" ? 1 : 0,
                element.rotation.axis === "z" ? 1 : 0
            )

            const angle = THREE.MathUtils.degToRad(element.rotation.angle)
            const m = new THREE.Matrix4().makeRotationAxis(axis, angle)

            verts.forEach(v => {
                v.sub(origin).applyMatrix4(m).add(origin)
            })
            normal.applyMatrix4(m)
        }


        const rot = element.modelRotation
        if (rot) {
            const euler = new THREE.Euler(
                -THREE.MathUtils.degToRad(rot.x ?? 0),
                -THREE.MathUtils.degToRad(rot.y ?? 0),
                -THREE.MathUtils.degToRad(rot.z ?? 0),
                "YXZ"
            )
            const m = new THREE.Matrix4().makeRotationFromEuler(euler)
            verts.forEach(v => v.applyMatrix4(m))
            normal.applyMatrix4(m)
        }

        verts.forEach(v => {
            positions.push(v.x, v.y, v.z)
            normals.push(normal.x, normal.y, normal.z)
        })


        // UV-coordinates
        const uvRect = element.uvs[faceName] ?? [0, 0, 16, 16]
        let [u1, v1, u2, v2] = uvRect

        u1 /= 16; v1 /= 16; u2 /= 16; v2 /= 16

        let faceUVs = [
            [1-u1, 1 - v1],
            [1-u2, 1 - v1],
            [1-u2, 1 - v2],
            [1-u1, 1 - v2]]

        // apply face rotation
        faceUVs = rotateUVs(faceUVs, element.faceRotations[faceName])

        // really hacky but I haven't fully understood the reprojection yet
        // TODO: might still be wrong in some cases: (What about x=270? Is north different from south in the x=90 case?)
        if (element.modelRotation.uvlock) {
            const center = new THREE.Vector2(0.5, 0.5)
            const isTopOrBottom = faceName == "up" || faceName == "down"
            const isSide = faceName == "east" || faceName == "west" || faceName == "north" || faceName == "south"
            let angle = undefined
            if (isTopOrBottom && (!element.modelRotation.x || element.modelRotation.x == 180)) {
                angle = -(element.modelRotation.y ?? 0)
            } else if (isSide && (!element.modelRotation.x || element.modelRotation.x == 180)) {
                angle = element.modelRotation.x
            } else if (isTopOrBottom && element.modelRotation.x == 90) {
                angle = 180
            } else if (element.modelRotation.x == 90) {
                if (faceName == "north" || faceName == "south") {
                    angle = 180 + (element.modelRotation.y ?? 0)
                } else {
                    angle = faceName == "east" ? 270 : 90
                }
            }

            faceUVs = faceUVs.map(([u, v]) => {
                const xy = (new THREE.Vector2(u,v)).rotateAround(center, THREE.MathUtils.degToRad(angle ?? 0))
                return [xy.x, xy.y]
            })
        }

        faceUVs.forEach(([u, v]) => uvs.push(u, v))

        indices.push(
            indexOffset, indexOffset + 1, indexOffset + 2,
            indexOffset, indexOffset + 2, indexOffset + 3
        )

        const materialIndex: number = element.textures[faceName] ? textureMap.get(element.textures[faceName])! : 0
        geo.addGroup(indices.length - 6, 6, materialIndex)

        indexOffset += 4
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)

    return geo
}

function rotateUVs(uvs: number[][], angle?: number): number[][] {
    const rotSteps = ((angle ?? 0) / 90) % 4
        for (let i = 0; i < rotSteps; i++) {
            uvs = [uvs[1], uvs[2], uvs[3], uvs[0]]
        }
        return uvs
}