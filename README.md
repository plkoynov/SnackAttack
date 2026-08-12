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

- **HTML5 Canvas** — Game rendering
- **Vanilla JavaScript** — Game logic and state management
- **CSS3** — UI styling and animations
- **SVG** — Obstacle and character graphics

## 🚀 Getting Started

1. Open `index.html` in your web browser
2. Enter your name
3. Select your character avatar
4. Click "Grab a Snack" to start
5. Navigate through the office!

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

---

**Made with ❤️ for office workers everywhere**

Enjoy your snack run! 🍰🥐
