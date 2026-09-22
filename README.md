# RSweb - Roblox Studio Web

A lightweight, open-source web-based 3D editor inspired by Roblox Studio. Build 3D scenes, write Luau scripts, and import Roblox models — all in your browser.

## Features

- **3D Viewport** — Navigate, select, move, rotate, and scale objects with transform gizmos
- **Instance Hierarchy** — Explorer panel with tree view, drag-and-drop reparenting, context menus
- **Properties Inspector** — Edit Vector3, Color3, Enum, Bool, String, and Number properties in real-time
- **Roblox File Import** — Import .rbxm, .rbxl, .rbxmx, .rbxlx files (Release 2)
- **3D Format Import** — Import GLTF, OBJ, FBX models (Release 2)
- **Luau Scripts** — Write and execute Luau scripts with Roblox API simulation (Release 3)
- **Undo/Redo** — Full command history with fine-grained undo/redo
- **Multiple Layouts** — Toggle between 2015 Classic, 2026 Classic, and VS Code-style layouts
- **Dark/Light Themes** — Switch between dark and light editor themes
- **Keyboard Shortcuts** — Q/W/E/R for tools, Ctrl+Z/Y for undo/redo

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Development

```bash
# Install dependencies
bun install

# Start dev server
bun dev

# Open in browser
# http://localhost:3000
```

### Production Build

```bash
bun run build
bun run preview
```

## Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite + TypeScript |
| UI | React 19 + Tailwind CSS v4 |
| 3D | Three.js + React Three Fiber + Drei |
| State | Zustand |
| Panels | Allotment (resizable split panes) |
| Icons | Lucide React |

## Project Structure

```
src/
├── core/          # State management, command history
├── commands/      # Undoable action commands
├── panels/        # Editor UI panels (Hierarchy, Inspector, Console, Assets)
├── viewport/      # 3D rendering (Scene, Instance renderer, Gizmos)
├── components/    # Reusable UI components (Toolbar, TreeView, etc.)
├── importers/     # File format parsers (Release 2)
├── luau/          # Luau runtime integration (Release 3)
├── themes/        # Dark/Light theme system
└── types/         # TypeScript type definitions
```

## Roadmap

- [x] **Release 1** — Visual editor with 3D viewport, hierarchy, inspector, gizmos, undo/redo
- [ ] **Release 2** — Roblox file import (.rbxm/.rbxl/.rbxmx/.rbxlx) + GLTF/OBJ/FBX
- [ ] **Release 3** — Luau script execution with Roblox API simulation
- [ ] **Release 4** — Save/Load, Export, Polish, CI/CD
- [ ] **Release 5** — Roblox Open Cloud API integration

## Keyboard Shortcuts

| Key | Action |
|---|---|
| Q | Select tool |
| W | Move tool |
| E | Rotate tool |
| R | Scale tool |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Delete | Delete selected |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
