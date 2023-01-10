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
    const diff = [];
    for (let y1 = 0; y1 < h1; y1++) {
        for (let x1 = 0; x1 < w1; x1++) {
            let x2 = x1 - args.xOffset;
            let y2 = y1 - args.yOffset;
            if (x2 >= 0 && x2 < w2 && y2 >= 0 && y2 < h2) {
                diff.push(args.image2.getIntensity(x2, y2) - args.image1.getIntensity(x1, y1));
            }
        }
    }
    return diff;
}
