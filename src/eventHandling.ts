import readDicomFile from './rawdicom/readDicomFile';
import DicomInstance from './rawdicom/instance/DicomInstance';
import dicomToCanvas from './rendering/dicomToCanvas';
import registrationHandling from './registration/registrationHandling';
import { requestAlignImages } from './api';

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

let isDraggingMouse = -1;
let draggingMouseStartX = 0;
let draggingMouseStartY = 0;
function trackMouse(event: MouseEvent) {
  if (isDraggingMouse === 0) {
    const deltaX = event.clientX - draggingMouseStartX;
    const deltaY = event.clientY - draggingMouseStartY;
    const [offsetX, offsetY] = registrationHandling.getOffsets();

    registrationHandling.setOffsets(
      offsetX + deltaX,
      offsetY + deltaY
    );
    draggingMouseStartX = event.clientX;
    draggingMouseStartY = event.clientY;
    const canvas = document.getElementById('canvas-preview') as HTMLCanvasElement;;
    registrationHandling.drawImages(canvas, document.querySelector('#msqerror-preview') as HTMLElement);
  }
}

function saveBlobImage(blob, width, height, filenamePrefix) {
  const url = URL.createObjectURL(blob);
  const filename = `${filenamePrefix}_${width}_${height}.bin`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function saveCanvas(canvas, xScale, yScale, filenamePrefix) {
  const { blob, canvasToSave } = prepareBlobFromCanvas(canvas, xScale, yScale);
  saveBlobImage(blob, canvasToSave.width, canvasToSave.height, filenamePrefix);
}

function prepareBlobFromCanvas(canvas, xScale, yScale): {
  blob: Blob;
  canvasToSave: HTMLCanvasElement;
} {
  const canvasToSave = document.createElement('canvas');
  canvasToSave.width = canvas.width * xScale;
  canvasToSave.height = canvas.height * yScale;
  canvasToSave.getContext('2d').scale(xScale, yScale);
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

  return { blob, canvasToSave };}

function saveCanvas0(event: Event) {
  const index = 0;
  const canvas = document.getElementById(`canvas-${index}`) as HTMLCanvasElement;
  const scales = document.getElementById(`imageScale-${index}`).innerHTML.split(',');
  const filenamePrefix = `canvas_${index}`;
  saveCanvas(canvas, parseFloat(scales[0]), parseFloat(scales[1]), filenamePrefix);
}

function saveCanvas1(event: Event) {
  const index = 1;
  const canvas = document.getElementById(`canvas-${index}`) as HTMLCanvasElement;
  const scales = document.getElementById(`imageScale-${index}`).innerHTML.split(',');
  const filenamePrefix = `canvas_${index}`;
  saveCanvas(canvas, parseFloat(scales[0]), parseFloat(scales[1]), filenamePrefix);
}

function prepareAndSendAlignRequest() {
  let canvas = document.getElementById('canvas-0') as HTMLCanvasElement;
  let scales = document.getElementById('imageScale-0').innerHTML.split(',');
  const { blob: blob0, canvasToSave: canvas0 } = prepareBlobFromCanvas(canvas, parseFloat(scales[0]), parseFloat(scales[1]));
  canvas = document.getElementById('canvas-1') as HTMLCanvasElement;
  scales = document.getElementById('imageScale-1').innerHTML.split(',');
  const { blob: blob1, canvasToSave: canvas1 } = prepareBlobFromCanvas(canvas, parseFloat(scales[0]), parseFloat(scales[1]));

  const payload = {
    image1: canvas0.toDataURL('image/png'),
    image2: canvas1.toDataURL('image/png'),
  };

  console.log({ payload });
  requestAlignImages(payload);
}

function startRegistration() {
  const canvas = document.getElementById('canvas-align') as HTMLCanvasElement;
  registrationHandling.drawImages(canvas, document.querySelector('#msqerror-align') as HTMLElement);
}

function prepareBlobFromFile(file) {
  return new Promise((resolve, reject) => {
    readDicomFile(file)
    .then((dicom: DicomInstance) => {
      const canvas = document.createElement('canvas');
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
      resolve(prepareBlobFromCanvas(canvas, pixelSpacing[0], pixelSpacing[1]));
    });
  });
}

function startBatchTest(event: Event) {
  const fileSelector = event.target as HTMLInputElement;
  const files = fileSelector.files;
  if (!files) return;

  const folderPaths: { [key: string]: File[] } = {};
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.webkitRelativePath && file.name.endsWith('.dcm')) {
      const folderPath = file.webkitRelativePath.split('/').slice(0, -1).join('/');
      if (!folderPaths[folderPath]) {
        folderPaths[folderPath] = [];
      }
      folderPaths[folderPath].push(file);
    }
  }

  // if 2 .dcm exist in same folder
  for (const folderPath in folderPaths) {
    if (folderPaths[folderPath].length === 2) {
      const promises = [];
      for (const file of folderPaths[folderPath]) {
        promises.push(prepareBlobFromFile(file));
      }
      Promise.all(promises)
      .then(results => {
        const filenamePrefix1 = `${folderPaths[folderPath][0].name.substring(0, folderPaths[folderPath][0].name.lastIndexOf('.'))}`;
        saveBlobImage(results[0].blob, results[0].canvasToSave.width, results[0].canvasToSave.height, filenamePrefix1);
        const filenamePrefix2 = `${folderPaths[folderPath][1].name.substring(0, folderPaths[folderPath][1].name.lastIndexOf('.'))}`;
        saveBlobImage(results[1].blob, results[1].canvasToSave.width, results[1].canvasToSave.height, filenamePrefix1);
      });
    }
  }
}

export default function subscribeEventHandlers() {
  document
    .getElementById('choosefile-0')
    .addEventListener('change', fileChosen);
  document
    .getElementById('choosefile-1')
    .addEventListener('change', fileChosen);
  document
    .getElementById('button-send-align-request')
    .addEventListener('click', prepareAndSendAlignRequest);
  document
    .getElementById('button-batch')
    .addEventListener('change', startBatchTest);
  document.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        isDraggingMouse = event.button;
        draggingMouseStartX = event.clientX;
        draggingMouseStartY = event.clientY;
        document.body.focus();
    }
  });
  document.addEventListener('mousemove', trackMouse);
  document.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
      isDraggingMouse = -1;
    }
  });
  document
    .getElementById('button-savecanvas-0')
    .addEventListener('click', saveCanvas0);
  document
    .getElementById('button-savecanvas-1')
    .addEventListener('click', saveCanvas1);
}
