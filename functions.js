import * as THREE from 'three';

// テクスチャは main.js から渡してもらう形も良いですが、
// ここで一括で読み込むのも分かりやすいです。
const textureLoader = new THREE.TextureLoader();
const platformTexture = textureLoader.load('textures/platform_surface.jpg');
platformTexture.wrapS = THREE.RepeatWrapping;
platformTexture.wrapT = THREE.RepeatWrapping;
platformTexture.repeat.set(20, 2);

/**
 * ホームを作成する関数
 * @returns {THREE.Group} ホームの3Dオブジェクト
 */
export function createPlatform() {
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
        new THREE.MeshStandardMaterial({ map: platformTexture })
    );
    surface.position.y = 2.1;
    surface.receiveShadow = true;
    platformGroup.add(surface);
    
    return platformGroup;
}

/**
 * ホームドアを作成する関数
 * @param {number} length - ドアの横幅
 * @returns {THREE.Group} ホームドアの3Dオブジェクト
 */
export function createPlatformScreenDoor(length = 5) {
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
    
    // GSAPはグローバルに読み込まれているので、ここでも使えます
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

/**
 * エレベータを作成する関数
 * @returns {THREE.Group} エレベータの3Dオブジェクト
 */
export function createElevator() {
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