import ImageReader from "../rendering/interfaces/ImageReader";
import imagePairAndOffset from "./imagePairAndOffset";
import { meanSquareError } from "./meanSquareError";

interface testArea {
    xCenter: number,
    yCenter: number,
    xMaxDisp: number,
    yMaxDisp: number
}

export function optimize(im1: ImageReader, im2: ImageReader) {
    const startingBlockSize = 64;
    let blIm1 = null;
    let blIm2 = null;
    let minError = 2; // maximum possible is 1
    const area: testArea = {
        xCenter: 0,
        yCenter: 0,
        xMaxDisp: im1.height / startingBlockSize - 1,
        yMaxDisp: im1.width / startingBlockSize - 1
    };
    for (let blockSize = startingBlockSize; blockSize >= 1; blockSize /= 2) {
        blIm1 = createBlockedImage(im1, blockSize);
        blIm2 = createBlockedImage(im2, blockSize);
        for (let y = area.yCenter / blockSize - area.yMaxDisp; y <= area.yCenter / blockSize + area.yMaxDisp; y++) {
            for (let x = area.xCenter / blockSize - area.xMaxDisp; x <= area.xCenter / blockSize + area.xMaxDisp; x++) {
                const args: imagePairAndOffset = {
                    image1: blIm1,
                    image2: blIm2,
                    xOffset: x,
                    yOffset: y
                };
                let error = meanSquareError(args);
                if (error == 0) continue;
                if (error < minError) {
                    area.xCenter = x * blockSize;
                    area.yCenter = y * blockSize;
                    minError = error;
                }
            }
        }
        console.log(minError);
    }
    return [area.xCenter, area.yCenter];
}

function createBlockedImage(im: ImageReader, blockSize: number): ImageReader {
    const out = [];
    for (let y = 0; (y+1)*blockSize <= im.height; y++) { // cut off bottom remainder
        for (let x = 0; (x+1)*blockSize <= im.width; x++) { // cut off right remainder
            let total = 0;
            const pos = ((y*im.width) + x) * blockSize;
            for (let i = 0; i < blockSize; i++) {
                total += im.getIntensity(x, y);
            }
            const avg = total / blockSize;
            out.push(avg);
        }
    }
    const w = im.width / blockSize;
    const h = im.height / blockSize;
    return {
        width: w,
        height: h,
        getIntensity: function(x: number, y: number): number {
            return out[y*w+x];
        }
    }
}