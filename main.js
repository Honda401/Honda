import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// functions.jsから、必要な関数だけをインポートする
import { createPlatform, createPlatformScreenDoor, createElevator } from './functions.js';


//=============//
// 基本設定 (シーン、カメラ、レンダラー、ライトなど)
//=============//
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 30, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(30, 40, 20);
directionalLight.castShadow = true;
scene.add(directionalLight);


//=============//
// ジオラマの組み立て
//=============//
// 地面
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0xcccccc })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ホームの作成 (functions.jsの関数を呼び出すだけ！)
const platform1_2 = createPlatform();
platform1_2.position.set(0, 0, -6);
scene.add(platform1_2);

const platform3_4 = createPlatform();
platform3_4.position.set(0, 0, 6);
scene.add(platform3_4);

// ホームドアの設置
const allDoors = [];
for (let i = 0; i < 5; i++) {
    const psd = createPlatformScreenDoor();
    psd.position.set(-25 + i * 12, 3.25, 1.9);
    platform3_4.add(psd);
    allDoors.push(psd);
}

// エレベータの設置
const elevator = createElevator();
elevator.position.set(40, 0, 0);
scene.add(elevator);


//=============//
// アニメーションの制御
//=============//
setInterval(() => {
    setTimeout(() => allDoors.forEach(door => door.userData.open()), 3000);
    setTimeout(() => allDoors.forEach(door => door.userData.close()), 6000);
}, 10000);

setInterval(() => {
    elevator.userData.goToFloor(2);
    setTimeout(() => elevator.userData.goToFloor(1), 5000);
}, 10000);


//=============//
// アニメーションループ
//=============//
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();


//=============//
// イベントリスナー
//=============//
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});