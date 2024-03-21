import imagePairAndOffset from "../registration/imagePairAndOffset";
import { createOverlappingImage } from "./createOverlappingImage";

export function illustrateResult(args: imagePairAndOffset, canvas: HTMLCanvasElement) {
    if (!args.image1.data || !args.image2.data) {
        return;
    }

    canvas.width = args.image1.data.width;
    canvas.height = args.image1.data.height;
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(canvas.width, canvas.height);
    const buffer = createOverlappingImage(args);
    imageData.data.set(buffer);
    canvas.getContext('2d').putImageData(imageData, 0, 0);
}