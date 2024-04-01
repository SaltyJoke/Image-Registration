export const initWebSocket = () => {
  const socket = new WebSocket('ws://localhost:59152'); // Replace localhost:1234 with your server's address and port

  socket.onopen = () => {
    console.log('WebSocket connection established.');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.addEventListener('message', (event) => {
    if (event.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        console.log(`Response Received`);
        try {
          const jsonData = (reader.result as string) || '';
          const serverResponse = JSON.parse(jsonData);
          // resolve(serverResponse);
          console.log(serverResponse);
        } catch (error) {
          console.error('Failed to parse server response as JSON:', error);
        }
      };
      reader.readAsText(event.data);
    } else {
      console.error('Received data is not a Blob:', event.data);
    }
  });

  return socket;
};

export const sendImages = (
  socket: WebSocket,
  {
    referenceImageCanvas,
    targetImageCanvas,
  }: {
    referenceImageCanvas: any;
    targetImageCanvas: any;
  },
  header: { reqId: Number }
) =>
  new Promise<void>((resolve, reject) => {
    try {
      const binaryDataReferenceImage = getImageBinaryData(referenceImageCanvas);
      const binaryDataTargetImage = getImageBinaryData(targetImageCanvas);

      const payload = combineImagesBinaryData({
        header: `requestId: ${header.reqId}`,
        binaryImageData1: binaryDataReferenceImage,
        binaryImageData2: binaryDataTargetImage,
      });

      console.log(
        `${header.reqId}: Sending images - payload size: ${payload.length}`
      );

      socket.send(payload);
      resolve();
    } catch (error) {
      reject(error);
    }
  });

// tools
const combineImagesBinaryData = ({
  header,
  binaryImageData1,
  binaryImageData2,
}: {
  header: string;
  binaryImageData1: Uint8Array;
  binaryImageData2: Uint8Array;
}) => {
  // Convert key string and newline character to array of bytes
  // TODO > for mangaging responses add keyStringArray at the start of combinedArray
  const keyStringArray = new TextEncoder().encode(header + '\n');

  // Create a new ArrayBuffer to hold the header + images data and size of first image
  // The first images data lenght is attached at first so
  // we can devide 2 images when reading on server
  const combinedData = new ArrayBuffer(
    keyStringArray.byteLength +
      2 * Uint32Array.BYTES_PER_ELEMENT +
      binaryImageData1.byteLength +
      binaryImageData2.byteLength
  );
  const combinedArray = new Uint8Array(combinedData);

  // Serialize the size of the first image and store it in the combinedArray
  const imageSize1 = binaryImageData1.byteLength;
  const sizeArray1 = new Uint32Array(combinedData, 0, 1);
  sizeArray1[0] = imageSize1;

  // Copy the binary image data of the first image into the combinedArray
  combinedArray.set(
    new Uint8Array(combinedData, 2 * Uint32Array.BYTES_PER_ELEMENT),
    Uint32Array.BYTES_PER_ELEMENT
  );
  combinedArray.set(binaryImageData1, 2 * Uint32Array.BYTES_PER_ELEMENT);

  // Copy the binary image data of the second image into the combinedArray
  combinedArray.set(
    binaryImageData2,
    2 * Uint32Array.BYTES_PER_ELEMENT + imageSize1
  );

  return combinedArray;
};

const getImageBinaryData = (imageCanvas: any) => {
  const imageDataWithoutPrefix = getImageDataWithoutDataURLPrefix(imageCanvas);

  const binaryImageData = atob(imageDataWithoutPrefix);
  const imageDataArray = new Uint8Array(binaryImageData.length);

  for (let i = 0; i < binaryImageData.length; i++) {
    imageDataArray[i] = binaryImageData.charCodeAt(i);
  }

  return imageDataArray;
};

const getImageDataWithoutDataURLPrefix = (imageCanvas: any) =>
  imageCanvas
    .toDataURL('image/png')
    // Remove the data URL prefix ('data:image/png;base64,') to extract the image data
    .replace(/^data:image\/(png|jpg);base64,/, '');
