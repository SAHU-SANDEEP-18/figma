## Figma-Style Design Tool (DOM-Only Version)

This is a mini version of a visual design editor inspired by Figma — built completely using plain HTML, CSS, and vanilla JavaScript (no canvas, no SVG libraries, no React/Vue — nothing external).

### What it does
- You can add **rectangles** and **text boxes** on a canvas
- Click to select an element → shows blue outline + 4 corner resize handles + 1 rotate handle on top
- Drag elements around (can't go outside canvas)
- Resize from corners (minimum size enforced)
- Rotate elements by dragging the top handle
- Edit width, height, background color, text content, text color, font size, font weight, text alignment
- Arrow keys move selected element by 5px, Delete removes it, Escape deselects
- Layers panel on left — click any layer to select, Up/Down buttons to change order
- Dark mode toggle
- Save/load using localStorage (persists on refresh)
- Export as JSON or simple HTML

### Why I built it this way
The goal was to show strong understanding of:
- DOM manipulation
- Mouse event handling (drag, resize, rotate)
- Coordinate calculations & boundary clamping
- State management (selected element, layers order)
- Real-time UI updates
- localStorage persistence

All without using any rendering engines or frameworks — just pure JavaScript.

### How to run
1. Open `index.html` in any modern browser
2. Click "Rectangle" or "Text" to start adding elements
3. Play around — drag, resize, rotate, change colors/text
4. Refresh page → your design is still there (thanks to localStorage)

### Tech stack
- HTML + CSS (vanilla)
- Pure JavaScript (no libraries)
- Remixicon for icons

Built as a foundation-level project from Sheriyans Coding School guidelines.

Feel free to fork, improve, or use it as reference!
