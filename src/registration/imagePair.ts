import { createOverlappingImage } from "../rendering/createOverlappingImage";
import { illustrateResult } from "../rendering/illustrateResult";
import imagePairAndOffset from "./imagePairAndOffset";

const images: ImageData[] = [null, null]

function setImage(index: number, im: ImageData) {
    images[index] = im;
}

function startRegistration() {
    const args: imagePairAndOffset = {
        image1: images[0],
        image2: images[1],
        xOffset: 0,
        yOffset: 0
    }
    illustrateResult(args);
}

const imagePair = {setImage, startRegistration};
export default imagePair;