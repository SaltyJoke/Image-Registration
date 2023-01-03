const images: ImageData[] = [null, null]

function setImage(index: number, im: ImageData) {
    images[index] = im;
}

function startRegistration() {
    console.log("I'm starting");
}

const imagePair = {setImage, startRegistration};
export default imagePair;