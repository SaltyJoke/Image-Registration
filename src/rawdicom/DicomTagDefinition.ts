/**
 * Returns a list of objects as DICOM tag definition. Ordered by tag.
 * The names are used as property names in a DICOM instance object.
 */
const DicomTagDefinition = [
  { tag: 0x00080016, name: 'sopClassUID', vr: 'UI' },
  { tag: 0x00080018, name: 'sopInstanceUID', vr: 'UI' },
  { tag: 0x00080060, name: 'modality', vr: 'CS' },
  { tag: 0x00100010, name: 'patientName', vr: 'PN' },
  { tag: 0x0020000d, name: 'studyInstanceUID', vr: 'UI' },
  { tag: 0x0020000e, name: 'seriesInstanceUID', vr: 'UI' },
  { tag: 0x00200013, name: 'instanceNumber', vr: 'IS' },
  { tag: 0x00200032, name: 'imagePositionPatient', vr: 'DS' },
  { tag: 0x00200037, name: 'imageOrientationPatient', vr: 'DS' },
  { tag: 0x00280004, name: 'photometricInterpretation', vr: 'CS' },
  { tag: 0x00280010, name: 'rows', vr: 'US' },
  { tag: 0x00280011, name: 'columns', vr: 'US' },
  { tag: 0x00280030, name: 'pixelSpacing', vr: 'DS' },
  { tag: 0x00280100, name: 'bitsAllocated', vr: 'US' },
  { tag: 0x00280103, name: 'pixelRepresentation', vr: 'US' },
  { tag: 0x00281050, name: 'windowCenter', vr: 'DS' },
  { tag: 0x00281051, name: 'windowWidth', vr: 'DS' },
  { tag: 0x00281052, name: 'rescaleIntercept', vr: 'DS' },
  { tag: 0x00281053, name: 'rescaleSlope', vr: 'DS' },
];

export default DicomTagDefinition;
