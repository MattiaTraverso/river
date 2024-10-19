import RiveCanvas from '@rive-app/canvas-advanced';

async function main() {
  const rive = await RiveCanvas({
    locateFile: (_) => "https://unpkg.com/@rive-app/canvas-advanced@2.17.3/rive.wasm"
  });
}
main();