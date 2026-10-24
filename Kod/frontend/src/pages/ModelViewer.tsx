import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader, OrbitControls } from "three-stdlib";

interface ViewerProps {
  filePath: string;
}

const ModelViewer: React.FC<ViewerProps> = ({ filePath }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    mount.innerHTML = "";

    const scene = new THREE.Scene();
    scene.background = null;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 10000);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    mount.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.enableZoom = true;
    controls.enablePan = true;

    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;

    const url = filePath.replace(/\\/g, "/");

    if (!url.toLowerCase().endsWith(".glb")) {
      console.log("Only .glb files are supported");
      return;
    }

    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        box.getSize(size);
        box.getCenter(center);

        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        const maxSize = Math.max(size.x, size.y, size.z);

        const fitHeightDistance =
          maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));

        const fitWidthDistance = fitHeightDistance / camera.aspect;

        const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.8;

        camera.position.set(0, maxSize * 0.25, distance);

        camera.near = distance / 100;
        camera.far = distance * 100;

        camera.updateProjectionMatrix();

        controls.target.set(0, 0, 0);
        controls.update();
      },
      undefined,
      (error) => {
        console.log("Error loading model: ", error);
      },
    );

    const resizeObserver = new ResizeObserver(() => {
      const newWidth = mount.clientWidth || 600;
      const newHeight = mount.clientHeight || 500;

      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    });

    resizeObserver.observe(mount);

    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.innerHTML = "";
    };
  }, [filePath]);

  return <div ref={mountRef} className="model-viewer" />;
};

export default ModelViewer;
