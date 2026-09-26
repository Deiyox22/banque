import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { BOARD, GROUP_COLORS, Tile } from "./board";

const TILE_SIZE = 1.8;
const BOARD_HALF = 5 * TILE_SIZE;
const TILE_HEIGHT = 0.25;

function tileGridPos(id: number): { x: number; z: number } {
  if (id === 0) return { x: 5, z: -5 };
  if (id <= 9) return { x: 5 - id, z: -5 };
  if (id === 10) return { x: -5, z: -5 };
  if (id <= 19) return { x: -5, z: -5 + (id - 10) };
  if (id === 20) return { x: -5, z: 5 };
  if (id <= 29) return { x: -5 + (id - 20), z: 5 };
  if (id === 30) return { x: 5, z: 5 };
  return { x: 5, z: 5 - (id - 30) };
}

export function tileWorldPos(id: number): THREE.Vector3 {
  const g = tileGridPos(id);
  return new THREE.Vector3(g.x * TILE_SIZE, TILE_HEIGHT, g.z * TILE_SIZE);
}

function makeTileTexture(tile: Tile): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, "#faf3e2");
  bgGrad.addColorStop(1, "#efe4c8");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const typeColors: Record<string, string> = {
    go: "#ffd54a",
    jail: "#e08a3c",
    "free-parking": "#7fd18a",
    "go-to-jail": "#e05c5c",
    chance: "#ff8fd1",
    chest: "#8fc7ff",
    tax: "#c9c9c9",
    railroad: "#333333",
    utility: "#dddddd",
  };

  if (tile.group) {
    const bandGrad = ctx.createLinearGradient(0, 0, 0, 64);
    const hex = `#${GROUP_COLORS[tile.group].toString(16).padStart(6, "0")}`;
    bandGrad.addColorStop(0, hex);
    bandGrad.addColorStop(1, shadeColor(hex, -18));
    ctx.fillStyle = bandGrad;
    ctx.fillRect(0, 0, canvas.width, 64);
    ctx.strokeStyle = "#00000025";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 62, canvas.width, 2);
  } else if (typeColors[tile.type]) {
    const bandGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bandGrad.addColorStop(0, typeColors[tile.type]);
    bandGrad.addColorStop(1, shadeColor(typeColors[tile.type], -15));
    ctx.fillStyle = bandGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.strokeStyle = "#00000035";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = tile.type === "railroad" ? "#ffffff" : "#161616";
  ctx.font = "bold 20px Arial";
  const words = tile.name.split(" ");
  let lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > 220) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const startY = tile.group ? 110 : 120;
  lines.forEach((l, i) => {
    ctx.fillText(l, canvas.width / 2, startY + i * 26);
  });

  if (tile.price) {
    ctx.font = "bold 18px Arial";
    ctx.fillText(`${tile.price} M`, canvas.width / 2, 225);
  }
  if (tile.taxAmount) {
    ctx.font = "bold 18px Arial";
    ctx.fillText(`${tile.taxAmount} M`, canvas.width / 2, 225);
  }
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + Math.round((percent / 100) * 255)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round((percent / 100) * 255)));
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round((percent / 100) * 255)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

interface TokenEntry {
  mesh: THREE.Group;
  playerIndex: number;
}

const DIE_FACE_VALUES = [1, 6, 2, 5, 3, 4]; // matches BoxGeometry material order: +X -X +Y -Y +Z -Z
const DIE_FACE_NORMALS = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
];

