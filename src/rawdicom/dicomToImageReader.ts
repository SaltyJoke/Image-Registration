import ImageReader from "../rendering/interfaces/ImageReader";
import { RealWorldValueMapper } from "../rendering/RealWorldValueMapper";
import DicomInstance from "./instance/DicomInstance";

export function dicomToImageReader(dicom: DicomInstance, windowLevel: number, windowWidth: number): ImageReader {
    const intensityBuffer = getIntensityBuffer(dicom, windowLevel, windowWidth);
    return {
        width: dicom.columns,
        height: dicom.rows,
        getIntensity: function(x: number, y: number): number {
            return intensityBuffer[y*dicom.columns+x];
        }
    };
}

function getIntensityBuffer(dicom: DicomInstance, windowLevel: number, windowWidth: number) {
  const windowMin = windowLevel - windowWidth / 2;

  const { rows, columns, pixelData } = dicom;
  const buffer = [];

  const mapper = new RealWorldValueMapper(dicom);
  for (let i = 0; i < rows * columns; i++) {
    const pixelValue = mapper.toRealWorldValue(pixelData[i]) as number;
    const brightness = (pixelValue - windowMin) / windowWidth;
    buffer.push(brightness);
  }
  return buffer;
}