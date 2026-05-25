# 🌊 Deep Ocean Explorer
### HTML5 Canvas Graphics Pipeline Demo

A multimedia application built with **HTML5 Canvas API**, **CSS**, and **vanilla JavaScript** that demonstrates the three core stages of the graphics pipeline: **Application**, **Geometry**, and **Rasterization**.

---

## 🔗 Live Demo

👉 [View Live on GitHub Pages]( https://james-muthama.github.io/ocean-graphics/)

---

## 📋 Assignment

**Course:** Multimedia & Graphics  
**Task:** Build a multimedia application using the HTML5 Canvas Graphics API that clearly demonstrates the application, geometry, and rasterization stages of the graphics pipeline.

---

## 🎮 Features

- 🚢 **Submarine** — follows your mouse with smooth interpolation, rotating propeller and sweeping spotlight
- 🐟 **Fish School** — 8 fish swimming with realistic tail-wiggle animation, wrap-around canvas
- 🪼 **Jellyfish (×2)** — pulsing bell domes with animated waving tentacles
- ⭐ **Starfish (×3)** — 5-point star polygons resting on the sea floor
- 🌿 **Seaweed (×10)** — Bezier-curved plants that sway in the current
- 💧 **Bubbles** — click anywhere or use the button to spawn bubble clusters
- ✨ **Plankton** — 60 bioluminescent drifting particles
- 🌊 **Caustic light rays** — animated surface light filtering through the water
- 🌑 **Deep Mode** — toggle a darker, deeper ocean atmosphere

---

## 🖥️ Controls

| Control | Action |
|---|---|
| **Mouse Move** | Guide the submarine |
| **Click on Canvas** | Spawn bubbles at click point |
| **⏸ Pause** | Freeze / resume the animation |
| **💧 Spawn Bubbles** | Release a burst of bubbles from the submarine |
| **Speed Slider** | Control animation speed (0.1× – 3×) |
| **🌑 Toggle Depth** | Switch between shallow and deep ocean lighting |

---

## 🔧 Graphics Pipeline Stages

The code is clearly commented to show where each pipeline stage occurs.

### 1. 🔴 Application Stage
> Manages all simulation state, game logic, physics, and user input. No drawing happens here.

- Mouse tracking and event listeners
- Object state updates (position, angle, phase)
- Physics: fish wrapping, bubble rising & fading, jellyfish drift
- FPS counter and HUD data updates
- `requestAnimationFrame` scheduling

### 2. 🟡 Geometry Stage
> Defines shapes using mathematical transformations — translate, rotate, scale — and builds vertex paths before any pixels are drawn.

- `ctx.translate()`, `ctx.rotate()`, `ctx.scale()` matrix transforms
- `ctx.save()` / `ctx.restore()` for isolated coordinate spaces
- Star polygon vertex computation (5-point starfish)
- Bezier curve chains for seaweed segments
- Sinusoidal wave offsets for fish tails and jellyfish tentacles
- `ctx.beginPath()`, `ctx.arc()`, `ctx.ellipse()`, `ctx.moveTo()`, `ctx.lineTo()`

### 3. 🟢 Rasterization Stage
> Converts geometry into actual pixels written to the canvas surface.

- `ctx.fill()` — fills defined paths with colour/gradient
- `ctx.stroke()` — draws path outlines
- `ctx.fillRect()` — fills rectangular regions
- `ctx.clearRect()` — clears the canvas each frame
- `createLinearGradient()` / `createRadialGradient()` — gradient colour fills
- Painter's algorithm: objects drawn back-to-front for correct layering

---

## 📁 File Structure

```
📦 repository
 ├── index.html       # Canvas element, HUD overlay, controls UI
 ├── style.css        # Layout, fonts, HUD, button styling
 ├── graphics.js      # Full graphics pipeline logic
 └── README.md        # This file
```

---

## 🛠️ Technologies Used

- **HTML5 Canvas 2D API** — all rendering
- **CSS3** — UI styling, Google Fonts (`Orbitron`, `Share Tech Mono`)
- **Vanilla JavaScript (ES6+)** — animation loop, physics, event handling
- No external libraries or frameworks

---

## 🚀 How to Run Locally

1. Clone or download this repository
2. Open `index.html` in any modern browser
3. No build step or server required

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
open index.html
```

---

## 📚 References

- [MDN Canvas API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [HTML5 Canvas Tutorial Playlist](https://www.youtube.com/playlist?list=PLN0tvDAN1yvSNbkHAwPzJ5O4pP_e2vyme)
- [Graphics Pipeline Reference](https://www.youtube.com/playlist?list=PLpPnRKq7eNW3We9VdCfx9fprhqXHwTPXL)
- Course example: [zmuti-class-labs/mmagraphics](https://github.com/zmuti-class-labs/mmagraphics)
