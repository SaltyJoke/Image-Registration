import readDicomFile from './rawdicom/readDicomFile';
import DicomInstance from './rawdicom/instance/DicomInstance';
import dicomToCanvas from './rendering/dicomToCanvas';
import registrationHandling from './registration/registrationHandling';
import { requestAlignImages } from './api';
import { initWebSocket, sendImages } from './websocket';

const webSocket = initWebSocket();

function readFile(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', (event: Event) => {
      const arrayBuffer = reader.result as ArrayBuffer;
      resolve(arrayBuffer);
    });

    reader.readAsArrayBuffer(file);
  });
}

function fileChosen(event: Event) {
  const fileSelector = event.target as HTMLInputElement;
  const file = fileSelector.files[0];
  if (file.name.includes('.dcm')) {
    readDicomFile(file).then((dicom: DicomInstance) => {
      const index = getIndexFromId(fileSelector.id);
      const canvas = document.getElementById(
        `canvas-${index}`
      ) as HTMLCanvasElement;
      const imageData = dicomToCanvas({
        dicom,
        canvas,
        windowLevel: 0,
        windowWidth: 1500,
      });
      canvas.getContext('2d').putImageData(imageData, 0, 0);
      const pixelSpacing = [1.0, 1.0];
      if (dicom.pixelSpacing) {
        pixelSpacing[0] = dicom.pixelSpacing[0];
        pixelSpacing[1] = dicom.pixelSpacing[1];
      }
      document.getElementById(
        `imageRes-${index}`
      ).innerHTML = `${canvas.width}x${canvas.height}`;
      document.getElementById(
        `imageScale-${index}`
      ).innerHTML = `${pixelSpacing[0]},${pixelSpacing[1]}`;
      registrationHandling.setImage(
        index,
        imageData,
        pixelSpacing[0],
        pixelSpacing[1]
      );
    });
  } else {
    readFile(file).then((arrayBuffer: ArrayBuffer) => {
      const filenames = file.name.replace('.bin', '').split('_');
      const buffer = new Uint8Array(arrayBuffer);
      const index = parseInt(filenames[1], 10);
      const canvas = document.getElementById(
        `canvas-${index}`
      ) as HTMLCanvasElement;
      canvas.width = parseInt(filenames[2], 10);
      canvas.height = parseInt(filenames[3], 10);
      const imageData = canvas
        .getContext('2d')
        .createImageData(canvas.width, canvas.height);
      imageData.data.set(buffer);
      canvas.getContext('2d').putImageData(imageData, 0, 0);

      document.getElementById(
        `imageRes-${index}`
      ).innerHTML = `${canvas.width}x${canvas.height}`;
      document.getElementById(`imageScale-${index}`).innerHTML = '1.0,1.0';
      registrationHandling.setImage(index, imageData, 1, 1);
    });
  }
}

function getIndexFromId(id: string) {
  const words = id.split('-');
  return Number.parseInt(words[1]);
}

function trackMouse(event: MouseEvent) {
  const canvas = document.getElementById('canvas-2');
  const canvasRect = canvas.getBoundingClientRect();
  registrationHandling.setOffsets(
    event.clientX - canvasRect.left,
    event.clientY - canvasRect.top
  );
  registrationHandling.startRegistration();
}

function saveCanvas(index: Number) {
  const { blob, canvasToSave } = prepareBlobFromCanvas(index);

  const url = URL.createObjectURL(blob);
  const filename = `canvas_${index}_${canvasToSave.width}_${canvasToSave.height}.bin`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function prepareBlobFromCanvas(index: Number): {
  blob: Blob;
  canvasToSave: HTMLCanvasElement;
} {
  const canvas = document.getElementById(
    `canvas-${index}`
  ) as HTMLCanvasElement;

  const canvasToSave = document.createElement('canvas');
  const scales = document
    .getElementById(`imageScale-${index}`)
    .innerHTML.split(',');
  canvasToSave.width = canvas.width * parseFloat(scales[0]);
  canvasToSave.height = canvas.height * parseFloat(scales[1]);
  canvasToSave
    .getContext('2d')
    .scale(parseFloat(scales[0]), parseFloat(scales[1]));
  canvasToSave.getContext('2d').drawImage(canvas, 0, 0);
  const imageDataToSave = canvasToSave
    .getContext('2d')
    .getImageData(0, 0, canvasToSave.width, canvasToSave.height);
  const buffer = new ArrayBuffer(imageDataToSave.data.length);
  const dataView = new DataView(buffer);

  for (let i = 0; i < imageDataToSave.data.length; i++) {
    dataView.setUint8(i, imageDataToSave.data[i]);
  }

  const blob = new Blob([buffer]);

  return { blob, canvasToSave };
}

function saveCanvas0(event: Event) {
  saveCanvas(0);
}
function saveCanvas1(event: Event) {
  saveCanvas(1);
}

function prepareAndSendAlignRequest() {
  const { blob: blob0, canvasToSave: referenceImageCanvas } =
    prepareBlobFromCanvas(0);
  const { blob: blob1, canvasToSave: targetImageCanvas } =
    prepareBlobFromCanvas(1);

  Promise.all([
    sendImages(
      webSocket,
      { referenceImageCanvas, targetImageCanvas },
      { reqId: 1 }
    ),
    sendImages(
      webSocket,
      { referenceImageCanvas, targetImageCanvas: referenceImageCanvas },
      { reqId: 2 }
    ),
    sendImages(
      webSocket,
      { referenceImageCanvas: targetImageCanvas, targetImageCanvas },
      { reqId: 3 }
    ),
  ]).catch((err) => console.error({ error: err }));
}

export default function subscribeEventHandlers() {
  document
    .getElementById('choosefile-0')
    .addEventListener('change', fileChosen);
  document
    .getElementById('choosefile-1')
    .addEventListener('change', fileChosen);
  document
    .getElementById('button-align')
    .addEventListener('click', registrationHandling.startRegistration);
  document
    .getElementById('button-send-align-request')
    .addEventListener('click', prepareAndSendAlignRequest);
  document.addEventListener('mousemove', trackMouse);
  document
    .getElementById('button-savecanvas-0')
    .addEventListener('click', saveCanvas0);
  document
    .getElementById('button-savecanvas-1')
    .addEventListener('click', saveCanvas1);
}
