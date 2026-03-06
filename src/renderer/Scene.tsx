import { Canvas} from "@react-three/fiber";
import { Environment, OrbitControls, Stats } from "@react-three/drei";

export function Scene({children}: {children?: React.ReactNode}) {
    return (
        <Canvas shadows>
            <directionalLight
                position={[5,10,4]}
                castShadow
            />
            {children}
            <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="green" />
            </mesh>
            <Environment preset="city" />
            <OrbitControls />
            <Stats />
        </Canvas>
    );
}