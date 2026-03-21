import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Stats } from "@react-three/drei";
import { StaticShadows } from "./StaticShadows";

export function Scene({children}: {children?: React.ReactNode}) {

    return (
        <Canvas shadows camera={{ position: [-10, 10, 3.4]}}>
            <StaticShadows/>
            <directionalLight
                position={[45,90,36]}
                intensity={2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-near={0.5}
                shadow-camera-far={200}
                shadow-camera-left={-30}
                shadow-camera-right={30}
                shadow-camera-top={30}
                shadow-camera-bottom={-30}>
            </directionalLight>
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