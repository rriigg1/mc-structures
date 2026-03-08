import { Canvas} from "@react-three/fiber";
import { Environment, OrbitControls, Stats } from "@react-three/drei";
import * as THREE from "three";
import { Camera } from "three";

export function Scene({children}: {children?: React.ReactNode}) {
    const geometry = new THREE.BoxGeometry(0.25, 4, 0.25)

    geometry.translate(0, 4, 0)

    // test rotations
    geometry.rotateX(THREE.MathUtils.degToRad(45))


    const camera = new Camera()
    camera.position.set(5, 5, 0)
    camera.lookAt(0, 0, 0)

    return (
        <Canvas shadows camera={{ position: [-10, 10, 3.4]}}>
            <directionalLight
                position={[15,30,12]}
                castShadow />
            {children}
            <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="green" />
            </mesh>
            <Environment preset="forest" />
            <OrbitControls target={[3.5,2,3.5]}/>
            <Stats />
        </Canvas>
    );
}