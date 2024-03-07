import readDicomFile from './rawdicom/readDicomFile';
import DicomInstance from './rawdicom/instance/DicomInstance';
import dicomToCanvas from './rendering/dicomToCanvas';
import registrationHandling from './registration/registrationHandling';

function fileChosen(event: Event) {
  const fileSelector = event.target as HTMLInputElement;
  const file = fileSelector.files[0];
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
      registrationHandling.setImage(index, imageData, pixelSpacing[0], pixelSpacing[1]);
    });
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

export default function subscribeEventHandlers() {
  document.getElementById('choosefile-0').addEventListener('change', fileChosen);
  document.getElementById('choosefile-1').addEventListener('change', fileChosen);
  document.getElementById('button-align').addEventListener('click', registrationHandling.startRegistration);
  document.addEventListener('mousemove', trackMouse);
}
