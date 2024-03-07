/**
 * Encapsulates any transformation.
 */
export default interface Transformation {
  /**
   * Maps from source position to destination position in pixel coordinates.
   * @param from An array of length 2 inputs the x-y coordinates in pixel
   * @param to An array of length 2 ready to receive the output x-y coordinates in pixel
   */
  mapPixel(from: number[], to: number[]): void;
}
