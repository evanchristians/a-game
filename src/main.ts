import { Application, Sprite } from "pixi.js";
import "./styles/global.css";

const app = new Application({
  height: window.innerHeight,
  width: (window.innerHeight * 4) / 3,
  backgroundAlpha: 0,
});

document.body.appendChild(app.view as unknown as Node);

const char = Sprite.from("https://unsplash.it/100/100");
const ball = Sprite.from("https://unsplash.it/50/50");

app.stage.addChild(char);
app.stage.addChild(ball);

let mouseY = 0;
let mouseX = 0;

document.querySelector("canvas")?.addEventListener("mousemove", (e) => {
  mouseX = e.offsetX;
  mouseY = e.offsetY;
});

const chase = (target: { x: number; y: number }, speed: number) => {
  const dx = target.x - char.x;
  const dy = target.y - char.y;
  const angle = Math.atan2(dy, dx);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  char.x += Math.round(vx);
  char.y += Math.round(vy);
};

const isWithin = (target: { x: number; y: number }, range: number) => {
  const dx = target.x - char.x;
  const dy = target.y - char.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < range;
};

const useInDanger = (isWithin: boolean) => {
  if (isWithin) {
    // document.body.style.background = "url('https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Trollface_non-free.png/220px-Trollface_non-free.png')";
  } else {
    document.body.style.background = "#fff";
  }
};

let chaseSpeed = 5;

const BASE_SPEED = 10;
let speed = BASE_SPEED;

const controls = {
  up: {
    keys: ["ArrowUp", "w"],
    motionDelta: () => ({ x: 0, y: -speed }),
    pressed: false,
  },
  down: {
    keys: ["ArrowDown", "s"],
    motionDelta: () => ({ x: 0, y: speed }),
    pressed: false,
  },
  left: {
    keys: ["ArrowLeft", "a"],
    motionDelta: () => ({ x: -speed, y: 0 }),
    pressed: false,
  },
  right: {
    keys: ["ArrowRight", "d"],
    motionDelta: () => ({ x: speed, y: 0 }),
    pressed: false,
  },
};

const velocity = {
  x: 0,
  y: 0,
};

const setVelocity = ({ x, y }: { x: number; y: number }) => {
  velocity.x += x;
  velocity.y += y;
};

window.addEventListener("keydown", (e) => {
  if (e.key === "Shift") {
    speed = BASE_SPEED * 2;
  }
  for (const control of Object.values(controls)) {
    if (control.keys.includes(e.key)) {
      if (control.pressed) return;
      control.pressed = true;
      setVelocity(control.motionDelta());
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "Shift") {
    speed = BASE_SPEED;
  }
  for (const control of Object.values(controls)) {
    if (control.keys.includes(e.key)) {
      control.pressed = false;
      const { x, y } = control.motionDelta();
      setVelocity({ x: -x, y: -y });
    }
  }
});

let shooting = false;

const shoot = () => {
  const bullet = Sprite.from("https://unsplash.it/110/11s0");
  bullet.x = ball.x;
  bullet.y = ball.y;
  app.stage.addChild(bullet);
  const dx = mouseX - ball.x;
  const dy = mouseY - ball.y;
  const angle = Math.atan2(dy, dx);
  const vx = Math.cos(angle) * 10;
  const vy = Math.sin(angle) * 10;
  const move = () => {
    bullet.x += vx;
    bullet.y += vy;
  };
  app.ticker.add(move);
  setTimeout(() => {
    app.ticker.remove(move);
    app.stage.removeChild(bullet);
  }, 1000);
};

const startShooting = (rate: number) => {
  shooting = true;
  const interval = setInterval(() => {
    if (!shooting) {
      clearInterval(interval);
    }
    shoot();
  }, rate);
};

const stopShooting = () => {
  shooting = false;
};

window.addEventListener("mousedown", () => {
  startShooting(100);
});
window.addEventListener("mouseup", () => {
  stopShooting();
});
const useMove = () => {
  ball.x += velocity.x;
  ball.y += velocity.y;
};

app.ticker.add((dt) => {
  useInDanger(isWithin(ball, 50));
  useMove();
  if (!isWithin(ball, 50)) {
    chase(ball, chaseSpeed);
  } else {
    chaseSpeed = 5;
  }
});
