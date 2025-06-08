# @react-three/fiber port of the DVB-I Reference Client

This project contains a PWA (Progressive Web App) that implements similar functionality to the DVB-I Reference Client PWA frontend (`DVB-I-Reference-Client/frontend/android/`). It's built using React Three Fiber, which makes this incompatible with devices that do not support WebGL. It's written entirely in TypeScript. The XML parsing functionality has been ported with some AI assistance, so there might be issues.

Some of the libraries being used might be unknown to you, here's a brief overview:
- [@react-three/fiber](https://github.com/pmndrs/react-three-fiber): A React renderer for [Three.js](https://threejs.org/), allowing for a declarative way to build 3D scenes in React. It supports all the functionality of Three.js.
- [@react-three/uikit](https://github.com/pmndrs/uikit): A UI toolkit with CSS-like styling (uses Yoga for layout) which allows building performant 3D user interfaces in React Three Fiber. 
- [zustand](https://github.com/pmndrs/zustand): A quite nice state management solution for React. I tried to keep all the shared state in a zustand store, and only use React state for local component state, avoiding unnecessary re-renders.
- [@preact/signals](https://github.com/preactjs/signals): Performant state management library, can be used used with `@react-three/uikit` for updating UI props without triggering re-renders.

Apart from the above, I've also set up eslint and prettier, along with the necessary plugins for React, TypeScript... It's a bit complicated but it's working. 

# Getting Started

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/acrilique/dvbi-r3f-client.git
cd dvbi-r3f-client
npm install
```

Then, you can start the development server which will be available via https:

```bash
npm run dev
```

When publishing this to a GitHub repository, it will automatically deploy to GitHub Pages (if you selected Source: GitHub Actions under Settings>Pages). You can also build the project for production locally:

```bash
npm run build
```

# Contributing

All contributions are welcome! Please open an issue or a pull request if you find any bugs or have suggestions for improvements.