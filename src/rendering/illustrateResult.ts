import imagePairAndOffset from "../registration/imagePairAndOffset";
import { createOverlappingImage } from "./createOverlappingImage";

export function illustrateResult(args: imagePairAndOffset) {
    const canvas = document.getElementById(`canvas-2`) as HTMLCanvasElement;
    const imageData = emptyImage(args.image1.width, args.image1.height);
    const buffer = createOverlappingImage(args);
    imageData.data.set(buffer);
    canvas.getContext('2d').putImageData(imageData, 0, 0);
}

export function emptyImage(width, height) {
    const canvas = document.getElementById(`canvas-2`) as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(canvas.width, canvas.height);
    return imageData;
}