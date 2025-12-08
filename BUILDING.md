# Building
To build a distributable binary, follow these steps (from the project root):
1. Install Dependencies, e.g. `pnpm`, `pyinstaller`
2. Build the frontend with `pnpm run build:frontend`
3. Build the distributable with `pyinstaller main.spec` 
4. ???
5. Profit!

The built binary is in `dist/main/` and is named `main`.
