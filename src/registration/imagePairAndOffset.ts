export default interface imagePairAndOffset {
    image1: {
        data: ImageData,
        xScale: number,
        yScale: number
    }
    image2: {
        data: ImageData,
        xScale: number,
        yScale: number
    }
    xOffset: number,
    yOffset: number
}