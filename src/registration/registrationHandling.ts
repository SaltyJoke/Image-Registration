import { illustrateResult } from "../rendering/illustrateResult";
import imagePairAndOffset from "./imagePairAndOffset";
import { meanSquareError } from "./meanSquareError";

const inputs: imagePairAndOffset = {
    image1: {
        data: null,
        xScale: 1.0,
        yScale: 1.0
    },
    image2: {
        data: null,
        xScale: 1.0,
        yScale: 1.0
    },
    xOffset: 0,
    yOffset: 0
}

function setImage(index: number, im: ImageData, xScale: number, yScale: number) {
    if (index == 0) {
        inputs.image1.data = im;
        inputs.image1.xScale = xScale;
        inputs.image1.yScale = yScale;
    } else {
        inputs.image2.data = im;
        inputs.image2.xScale = xScale;
        inputs.image2.yScale = yScale;
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