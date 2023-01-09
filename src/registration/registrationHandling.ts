import { illustrateResult } from "../rendering/illustrateResult";
import imagePairAndOffset from "./imagePairAndOffset";
import { meanSquareError } from "./meanSquareError";

const inputs: imagePairAndOffset = {
    image1: null,
    image2: null,
    xOffset: 0,
    yOffset: 0
}

function setImage(index: number, im: ImageData) {
    if (index == 0) {
        inputs.image1 = im;
    } else {
        inputs.image2 = im;
    }
}

function setOffsets(x: number, y: number) {
    inputs.xOffset = x;
    inputs.yOffset = y;
}

function startRegistration() {
    if (!inputs.image1 || !inputs.image2) return;
    illustrateResult(inputs);
    document.querySelector('#msqerror').innerHTML = meanSquareError(inputs).toFixed(4);
}

const registrationHandling = {setImage, setOffsets, startRegistration};
export default registrationHandling;