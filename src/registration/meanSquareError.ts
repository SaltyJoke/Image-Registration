import imagePairAndOffset from "./imagePairAndOffset";

export function meanSquareError(args: imagePairAndOffset) {
    let diff = commonAreaDifference(args);
    let total = 0;
    for (let i = 0; i < diff.length; i++) {
        total += diff[i] * diff[i];
    }
    return total / diff.length;
}

function commonAreaDifference(args: imagePairAndOffset) {
    const w1 = args.image1.width;
    const w2 = args.image2.width;
    const h1 = args.image1.height;
    const h2 = args.image2.height;
    const im1 = createIntensityArray(args.image1);
    const im2 = createIntensityArray(args.image2);
    const diff = [];
    for (let y1 = 0; y1 < h1; y1++) {
        for (let x1 = 0; x1 < w1; x1++) {
            let x2 = x1 - args.xOffset;
            let y2 = y1 - args.yOffset;
            if (x2 >= 0 && x2 < w2 && y2 >= 0 && y2 < h2) {
                diff.push(im2[y2*w2+x2] - im1[y1*w1+x1]);
            }
        }
    }
    return diff;
}

export function createIntensityArray(image: ImageData) {
    const data = image.data;
    const out = [];
    for (let i = 0; i < data.length; i += 4) {
        out.push(intensity(data[i], data[i+1], data[i+2]));
    }
    return out;
}

function intensity(r: number, g: number, b: number): number {
    return (r+g+b) / (3.0 * 255);
}
