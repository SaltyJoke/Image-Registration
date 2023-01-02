import readDicomFile from './rawdicom/readDicomFile';
import DicomInstance from './rawdicom/instance/DicomInstance';
import dicomToCanvas from './rendering/dicomToCanvas';

function fileChosen(event: Event) {
  const fileSelector = event.target as HTMLInputElement;
  const file = fileSelector.files[0];
  readDicomFile(file)
    .then((dicom: DicomInstance) => {
      const index = getIndexFromId(fileSelector.id);
      const canvas = document.getElementById(`canvas-${index}`) as HTMLCanvasElement;
      dicomToCanvas({
        dicom,
        canvas,
        windowLevel: 0,
        windowWidth: 1500,
      });
    });
}

function getIndexFromId(id: string) {
  const words = id.split('-');
  return Number.parseInt(words[1]);
}

export default function subscribeEventHandlers() {
  document.getElementById('choosefile-0').addEventListener('change', fileChosen);
  document.getElementById('choosefile-1').addEventListener('change', fileChosen);
}
