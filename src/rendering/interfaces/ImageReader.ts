/**
 * For reading an image.
 */
export default interface ImageReader {
  /**
   * Image width (number of columns).
   */
  readonly width: number;

  /**
   * Image height (number of rows).
   */
  readonly height: number;

  /**
   * Returns the intensity (between 0 and 1) of a pixel, or NaN if out-of-bound.
   * @param x x-coordinate (integer)
   * @param y y-coordinate (integer)
   */
  getIntensity(x: number, y: number): number;
}
