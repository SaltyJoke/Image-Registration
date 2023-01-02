
export interface RealWorldValue extends Number {
}

export class RealWorldValueMapper {

  public readonly rescaleIntercept: number;
  
  public readonly rescaleSlope: number;

  public constructor(dicomInstance: {rescaleSlope?: number, rescaleIntercept?: number}) {
    // The DICOM tags can be missing (implied)
    this.rescaleIntercept = dicomInstance.rescaleIntercept ? dicomInstance.rescaleIntercept : 0;
    this.rescaleSlope = dicomInstance.rescaleSlope ? dicomInstance.rescaleSlope : 1.0;
  }

  public toRealWorldValue(rawValue: number): RealWorldValue {
    return rawValue * this.rescaleSlope + this.rescaleIntercept;
  }

  public toRawValue(realWorldValue: RealWorldValue): number {
    return (realWorldValue as number - this.rescaleIntercept) / this.rescaleSlope;
  }
}