function makePipTexture(value: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#00000022";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  const pipRadius = 11;
  const pipColor = value === 1 || value === 4 ? "#c0392b" : "#111111";
  ctx.fillStyle = pipColor;

  const positions: Record<number, [number, number][]> = {
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
    6: [[0.28, 0.22], [0.72, 0.22], [0.28, 0.5], [0.72, 0.5], [0.28, 0.78], [0.72, 0.78]],
  };

  for (const [px, py] of positions[value]) {
    ctx.beginPath();
    ctx.arc(px * size, py * size, pipRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#1a3a5c");
  grad.addColorStop(0.55, "#0d2038");
  grad.addColorStop(1, "#050b16");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(0,0,0,0.45)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function quaternionForDieValue(value: number): THREE.Quaternion {
  const faceIdx = DIE_FACE_VALUES.indexOf(value);
  const normal = DIE_FACE_NORMALS[faceIdx];
  const q = new THREE.Quaternion().setFromUnitVectors(normal, new THREE.Vector3(0, 1, 0));
  const spin = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
  return spin.multiply(q);
}

type TokenShape = "hat" | "car" | "dog" | "boot";
const TOKEN_SHAPES: TokenShape[] = ["hat", "car", "dog", "boot"];

function buildTokenMesh(shape: TokenShape, color: number): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.35 });

  if (shape === "hat") {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.08, 24), mat);
    brim.position.y = 0.1;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.55, 24), mat);
    crown.position.y = 0.42;
    group.add(brim, crown);
  } else if (shape === "car") {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.45), mat);
    body.position.y = 0.24;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.24, 0.4), mat);
    cabin.position.set(-0.05, 0.48, 0);
    const wheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const wheelPositions: [number, number][] = [
      [-0.32, 0.24],
      [-0.32, -0.24],
      [0.32, 0.24],
      [0.32, -0.24],
    ];
    for (const [x, z] of wheelPositions) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.12, z);
      group.add(wheel);
    }
    group.add(body, cabin);
  } else if (shape === "dog") {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.28), mat);
    body.position.y = 0.28;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), mat);
    head.position.set(0.38, 0.36, 0);
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 12), mat);
    snout.rotation.z = -Math.PI / 2;
    snout.position.set(0.52, 0.34, 0);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.3, 8), mat);
    tail.rotation.z = Math.PI / 3;
    tail.position.set(-0.34, 0.44, 0);
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8);
    const legPositions: [number, number][] = [
      [-0.22, 0.1],
      [-0.22, -0.1],
      [0.22, 0.1],
      [0.22, -0.1],
    ];
    for (const [x, z] of legPositions) {
      const leg = new THREE.Mesh(legGeo, mat);
      leg.position.set(x, 0.11, z);
      group.add(leg);
    }
    group.add(body, head, snout, tail);
  } else if (shape === "boot") {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.26), mat);
    foot.position.set(0.08, 0.11, 0);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.5, 0.24), mat);
    leg.position.set(-0.15, 0.36, 0);
    group.add(foot, leg);
  }

  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) obj.castShadow = true;
  });

  const shadowMat = new THREE.MeshBasicMaterial({
    map: makeContactShadowTexture(),
    transparent: true,
    depthWrite: false,
  });
  const shadowBlob = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), shadowMat);
  shadowBlob.rotation.x = -Math.PI / 2;
  shadowBlob.position.y = 0.01;
  group.add(shadowBlob);

  return group;
}

