import imagePairAndOffset from "./imagePairAndOffset";

export function meanSquareError(args: imagePairAndOffset) {
    let diff = commonAreaDifference(args);
    let total = 0;
    for (let i = 0; i < diff.length; i++) {
        for (let j = 0; j < diff[0].length; j++) {
            total += diff[i][j] * diff[i][j];
        }
    }
    return total / (diff.length * diff[0].length);
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
        const row = [];
        for (let x1 = 0; x1 < w1; x1++) {
            let x2 = x1 - args.xOffset;
            let y2 = y1 - args.yOffset;
            if (x2 >= 0 && x2 < w2 && y2 >= 0 && y2 < h2) {
                row.push(im2[y2][x2] - im1[y1][x1]);
            }
        }
        if (row.length != 0) {
            diff.push(row);
        }
    }
    return diff;
}

export function createIntensityArray(image: ImageData) {
    const data = image.data;
    const w = image.width;
    const h = image.height;
    const out = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
            let pos = ((w*y)+x)*4;
            let value = intensity(data[pos], data[pos+1], data[pos+2]);
            row.push(value);
        }
        out.push(row);
    }
    return out;
}

function intensity(r: number, g: number, b: number): number {
    return (r+g+b) / (3.0 * 255);
}
