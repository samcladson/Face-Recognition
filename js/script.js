//loading models
Promise.all([
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(console.log("started"));

// var encodedData;
var canvas;
// face data array
var faceData = Array();
// interval variables
var trackFace;
// result
var staffName = "";
// api call indiactor variable
var count = 0;
// save data tets
var timeout;
// checking type
var checking_type;

var timeInterval;

var staffNameList;

var waitTime;

// Element Declaration
const video = document.getElementById("video");
video.height = 270;
video.width = 360;
const videoContainer = document.querySelector(".video-container");
const actionBtns = document.querySelector(".action-btns");
const checkInOutBtns = document.querySelector(".check-in-out");
const timerData = document.querySelector("#timer");
const select = document.querySelector("#select");
const toast = document.querySelector("#toast");
const toastTitle = document.querySelector(".toast-title");
const toastBody = document.querySelector(".toast-body");
const toastSmall = document.querySelector(".toast-small");
const loader = document.querySelector("#loader");

// populating options data
fetch("https://face-recognition-siet.herokuapp.com/getName", {
  method: "GET",
  headers: {
    "Content-type": "application/json; charset=UTF-8",
  },
})
  .then((res) => res.json())
  .then((data) => {
    staffNameList = data.staffName;
  })
  .then(() => {
    staffNameList.map((val) => {
      const options = document.createElement("option");
      options.innerHTML = val;
      options.value = val;
      select.appendChild(options);
    });
  })
  .catch((err) => {
    console.log(err);
  });

const btnControl = (data) => {
  if (data === "start" || data === "manual") {
    video.style.display = "block";
    actionBtns.style.display = "block";
    checkInOutBtns.style.display = "none";
  } else if (data === "retake") {
    return;
  } else {
    video.style.display = "none";
    actionBtns.style.display = "none";
    checkInOutBtns.style.display = "block";
  }
};

const reset = () => {
  video.style.display = "none";
  canvas ? canvas.remove() : null;
  faceData = [];
  staffName = "";
  clearInterval(trackFace);
  clearTimeout(timeout);
  clearInterval(timeInterval);
  clearInterval(waitTime);
  loader.innerHTML = "";
  timerData.innerHTML = "";
};

const startVideo = async (data) => {
  // time delay loader
  var load = 3;
  loader.style.display = "block";
  waitTime = setInterval(() => {
    loader.innerHTML = load;
    load -= 1;
  }, 1000);

  setTimeout(async () => {
    clearInterval(waitTime);
    loader.style.display = "none";
    video.style.display = "block";
    return await new Promise((resolve, reject) => {
      try {
        toast ? (toast.style.display = "none") : null;
        count = 0;
        btnControl(data);
        const getCanvas = document.querySelector("canvas");
        if (!getCanvas) {
          canvas = document.createElement("canvas");
          videoContainer.appendChild(canvas);
        }
        navigator.getUserMedia(
          { video: {} },
          (stream) => (video.srcObject = stream),
          (err) => console.log(err)
        );
        resolve(true);
      } catch (error) {
        if (error) reject(error);
      }
    });
  }, 3750);
};

const stopVideo = async (data) => {
  return await new Promise((resolve, reject) => {
    try {
      if (data === "close") {
        toast ? (toast.style.display = "none") : null;
        loader.style.display = "none";
        btnControl(data);
      } else {
        loader.style.display = "block";
      }
      reset();
      video.srcObject
        ? video.srcObject.getTracks().forEach((track) => {
            track.stop();
          })
        : null;
      video.srcObject ? (video.srcObject = null) : null;
      resolve(true);
    } catch (error) {
      if (error) reject(error);
    }
  });
};

// configure video

const Stream = (data) => {
  if (data === "close") {
    stopVideo(data);
  } else if (data === "retake") {
    // removing canvas, stoping video and creating canvas, strating video
    stopVideo(data).then(() => {
      startVideo(data);
    });
  } else if (data === "manual") {
    stopVideo(data);
  } else {
    startVideo(data);
  }
};

const checking = (data) => {
  if (data === "checkIn") {
    checking_type = data;
  } else {
    checking_type = data;
  }
};

const createEntry = (response) => {
  toast.style.display = "block";
  toastTitle.innerHTML = `<b>${response.Name}</b>`;
  toastSmall.innerHTML = response.Date;
  toastBody.innerHTML = `<b>Check-In Time :</b> ${response.Check_in_Time}<br>
        <b>Check-Out time :</b> ${
          response.Check_out_Time ? response.Check_out_Time : "N/A"
        }<br>
        <b>Working Hours :</b> ${
          response.Working_Hours ? response.Working_Hours : "N/A"
        }`;
};

const SaveData = () => {
  timeout = setTimeout(() => {
    clearInterval(timeInterval);
    fetch(
      `https://face-recognition-siet.herokuapp.com/saveUser/${checking_type}`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ Name: staffName }),
      }
    )
      .then((res) => res.json())
      .then((response) => {
        createEntry(response);
      });
    Stream("retake");
  }, 5000);
};

const manualDataSave = () => {
  $("#modal").modal("hide");
  staffName = select.value;
  timer();
  SaveData();
};

const timer = () => {
  var countTime = 5;
  timeInterval = setInterval(() => {
    timerData.innerHTML = "Saving Data in " + countTime;
    countTime -= 1;
  }, 1000);
};

// Capture image frame and encode data
video.addEventListener("playing", () => {
  trackFace = setInterval(async () => {
    var detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (detection) {
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
        count += 1;
        if (count === 1) {
          var data = {
            encode: Array.from(faceData[0].descriptor),
          };
          fetch("https://face-recognition-siet.herokuapp.com/face", {
            method: "POST",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify(data),
          })
            .then((res) => {
              if (res.status === 200) {
                timer();
                SaveData();
                return res.json();
              } else {
                return res.json();
              }
            })
            .then((response) => {
              staffName = response.Name;
            })
            .catch((err) => {
              console.log(err);
            });
        }
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        const labeledFrame = new faceapi.draw.DrawBox(
          resizedDetections.detection.box,
          {
            boxColor: "green",
            label: staffName,
            drawLabelOptions: {
              padding: 5,
            },
          }
        );
        labeledFrame.draw(canvas);
      } else {
        faceapi.draw.drawDetections(canvas, resizedDetections);
      }
    }
  }, 650);
});
