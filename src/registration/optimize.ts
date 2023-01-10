import ImageReader from "../rendering/interfaces/ImageReader";

function optimize(im1: ImageReader, im2: ImageData) {
    const startingBlockSize = 32;
    let blIm1 = null;
    let blIm2 = null;
    for (let i = startingBlockSize; i >= 1; i /= 2) {

    }
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