const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const ren = new THREE.WebGLRenderer();
ren.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(ren.domElement);

window.addEventListener("resize", () => {
  ren.setSize(window.innerWidth, window.innerHeight);
  cam.aspect = window.innerWidth / window.innerHeight;
  cam.updateProjectionMatrix();
});

const vid = document.getElementById("video");
const vidInput = document.getElementById("videoInput");
const can = document.createElement("canvas");
const ctx = can.getContext("2d");

vidInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    vid.src = URL.createObjectURL(file);
    vid.play();
  }
});

let blocks = [];

function createBlocks() {
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      const geo = new THREE.BoxGeometry(0.1, 1, 0.1);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const cube = new THREE.Mesh(geo, mat);
      cube.position.set((x - 50) * 0.1, -(y - 50) * 0.1, 0);
      scene.add(cube);
      blocks.push(cube);
    }
  }
}

function updateBlocks() {
  ctx.drawImage(vid, 0, 0, 100, 100);
  const imgData = ctx.getImageData(0, 0, 100, 100).data;
  blocks.forEach((b, i) => {
    const r = imgData[i * 4];
    const g = imgData[i * 4 + 1];
    const bCol = imgData[i * 4 + 2];
    b.material.color.set(`rgb(${r},${g},${bCol})`);
  });
}

createBlocks();
cam.position.z = 5;

const keys = {};
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

function moveCam() {
  const speed = 0.1;
  const rotSpeed = 0.02;
  if (keys["w"]) cam.position.z -= speed;
  if (keys["s"]) cam.position.z += speed;
  if (keys["a"]) cam.position.x -= speed;
  if (keys["d"]) cam.position.x += speed;
  if (keys["q"]) cam.position.y -= speed;
  if (keys["e"]) cam.position.y += speed;
  if (keys["ArrowLeft"]) cam.rotation.y += rotSpeed;
  if (keys["ArrowRight"]) cam.rotation.y -= rotSpeed;
  if (keys["ArrowUp"]) cam.rotation.x += rotSpeed;
  if (keys["ArrowDown"]) cam.rotation.x -= rotSpeed;
}

function animate() {
  requestAnimationFrame(animate);
  moveCam();
  if (!vid.paused && !vid.ended) {
    updateBlocks();
  }
  ren.render(scene, cam);
}
animate();