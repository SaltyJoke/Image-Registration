import readDicomFile from './rawdicom/readDicomFile';
import DicomInstance from './rawdicom/instance/DicomInstance';
import dicomToCanvas from './rendering/dicomToCanvas';
import registrationHandling from './registration/registrationHandling';

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
    readDicomFile(file)
      .then((dicom: DicomInstance) => {
        const index = getIndexFromId(fileSelector.id);
        const canvas = document.getElementById(`canvas-${index}`) as HTMLCanvasElement;
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
        document.getElementById(`imageRes-${index}`).innerHTML = `${canvas.width}x${canvas.height}`;
        document.getElementById(`imageScale-${index}`).innerHTML = `${pixelSpacing[0]},${pixelSpacing[1]}`;
        registrationHandling.setImage(index, imageData, pixelSpacing[0], pixelSpacing[1]);
      });
  } else {
    readFile(file)
      .then((arrayBuffer: ArrayBuffer) => {
        const filenames = file.name.replace('.bin', '').split('_');
        const buffer = new Uint8Array(arrayBuffer);
        const index = parseInt(filenames[1], 10);
        const canvas = document.getElementById(`canvas-${index}`) as HTMLCanvasElement;
        canvas.width = parseInt(filenames[2], 10);
        canvas.height = parseInt(filenames[3], 10);
        const imageData = canvas.getContext('2d').createImageData(canvas.width, canvas.height);
        imageData.data.set(buffer);
        canvas.getContext('2d').putImageData(imageData, 0, 0);

        document.getElementById(`imageRes-${index}`).innerHTML = `${canvas.width}x${canvas.height}`;
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
  registrationHandling.setOffsets(event.clientX - canvasRect.left, event.clientY - canvasRect.top);
  registrationHandling.startRegistration();
}


function getNormalizedImage(canvas, xScale, yScale) {
  const canvasToSave = document.createElement('canvas');
  canvasToSave.width = canvas.width * xScale;
  canvasToSave.height = canvas.height * yScale;
  canvasToSave.getContext('2d').scale(xScale, yScale);
  canvasToSave.getContext('2d').drawImage(canvas, 0, 0);
  const imageDataToSave = canvasToSave.getContext('2d').getImageData(0, 0, canvasToSave.width, canvasToSave.height);
  const buffer = new ArrayBuffer(imageDataToSave.data.length);
  const dataView = new DataView(buffer);

  for (let i = 0; i < imageDataToSave.data.length; i++) {
    dataView.setUint8(i, imageDataToSave.data[i]);
  }

  return { buffer, width: canvasToSave.width, height: canvasToSave.height };
}

function saveBinaryImage(image, filenamePrefix) {
  const blob = new Blob([image.buffer]);
  const url = URL.createObjectURL(blob);
  const filename = `${filenamePrefix}_${image.width}_${image.height}.bin`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function saveCanvas(canvas, xScale, yScale, filenamePrefix) {
  const image = getNormalizedImage(canvas, xScale, yScale);
  saveBinaryImage(image, filenamePrefix);
}

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

function loadNormalizedImage(file) {
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
      resolve(getNormalizedImage(canvas, pixelSpacing[0], pixelSpacing[1]));
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
        promises.push(loadNormalizedImage(file));
      }
      Promise.all(promises)
      .then(results => {
        const filenamePrefix1 = `${folderPaths[folderPath][0].name.substring(0, folderPaths[folderPath][0].name.lastIndexOf('.'))}`;
        saveBinaryImage(results[0], filenamePrefix1);
        const filenamePrefix2 = `${folderPaths[folderPath][1].name.substring(0, folderPaths[folderPath][1].name.lastIndexOf('.'))}`;
        saveBinaryImage(results[1], filenamePrefix2);
      });
    }
  }
}

export default function subscribeEventHandlers() {
  document.getElementById('choosefile-0').addEventListener('change', fileChosen);
  document.getElementById('choosefile-1').addEventListener('change', fileChosen);
  document.getElementById('button-align').addEventListener('click', registrationHandling.startRegistration);
  document.getElementById('button-batch').addEventListener('change', startBatchTest);
  document.addEventListener('mousemove', trackMouse);
  document.getElementById('button-savecanvas-0').addEventListener('click', saveCanvas0);
  document.getElementById('button-savecanvas-1').addEventListener('click', saveCanvas1);
}
