import os
import re
import sys
import urllib.request
from pathlib import Path

def get_gitignore_patterns():
    try:
        with open('.gitignore', 'r') as f:
            return [line.strip() for line in f if line.strip() and not line.startswith('#')]
    except FileNotFoundError:
        return []

def should_ignore(path, ignore_patterns):
    path_str = str(path)
    return any(pattern in path_str for pattern in ignore_patterns)

def download_wasm(pkg_name, version):
    wasm_url = f"https://unpkg.com/@rive-app/{pkg_name}@{version}/rive.wasm"
    wasm_path = Path('export/rive.wasm')
    
    print(f"\nDownloading WASM from: {wasm_url}")
    try:
        urllib.request.urlretrieve(wasm_url, wasm_path)
        print(f"Successfully downloaded WASM to: {wasm_path}")
    except Exception as e:
        print(f"Error downloading WASM: {e}")
        sys.exit(1)

def replace_in_file(file_path, renderer_type, version):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if renderer_type == '-webgl':
        old_pkg = '@rive-app/canvas-advanced'
        old_pkg2 = '@rive-app/webgl2-advanced'
        new_pkg = '@rive-app/webgl-advanced'
        wasm_pkg = 'webgl-advanced'

    elif renderer_type == '-webgl2':
        old_pkg = '@rive-app/canvas-advanced'
        old_pkg2 = '@rive-app/webgl-advanced'
        new_pkg = '@rive-app/webgl2-advanced'
        wasm_pkg = 'webgl2-advanced'
    else: # -canvas
        # Handle both webgl and webgl2 cases
        old_pkg = '@rive-app/webgl-advanced'
        old_pkg2 = '@rive-app/webgl2-advanced'
        new_pkg = '@rive-app/canvas-advanced'
        wasm_pkg = 'canvas-advanced'

    print(f"Processing {file_path}")
    print(f"Looking to replace {old_pkg} and {old_pkg2} with {new_pkg}")
    
    new_content = content.replace(old_pkg, new_pkg)
    new_content = new_content.replace(old_pkg2, new_pkg)
    
    # Update version in package.json
    if file_path.name == 'package.json':
        # Look for any @rive-app package version
        version_pattern = rf'("@rive-app/[^"]+": )"[^"]+"'
        if re.search(version_pattern, new_content):
            new_content = re.sub(version_pattern, rf'\1"{version}"', new_content)
            print(f"Updated package version to {version} in package.json")
    
    #Make sure the WASM is being downloaded remotely:
    new_content = new_content.replace(
        "const USE_LOCAL_WASM: boolean = true;",
        "const USE_LOCAL_WASM: boolean = false;"
    )
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
        if file_path.name == 'package.json':
            print("Package.json changes:")
            print("- Updated package name")
            print(f"- Set version to {version}")
        return True, wasm_pkg
    else:
        print(f"No changes needed in {file_path}")
    return False, wasm_pkg

def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ['-webgl', '-canvas', '-webgl2']:
        print("Usage: python toggleWebGL.py [-webgl|-canvas|-webgl2] [-v version]")
        sys.exit(1)

    renderer_type = sys.argv[1]
    version = "2.21.6"  # default version

    if len(sys.argv) > 2 and sys.argv[2] == '-v' and len(sys.argv) > 3:
        version = sys.argv[3]
    
    ignore_patterns = get_gitignore_patterns()
    print("\nIgnoring patterns from .gitignore:", ignore_patterns)
    
    print(f"\nSwitching to {renderer_type[1:].upper()} renderer (version {version})...")
    
    # Find all .ts files and package.json recursively
    modified_count = 0
    checked_count = 0
    wasm_pkg = None
    
    for path in Path('.').rglob('*'):
        if path.suffix == '.ts' or path.name == 'package.json':
            checked_count += 1
            if not should_ignore(path, ignore_patterns):
                modified, pkg = replace_in_file(path, renderer_type, version)
                if modified:
                    modified_count += 1
                    wasm_pkg = pkg
            else:
                print(f"Skipping ignored file: {path}")
    
    if wasm_pkg:
        download_wasm(wasm_pkg, version)
    
    print(f"\nSummary:")
    print(f"Checked {checked_count} files")
    print(f"Modified {modified_count} files")
    print(f"Final renderer: {renderer_type[1:].upper()}")
    print(f"Version: {version}")

if __name__ == '__main__':
    main()
