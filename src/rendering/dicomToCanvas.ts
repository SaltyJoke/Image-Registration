import DicomInstance from '../rawdicom/instance/DicomInstance';
import { RealWorldValueMapper } from './RealWorldValueMapper';

interface DicomToCanvasArgs {
  dicom: DicomInstance,
  canvas: HTMLCanvasElement,
  windowLevel: number,
  windowWidth: number,
}

export default function dicomToCanvas(args: DicomToCanvasArgs): ImageData {
  if (!validate(args)) {
    return null;
  }

  const { dicom, canvas } = args;
  canvas.width = dicom.columns;
  canvas.height = dicom.rows;
  const context = canvas.getContext('2d');
  const imageData = context.createImageData(canvas.width, canvas.height);
  const buffer = createImageBuffer(args);
  imageData.data.set(buffer);
  return imageData;
}

function validate(args: DicomToCanvasArgs) {
  return args.dicom
    && args.dicom.columns
    && args.dicom.rows
    && args.canvas
    && args.windowWidth >= 2;
}

function createImageBuffer(args: DicomToCanvasArgs) {
  const { dicom, windowWidth } = args;
  const windowMin = args.windowLevel - windowWidth / 2;

  const { rows, columns, pixelData } = dicom;
  const channels = 4;
  const opaque = 255;
  const buffer = new Uint8ClampedArray(columns * rows * channels);

  const mapper = new RealWorldValueMapper(dicom);
  for (let i = 0; i < rows * columns; i++) {
    const pixelValue = mapper.toRealWorldValue(pixelData[i]) as number;
    const brightness = (pixelValue - windowMin) * 255 / windowWidth;
    const k = i * channels;
    buffer[k] = brightness;
    buffer[k + 1] = brightness;
    buffer[k + 2] = brightness;
    buffer[k + 3] = opaque;
  }

  return buffer;
}
