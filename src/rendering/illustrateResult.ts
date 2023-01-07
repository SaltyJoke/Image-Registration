import imagePairAndOffset from "../registration/imagePairAndOffset";
import { createOverlappingImage } from "./createOverlappingImage";

export function illustrateResult(args: imagePairAndOffset) {
    const canvas = document.getElementById(`canvas-2`) as HTMLCanvasElement;
    canvas.width = args.image1.width;
    canvas.height = args.image1.height;
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(canvas.width, canvas.height);
    const buffer = createOverlappingImage(args);
    imageData.data.set(buffer);
    canvas.getContext('2d').putImageData(imageData, 0, 0);
}