import { useRef, useEffect } from "react"
import * as THREE from "three"
import { Block } from "../../types/Block"

type InstancedBlocksProps = {
  blocks: Block[]
  texture: THREE.Texture
}

export default function InstancedBlocks({
  blocks,
  texture,
}: InstancedBlocksProps) {

  const ref = useRef<THREE.InstancedMesh>(null!)

  useEffect(() => {

    const matrix = new THREE.Matrix4()

    blocks.forEach((block, i) => {

      matrix.setPosition(block.x, block.y, block.z)
      ref.current.setMatrixAt(i, matrix)

    })

    ref.current.instanceMatrix.needsUpdate = true

  }, [blocks])

  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter

  return (
    <instancedMesh
        castShadow receiveShadow
        ref={ref}
        args={[undefined, undefined, blocks.length]}
    >
      <boxGeometry args={[1, 1, 1]} />

      <meshStandardMaterial map={texture} />
    </instancedMesh>
  )
}