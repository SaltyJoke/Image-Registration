import ImageReader from "../rendering/interfaces/ImageReader";

export default interface imagePairAndOffset {
    image1: ImageReader,
    image2: ImageReader,
    xOffset: number,
    yOffset: number
}