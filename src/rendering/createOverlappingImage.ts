import imagePairAndOffset from "../registration/imagePairAndOffset";
import { createIntensityArray } from "../registration/meanSquareError";

export function createOverlappingImage(args: imagePairAndOffset) {
    const w1 = args.image1.width;
    const w2 = args.image2.width;
    const h1 = args.image1.height;
    const h2 = args.image2.height;
    const out = new Uint8ClampedArray(w1 * h1 * 4);
    for (let y1 = 0; y1 < h1; y1++) {
        for (let x1 = 0; x1 < w1; x1++) {
            let x2 = x1 - args.xOffset;
            let y2 = y1 - args.yOffset;
            const pos = (y1 * w1 + x1) * 4;
            out[pos] = args.image1.getIntensity(x1, y1) * 255; // R
            if (x2 >= 0 && x2 < w2 && y2 >= 0 && y2 < h2) {
                out[pos + 1] = args.image2.getIntensity(x2, y2) * 255; // G
            }
            out[pos + 2] = 0; // B
            out[pos + 3] = 255; // A
        }
    }
    return out;
}
