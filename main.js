import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//=============//
// 基本設定
//=============//

// シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 30, 50);
camera.lookAt(0, 0, 0);

// レンダラー
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// カメラ操作
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ライト
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(30, 40, 20);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 時間管理
const clock = new THREE.Clock();

// テクスチャローダー
const textureLoader = new THREE.TextureLoader();

//=============//
// テクスチャ読み込み
//=============//
// texturesフォルダ内の画像ファイルを指定します
const platformTexture = textureLoader.load('textures/platform_surface.jpg');
// テクスチャを繰り返す設定
platformTexture.wrapS = THREE.RepeatWrapping;
platformTexture.wrapT = THREE.RepeatWrapping;
platformTexture.repeat.set(20, 2); // 横に20回、縦に2回繰り返す

//=============//
// ジオラマ要素作成関数
//=============//

// 地面
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0xcccccc })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ホーム作成関数
function createPlatform() {
    const platformGroup = new THREE.Group();

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(120, 2, 8),
        new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    base.position.y = 1;
    base.castShadow = true;
    platformGroup.add(base);

    const surface = new THREE.Mesh(
        new THREE.BoxGeometry(120, 0.2, 8),
        new THREE.MeshStandardMaterial({ map: platformTexture }) // テクスチャを適用
    );
    surface.position.y = 2.1;
    surface.receiveShadow = true;
    platformGroup.add(surface);
    
    return platformGroup;
}

// ホームドア作成関数
function createPlatformScreenDoor(length = 5) {
    const doorGroup = new THREE.Group();
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.9 });

    const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(length / 2, 2.5, 0.2), doorMaterial);
    doorLeft.position.x = -length / 4;
    doorLeft.castShadow = true;
    doorGroup.add(doorLeft);
    
    const doorRight = new THREE.Mesh(new THREE.BoxGeometry(length / 2, 2.5, 0.2), doorMaterial);
    doorRight.position.x = length / 4;
    doorRight.castShadow = true;
    doorGroup.add(doorRight);
    
    doorGroup.userData.open = () => {
        gsap.to(doorLeft.position, { x: -length * 0.75, duration: 1.5, ease: "power2.inOut" });
        gsap.to(doorRight.position, { x: length * 0.75, duration: 1.5, ease: "power2.inOut" });
    };

    doorGroup.userData.close = () => {
        gsap.to(doorLeft.position, { x: -length / 4, duration: 1.5, ease: "power2.inOut" });
        gsap.to(doorRight.position, { x: length / 4, duration: 1.5, ease: "power2.inOut" });
    };

    return doorGroup;
}

// エレベータ作成関数
function createElevator() {
    const elevatorGroup = new THREE.Group();
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(4, 5, 4),
        new THREE.MeshStandardMaterial({ color: 0x7777ff })
    );
    box.position.y = 2.5;
    box.castShadow = true;
    elevatorGroup.add(box);
    
    elevatorGroup.userData.goToFloor = (floor) => {
        const targetY = floor === 1 ? 2.5 : 12.5;
        gsap.to(box.position, { y: targetY, duration: 3, ease: "quint.inOut" });
    };

    return elevatorGroup;
}

//=============//
// オブジェクトの配置とアニメーション設定
//=============//

// 1番線・2番線ホーム
const platform1_2 = createPlatform();
platform1_2.position.set(0, 0, -6);
scene.add(platform1_2);

// 3番線・4番線ホーム
const platform3_4 = createPlatform();
platform3_4.position.set(0, 0, 6);
scene.add(platform3_4);

// ホームドアを複数設置
const allDoors = [];
for (let i = 0; i < 5; i++) {
    const psd = createPlatformScreenDoor();
    psd.position.set(-25 + i * 12, 3.25, 1.9); // ホームの端に並べる
    platform3_4.add(psd);
    allDoors.push(psd);
}

// エレベータを設置
const elevator = createElevator();
elevator.position.set(40, 0, 0);
scene.add(elevator);


// アニメーションのテスト実行
setInterval(() => {
    // 3秒後にドアを開く
    setTimeout(() => {
        allDoors.forEach(door => door.userData.open());
    }, 3000);
    // 6秒後にドアを閉じる
    setTimeout(() => {
        allDoors.forEach(door => door.userData.close());
    }, 6000);
}, 10000); // 10秒ごとに繰り返す

setInterval(() => {
    elevator.userData.goToFloor(2); // 上へ
    setTimeout(() => {
        elevator.userData.goToFloor(1); // 下へ
    }, 5000);
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

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});