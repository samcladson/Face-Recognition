//loading models
Promise.all([
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(console.log("started"));

// var encodedData;
var canvas;
// face data array
var faceData = [];
// interval variable
var trackFace;

const video = document.getElementById("video");
video.height = 270;
video.width = 360;
const container = document.querySelector(".container");

const clearArray = () => {
  faceData = [];
};

// configure video
const Stream = (data) => {
  if (data === "close") {
    canvas && canvas.remove();
    clearArray();
    clearInterval(trackFace);
    video.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
  } else {
    canvas = document.createElement("canvas");
    container.appendChild(canvas);
    navigator.getUserMedia(
      { video: {} },
      (stream) => (video.srcObject = stream),
      (err) => console.log(err)
    );
  }
};

// // Capture image
video.addEventListener("playing", () => {
  // encodedData ? null : encodings();
  trackFace = setInterval(async () => {
    var detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (faceData.length === 0) {
      detection.detection._score > 0.95 ? faceData.push(detection) : null;
    }
    const resizedDetections = faceapi.resizeResults(detection, {
      width: video.width,
      height: video.height,
    });
    faceapi.matchDimensions(canvas, {
      width: video.width,
      height: video.height,
    });
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    if (faceData.length == 1) {
      const labeledFrame = new faceapi.draw.DrawBox(
        resizedDetections.detection.box,
        {
          boxColor: "green",
          label: "This is my face",
          drawLabelOptions: {
            padding: 5,
          },
        }
      );
      labeledFrame.draw(canvas);

      // Detect(faceData[0]);
    } else {
      faceapi.draw.drawDetections(canvas, resizedDetections);
    }
  }, 500);
});
