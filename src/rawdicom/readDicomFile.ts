import DicomInstance from './instance/DicomInstance';
import parseDicomInstance from './parseDicomInstance';

export default function readDicomFile(file: File): Promise<DicomInstance> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', (event: Event) => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const dicomInstance = parseDicomInstance(arrayBuffer);
      resolve(dicomInstance);
    });

    reader.readAsArrayBuffer(file);
  });
}