export class Board3D {
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  tokens: TokenEntry[] = [];
  ownershipMarkers: Map<number, THREE.Mesh> = new Map();
  houseMeshes: Map<number, THREE.Group> = new Map();
  dice: THREE.Mesh[] = [];
  private diceSpinning = false;
  private diceSpinTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    const sky = makeSkyTexture();
    sky.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.background = sky;
    this.scene.fog = new THREE.Fog(0x0d2038, 30, 55);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 17, 20);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI / 2.15;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 40;
    this.controls.target.set(0, 0, 0);

    this.setupLights();
    this.buildBoard();
    this.buildDice();

    window.addEventListener("resize", () => this.onResize());
  }

  private setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff4e0, 1.4);
    sun.position.set(12, 25, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -25;
    sun.shadow.camera.right = 25;
    sun.shadow.camera.top = 25;
    sun.shadow.camera.bottom = -25;
    sun.shadow.radius = 3;
    sun.shadow.bias = -0.0015;
    this.scene.add(sun);

    const fill = new THREE.PointLight(0xffe9b0, 0.5);
    fill.position.set(-10, 10, -10);
    this.scene.add(fill);

    const rim = new THREE.PointLight(0x8fc7ff, 0.35);
    rim.position.set(6, 8, -14);
    this.scene.add(rim);
  }

  private buildBoard() {
    const centerGeo = new THREE.BoxGeometry(BOARD_HALF * 2 - TILE_SIZE * 1.6, 0.15, BOARD_HALF * 2 - TILE_SIZE * 1.6);
    const centerMat = new THREE.MeshStandardMaterial({ color: 0x1c6b3a, roughness: 0.85 });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    centerMesh.position.set(0, 0.05, 0);
    centerMesh.receiveShadow = true;
    this.scene.add(centerMesh);

    const logoCanvas = document.createElement("canvas");
    logoCanvas.width = 512;
    logoCanvas.height = 512;
    const lctx = logoCanvas.getContext("2d")!;
    lctx.fillStyle = "#1c6b3a";
    lctx.fillRect(0, 0, 512, 512);
    lctx.translate(256, 256);
    lctx.rotate(-Math.PI / 4);
    lctx.fillStyle = "#ffd54a";
    lctx.font = "bold 70px Arial";
    lctx.textAlign = "center";
    lctx.fillText("MONOPOLY", 0, 20);
    lctx.font = "bold 26px Arial";
    lctx.fillText("3D EDITION", 0, 60);
    const logoTex = new THREE.CanvasTexture(logoCanvas);
    logoTex.colorSpace = THREE.SRGBColorSpace;
    const logoMat = new THREE.MeshStandardMaterial({ map: logoTex });
    const logoGeo = new THREE.PlaneGeometry(BOARD_HALF * 1.1, BOARD_HALF * 1.1);
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.rotation.x = -Math.PI / 2;
    logoMesh.position.set(0, 0.13, 0);
    this.scene.add(logoMesh);

    for (const tile of BOARD) {
      const isCorner = tile.id % 10 === 0;
      const size = isCorner ? TILE_SIZE * 1.35 : TILE_SIZE;
      const geo = new THREE.BoxGeometry(size * 0.96, TILE_HEIGHT, size * 0.96);
      const tex = makeTileTexture(tile);
      const sideMat = new THREE.MeshStandardMaterial({ color: 0xece0c8 });
      const topMat = new THREE.MeshStandardMaterial({ map: tex });
      const mats = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
      const mesh = new THREE.Mesh(geo, mats);
      const pos = tileWorldPos(tile.id);
      mesh.position.set(pos.x, TILE_HEIGHT / 2, pos.z);

      const rotationMap: Record<string, number> = {};
      if (tile.id >= 1 && tile.id <= 9) mesh.rotation.y = 0;
      else if (tile.id >= 11 && tile.id <= 19) mesh.rotation.y = Math.PI / 2;
      else if (tile.id >= 21 && tile.id <= 29) mesh.rotation.y = Math.PI;
      else if (tile.id >= 31 && tile.id <= 39) mesh.rotation.y = -Math.PI / 2;

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.tileId = tile.id;
      this.scene.add(mesh);
    }

    const border = new THREE.Mesh(
      new THREE.RingGeometry(BOARD_HALF + TILE_SIZE * 0.55, BOARD_HALF + TILE_SIZE * 0.75, 4, 1),
      new THREE.MeshStandardMaterial({ color: 0x0e3320, side: THREE.DoubleSide })
    );
    border.rotation.x = -Math.PI / 2;
    border.position.y = 0.02;
    border.rotation.z = Math.PI / 4;
    this.scene.add(border);
  }

  private buildDice() {
    const pipTextures = DIE_FACE_VALUES.map((v) => makePipTexture(v));
    for (let i = 0; i < 2; i++) {
      const geo = new RoundedBoxGeometry(0.9, 0.9, 0.9, 4, 0.12);
      const mats = pipTextures.map(
        (tex) => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25, metalness: 0.05 })
      );
      const die = new THREE.Mesh(geo, mats);
      die.castShadow = true;
      die.position.set(i === 0 ? -0.7 : 0.7, 4, 0);
      this.dice.push(die);
      this.scene.add(die);
    }
  }

  rollDiceAnimation(values: [number, number], onSettled: () => void) {
    this.diceSpinning = true;
    this.diceSpinTime = 0;
    const duration = 900;
    const start = performance.now();
    const targetQuats = values.map((v) => quaternionForDieValue(v));
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      for (let i = 0; i < this.dice.length; i++) {
        const die = this.dice[i];
        if (t < 0.85) {
          die.rotation.x += 0.35;
          die.rotation.y += 0.28;
          die.position.y = 4 + Math.sin(elapsed / 80) * 0.3;
        } else {
          const settleT = (t - 0.85) / 0.15;
          die.quaternion.slerp(targetQuats[i], settleT);
          die.position.y = 4 - settleT * 3.4;
        }
      }
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        this.diceSpinning = false;
        for (let i = 0; i < this.dice.length; i++) {
          this.dice[i].quaternion.copy(targetQuats[i]);
          this.dice[i].position.y = 0.6;
        }
        onSettled();
      }
    };
    requestAnimationFrame(tick);
  }

  createToken(playerIndex: number, color: number) {
    const shape = TOKEN_SHAPES[playerIndex % TOKEN_SHAPES.length];
    const group = buildTokenMesh(shape, color);

    const pos = tileWorldPos(0);
    const offsetAngle = (playerIndex / 4) * Math.PI * 2;
    group.position.set(pos.x + Math.cos(offsetAngle) * 0.4, TILE_HEIGHT, pos.z + Math.sin(offsetAngle) * 0.4);

    this.scene.add(group);
    this.tokens.push({ mesh: group, playerIndex });
  }

  private tokenOffset(playerIndex: number): { x: number; z: number } {
    const angle = (playerIndex / 4) * Math.PI * 2;
    return { x: Math.cos(angle) * 0.4, z: Math.sin(angle) * 0.4 };
  }

  async animateTokenMove(playerIndex: number, path: number[], stepDurationMs = 260): Promise<void> {
    const entry = this.tokens.find((t) => t.playerIndex === playerIndex);
    if (!entry) return;
    const offset = this.tokenOffset(playerIndex);

    for (const tileId of path) {
      const target = tileWorldPos(tileId);
      const targetPos = new THREE.Vector3(target.x + offset.x, TILE_HEIGHT, target.z + offset.z);
      await this.tweenTokenTo(entry.mesh, targetPos, stepDurationMs);
    }
  }

  private tweenTokenTo(mesh: THREE.Group, target: THREE.Vector3, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startPos = mesh.position.clone();
      const start = performance.now();
      const jumpHeight = 0.6;

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        mesh.position.lerpVectors(startPos, target, ease);
        mesh.position.y = TILE_HEIGHT + Math.sin(Math.PI * t) * jumpHeight;
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          mesh.position.y = TILE_HEIGHT;
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  markOwnership(tileId: number, color: number) {
    let marker = this.ownershipMarkers.get(tileId);
    if (!marker) {
      const geo = new THREE.BoxGeometry(TILE_SIZE * 0.25, 0.5, TILE_SIZE * 0.25);
      const mat = new THREE.MeshStandardMaterial({ color });
      marker = new THREE.Mesh(geo, mat);
      const pos = tileWorldPos(tileId);
      marker.position.set(pos.x + TILE_SIZE * 0.32, 0.5, pos.z + TILE_SIZE * 0.32);
      marker.castShadow = true;
      this.scene.add(marker);
      this.ownershipMarkers.set(tileId, marker);
    } else {
      (marker.material as THREE.MeshStandardMaterial).color.setHex(color);
    }
  }

  updateHouses(tileId: number, count: number) {
    const existing = this.houseMeshes.get(tileId);
    if (existing) {
      this.scene.remove(existing);
      existing.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
        }
      });
      this.houseMeshes.delete(tileId);
    }
    if (count <= 0) return;

    const pos = tileWorldPos(tileId);
    const toCenter = new THREE.Vector3(-pos.x, 0, -pos.z).normalize();
    const inward = new THREE.Vector3(pos.x, 0, pos.z).add(toCenter.clone().multiplyScalar(TILE_SIZE * 0.32));
    const perp = new THREE.Vector3(-toCenter.z, 0, toCenter.x);

    const group = new THREE.Group();

    if (count >= 5) {
      const hotelMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.45, metalness: 0.1 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.4), hotelMat);
      body.position.set(inward.x, TILE_HEIGHT + 0.2, inward.z);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
    } else {
      const houseMat = new THREE.MeshStandardMaterial({ color: 0x2e8b45, roughness: 0.6 });
      const roofMat = new THREE.MeshStandardMaterial({ color: 0xa83232, roughness: 0.55 });
      for (let i = 0; i < count; i++) {
        const houseGroup = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.2), houseMat);
        body.position.y = 0.075;
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.14, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 0.15 + 0.07;
        houseGroup.add(body, roof);
        houseGroup.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });
        const spread = (i - (count - 1) / 2) * 0.24;
        houseGroup.position.set(
          inward.x + perp.x * spread,
          TILE_HEIGHT,
          inward.z + perp.z * spread
        );
        group.add(houseGroup);
      }
    }

    this.scene.add(group);
    this.houseMeshes.set(tileId, group);
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

export function computePathBetween(from: number, to: number, boardSize: number): number[] {
  const path: number[] = [];
  let cur = from;
  while (cur !== to) {
    cur = (cur + 1) % boardSize;
    path.push(cur);
  }
  return path;
}
