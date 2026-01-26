# Building
To build a distributable binary, follow these steps (from the project root):
1. Install frontend dependencies: `cd frontend && pnpm install`
2. Build the frontend: `pnpm run build:frontend`
3. Install backend dependencies and PyInstaller: `uv pip install --system ./backend pyinstaller`
4. Build the distributable: `pyinstaller main.spec`

The built binary is in `dist/arma_server_manager/` and is named `arma_server_manager`.
