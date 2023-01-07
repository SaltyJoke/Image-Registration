import { createOverlappingImage } from "../rendering/createOverlappingImage";
import imagePairAndOffset from "./imagePairAndOffset";

const images: ImageData[] = [null, null]

function setImage(index: number, im: ImageData) {
    images[index] = im;
    if (images[0] && images[1]) {
        const canvas = document.getElementById(`canvas-2`) as HTMLCanvasElement;
        canvas.width = images[0].width;
        canvas.height = images[0].height;
        const args: imagePairAndOffset = {
            image1: images[0],
            image2: images[1],
            xOffset: 0,
            yOffset: 0
        }
        const context = canvas.getContext('2d');
        const imageData = context.createImageData(canvas.width, canvas.height);
        const buffer = createOverlappingImage(args);
        imageData.data.set(buffer);
        canvas.getContext('2d').putImageData(imageData, 0, 0);
    }
}

function startRegistration() {
    console.log("I'm starting");
}

const imagePair = {setImage, startRegistration};
export default imagePair;