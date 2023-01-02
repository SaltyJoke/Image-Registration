/**
 * Defines a DICOM instance object.
 */
export default interface DicomInstance {
  readonly sopClassUID: string;
  readonly sopInstanceUID: string;
  readonly modality: string;
  readonly patientName: string;
  readonly studyInstanceUID: string;
  readonly seriesInstanceUID: string;
  readonly instanceNumber: number;
  readonly imagePositionPatient: ReadonlyArray<number>;
  readonly imageOrientationPatient: ReadonlyArray<number>;
  readonly photometricInterpretation: string;
  readonly rows: number;
  readonly columns: number;
  readonly pixelSpacing: ReadonlyArray<number>;
  readonly bitsAllocated: number;
  readonly pixelRepresentation: number;
  readonly windowCenter?: number | ReadonlyArray<number>;
  readonly windowWidth?: number | ReadonlyArray<number>;
  readonly rescaleIntercept?: number;
  readonly rescaleSlope?: number;
  readonly pixelData: ReadonlyArray<number>;
}