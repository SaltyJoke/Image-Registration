import readDicomFile from './rawdicom/readDicomFile';
import DicomInstance from './rawdicom/instance/DicomInstance';
import dicomToCanvas from './rendering/dicomToCanvas';
import imagePair from './registration/imagePair';

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
      imagePair.setImage(index, imageData);
    });
}

function getIndexFromId(id: string) {
  const words = id.split('-');
  return Number.parseInt(words[1]);
}

function align() {
  console.log("I'm aligning the images");
}

export default function subscribeEventHandlers() {
  document.getElementById('choosefile-0').addEventListener('change', fileChosen);
  document.getElementById('choosefile-1').addEventListener('change', fileChosen);
  document.getElementById('button-align').addEventListener('click', imagePair.startRegistration);
}
