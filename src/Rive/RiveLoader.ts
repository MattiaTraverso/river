import { File } from "@rive-app/canvas-advanced";
import Game from "../Game";

export default class RiveLoader {
    static async LoadFile(url: string): Promise<File> {
        if (!Game.RiveInstance) {
            throw new Error("RiveInstance not initialized");
        }

        const bytes = await (await fetch(new Request(url))).arrayBuffer();
        const file = (await Game.RiveInstance.load(new Uint8Array(bytes))) as File;
        return file;
    }
}
