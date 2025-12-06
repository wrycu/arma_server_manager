"""Build wheel distribution using uv."""

import os
import shutil
import subprocess
import sys
from pathlib import Path


def main():
    """Build frontend and create wheel package."""
    # Script is in scripts/, project root is one level up
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)

    # Build frontend
    print("Building frontend...")
    try:
        subprocess.run(["pnpm", "run", "build:frontend"], check=True)

        # Copy to backend static
        static_dir = Path("backend/app/static")
        if static_dir.exists():
            shutil.rmtree(static_dir)
        shutil.copytree(Path("frontend/dist"), static_dir)
    except subprocess.CalledProcessError as e:
        print(f"Error: Frontend build failed: {e}", file=sys.stderr)
        return 1

    # Build wheel using uv
    print("Building wheel with uv build...")
    try:
        subprocess.run(["uv", "build", "--directory", "backend"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error: Wheel build failed: {e}", file=sys.stderr)
        return 1

    # Verify wheel was created
    dist_dir = Path("backend/dist")
    wheels = list(dist_dir.glob("*.whl")) if dist_dir.exists() else []
    if not wheels:
        print("Error: No wheel file found in backend/dist/", file=sys.stderr)
        return 1

    print(f"Wheel created: {wheels[0].absolute()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
