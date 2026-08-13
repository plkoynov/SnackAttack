# 🏢 Snack Attack

A fast-paced, arcade-style browser game where you rush through an office to grab treats in the break room!

## 🎮 Game Overview

Navigate through an office environment filled with obstacles. Jump over office chairs and trash bins, crawl under desks, and collect tasty treats to manage your speed. Sweets speed you up, sours slow you down — balance your power-ups to reach the break room!

## 🕹️ How to Play

### Controls

**Desktop:**

- **↑ or Space** — Jump
- **↓** — Crawl (hold to continue crawling)

**Mobile:**

- **JUMP** button — Jump
- **CRAWL** button — Crawl (hold to continue crawling)

### Game Mechanics

- **Distance** — Measure how far you've run in meters
- **Sweets (Cakes)** 🎂 — Collect to fill the cake meter and speed up
- **Sours (Croissants)** 🥐 — Collect to fill the croissant meter and slow down
- **Obstacles:**
  - **Office Chairs** — Jump over them
  - **Trash Bins** — Jump over them
  - **Desks** — Crawl underneath them

When either meter reaches 100%, the effect triggers automatically and the meter resets!

## 📊 Features

- **Dynamic Difficulty** — Speed increases as you progress
- **Responsive Design** — Play on desktop or mobile
- **Avatar Selection** — Choose your character (Boy or Girl)
- **Local High Score Tracking** — Your best distance is saved in your browser
- **Smooth Animations** — Fluid character movement and sprite animations
- **Sound-Free Gameplay** — Perfect for office play

## 📁 Project Structure

```
RestaurantRunner/
├── index.html              # Main game file
├── styles.css              # Game styling
├── main.js                 # Game logic and mechanics
├── public/
│   ├── chair.svg          # Office chair obstacle sprite
│   ├── desk.svg           # Office desk obstacle with monitor
│   └── bin.svg            # Trash bin obstacle sprite
└── README.md              # This file
```

## 🛠️ Technologies

- **[PixiJS](https://pixijs.com/)** — WebGL-based 2D rendering (loaded via CDN)
- **Vanilla JavaScript** — Game logic and state management
- **CSS3** — UI styling and animations
- **SVG** — Obstacle and character graphics

## 🚀 Getting Started

Serve the folder over HTTP rather than opening `index.html` directly (`file://`) —
some browsers (notably Firefox) block WebGL from uploading locally-loaded
SVG images as textures under `file://`, which breaks the obstacle art. Any
static server works, e.g.:

```
python3 -m http.server 8000
```

Then:

1. Open the served page (e.g. `http://localhost:8000`) in your web browser
2. Select your character avatar
3. Click "Grab a Snack" to start
4. Navigate through the office!

## 🎯 Tips & Strategies

- **Collect treats strategically** — Don't just grab everything; manage your speed
- **Mix your power-ups** — Balance cakes and croissants to control your pace
- **Timing matters** — Jump early to avoid obstacles
- **Crawl wisely** — Use crawl mode only when necessary to save energy
- **Practice** — The game gets faster as you progress, so keep improving!

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Local High Score

Your high score is automatically saved in your browser's local storage. Clear your browser data if you want to reset it.

## 🎨 Customization

You can customize the game by editing:

- **colors** in `styles.css` (look for CSS variables like `--gold`, `--coral`, etc.)
- **physics** in `main.js` (gravity, jump velocity, speed ramp)
- **spawn rates** in `main.js` (obstacle frequencies, pastry spawn heights)

## 🐛 Known Issues & Limitations

- No sound effects (audio not yet implemented)
- High score only stored locally (no cloud save)
- Single-player only

## 🤝 Contributing

Found a bug or have a suggestion? Feel free to open an issue or submit a pull request!

## 📜 Credits & Third-Party Licenses

This game uses [PixiJS](https://pixijs.com/) for rendering, licensed under the
MIT License:

> Copyright (c) 2013-2023 Mathew Groves, Chad Engler
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to
> deal in the Software without restriction, including without limitation the
> rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
> sell copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.

---

**Made with ❤️ for office workers everywhere**

Enjoy your snack run! 🍰🥐
