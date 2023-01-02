import DicomTagDefinition from './DicomTagDefinition';
import DicomInstance from './instance/DicomInstance';

// Parses a DICOM file's binary buffer into a DICOM instance object.
export default function parseDicomInstance(arraybuffer: ArrayBuffer): DicomInstance {
  const byteArray = new Uint8Array(arraybuffer);
  const leadingZeroCount = 0x80;
  let isExplicit = true;
  let pixelOffset = byteArray.length;
  
  initialize();
  return readAllElements(leadingZeroCount);

  
  function initialize() {
    checkLeadingZeroAndMagicId();
    isExplicit = determineExplicit();
    pixelOffset = searchDword(0x7fe00010, leadingZeroCount);
  }
  
  // Pure
  function readAllElements(startOffset: number): DicomInstance {
    const resultObject = {};
    const result = resultObject as DicomInstance;
    let offset = startOffset;
    for (let tagDefinition of DicomTagDefinition) {
      const element = searchAndReadElement(tagDefinition.tag, tagDefinition.vr, offset);
      if (element.value !== undefined) {
        result[tagDefinition.name] = element.value;
      }

      offset = element.offset;
    }
    
    const pixelData = readPixelData(result.bitsAllocated, result.pixelRepresentation, result.rows * result.columns);
    if (pixelData != null) {
      resultObject["pixelData"] = pixelData;
    }

    return result;
  }

  // Pure
  function readPixelData(bitsAllocated: number, pixelRepresentation: number, pixelCount: number) {
    const length = readDword(pixelOffset + (isExplicit ? 8 : 4));

    if (bitsAllocated == 16 && length.value == pixelCount * 2) {
      if (pixelRepresentation == 0) {
        return new Uint16Array(byteArray.buffer, length.offset, pixelCount);
      }
      else if (pixelRepresentation == 1)
      {
        return new Int16Array(byteArray.buffer, length.offset, pixelCount);
      }
    }

    return null;
  }

  function checkLeadingZeroAndMagicId() {
    const notADicomFile = 'Error: Not a DICOM file.'
    for (let i = 0; i < leadingZeroCount; i++) {
      if (byteArray[i] !== 0) {
        throw new Error(notADicomFile);
      }
    }

    const dicm = 0x4d434944;
    const magicId = readDword(leadingZeroCount);
    if (magicId.value != dicm) {
      throw new Error(notADicomFile);
    }
  }

  function determineExplicit() {
    var transferSyntaxUID = readMetaInformation(0x00020010, leadingZeroCount);
    switch (transferSyntaxUID.value) {
      case '1.2.840.10008.1.2':
        return false;
      case '1.2.840.10008.1.2.1':
        return true;
      default:
        throw new Error('Error: The DICOM instance has a transfer syntax UID that we do not support.');
    }
  }
  
  // Pure
  function readMetaInformation(tag: number, startOffset: number)
  {
    let offset = searchDword(tag, startOffset);
    if (offset < 0) {
      return { value: '', offset: -1 };
    }
    
    offset += 6;
    const length = readWord(offset);
    const uid = readString(length.offset, length.value, 'UI');
    return uid;
  }
  
  // Pure
  function readWord(offset: number) {
    const lo = byteArray[offset];
    const hi = byteArray[offset + 1];
    return {
      value: (hi << 8) | lo,
      offset: offset + 2
    };
  }
  
  // Pure
  // Reads a double word at current offset.
  function readDword(offset: number) {
    const ll = byteArray[offset];
    const lh = byteArray[offset + 1];
    const hl = byteArray[offset + 2];
    const hh = byteArray[offset + 3];
    return {
      value: (hh << 24) | (hl << 16) | (lh << 8) | ll,
      offset: offset + 4
    };
  }
  
  // Pure
  function searchAndReadElement(tag: number, vr: string, startOffset: number)
  {
    let offset = searchDword(tag, startOffset);
    if (offset < 0) {
      return { value: undefined, offset: offset };
    }
    
    offset += 4;
    const length = readLength(offset);

    if (vr === 'US') {
      return readWord(length.offset);
    }

    return readString(length.offset, length.value, vr);
  }
  
  // Pure
  function readLength(offset: number)
  {
    if (isExplicit) {
      return readWord(offset + 2);
    }
    
    return readDword(offset);
  }
  
  // Pure
  // Searches a double-word and returns its offset. Returns -1 if not found.
  function searchDword(dword: number, startOffset: number)
  {
    const ll = dword & 0xFF;
    const lh = (dword & 0xFF00) >> 8;
    const hl = (dword & 0xFF0000) >> 16;
    const hh = (dword & 0xFF000000) >> 24;

    const endIndex = Math.min(byteArray.length - 3, pixelOffset);
    
    for (let offset = startOffset >> 2 << 2; offset < endIndex; offset += 2) {
      if (byteArray[offset] == hl &&
         byteArray[offset + 1] == hh &&
         byteArray[offset + 2] == ll &&
         byteArray[offset + 3] == lh) {
        return offset;
      }
    }
    
    return -1;
  }
  
  // Pure
  function readString(offset: number, length: number, vr: string)
  {
    let endOffset = offset + length;
    while (endOffset > offset && isEmptySpace(endOffset - 1)) {
      endOffset--;
    }

    const slicedArray = byteArray.slice(offset, endOffset);
    const elementString = String.fromCharCode.apply(null, slicedArray);
    let result: string | number | number[];
    if (vr === 'DS' || vr === 'IS') {
      result = parseDecimalString(elementString);
    }
    else {
      result = elementString;
    }
    
    return {
      value: result,
      offset: offset + length
    }
  }

  // Pure
  function isEmptySpace(offset: number) {
    const byte = byteArray[offset];
    return (byte === 0) || (byte === 32);
  }

  // Pure
  function parseDecimalString(decimalString: string) {
    const splitStrings = decimalString.split('\\');

    if (splitStrings.length === 1) {
      return Number(decimalString);
    }

    return splitStrings.map(c => Number(c));
  }

}
