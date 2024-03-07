import imagePairAndOffset from "../registration/imagePairAndOffset";
import { createIntensityArray } from "../registration/meanSquareError";

export function createOverlappingImage(args: imagePairAndOffset) {
    const w1 = args.image1.data.width;
    const w2 = args.image2.data.width;
    const h1 = args.image1.data.height;
    const h2 = args.image2.data.height;
    const out = new Uint8ClampedArray(w1 * h1 * 4);
    const im1 = createIntensityArray(args.image1.data);
    const im2 = createIntensityArray(args.image2.data);
    const xScale = args.image1.xScale / args.image2.xScale;
    const yScale = args.image1.yScale / args.image2.yScale;
    for (let y1 = 0; y1 < h1; y1++) {
        for (let x1 = 0; x1 < w1; x1++) {
            let x2 = Math.round((x1 - args.xOffset) * xScale + w1 / 2);
            let y2 = Math.round((y1 - args.yOffset) * yScale + h1 / 2);
            const pos = (y1 * w1 + x1) * 4;
            out[pos] = im1[pos/4] * 255; // R
            if (x2 >= 0 && x2 < w2 && y2 >= 0 && y2 < h2) {
                out[pos + 1] = im2[y2*w2+x2] * 255; // G
            }
            out[pos + 2] = 0; // B
            out[pos + 3] = 255; // A
        }
    }
    return out;
}
