var encodedData;
// var globalData;
// accessing models

Promise.all([
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(console.log("started"));

const video = document.getElementById("video");
video.height = 270;

var canvas = document.createElement("canvas");
const leftContainer = document.querySelector(".left-container");

leftContainer.appendChild(canvas);

// face data array
var faceData = [];

const clearArray = () => {
  faceData = [];
};

// configure video
const Stream = (data) => {
  data === "close"
    ? (canvas.style.display = "none" && clearArray())
    : (canvas.style.display = "block");
  navigator.getUserMedia(
    { video: {} },
    (stream) =>
      (video.srcObject =
        data === "start"
          ? stream
          : stream.getTracks().forEach((tracks) => {
              tracks.stop();
            })),
    (err) => console.error(err)
  );
};

// // Capture image
video.addEventListener("play", () => {
  encodedData ? null : encodings();
  const trackFace = setInterval(async () => {
    var detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();
    detection && detection.detection._score > 0.95
      ? faceData.push(detection)
      : null;
    const resizedDetections = faceapi.resizeResults(detection, {
      width: video.width,
      height: video.height,
    });
    faceapi.matchDimensions(canvas, {
      width: video.width,
      height: video.height,
    });
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    if (faceData.length == 1) {
      clearInterval(trackFace);
      Detect(faceData[0]);
      Stream("close");
    }
  }, 1500);
});

var staffList = [
  "Latha",
  "Sam_Cladson",
  "Sam_Nishanth",
  "Simson",
  "Jeevan",
  "NaveenBalaKumar",
  "RAJESH_BOJAN",
  "VIJAYBABU",
  "RAJLAXMI",
  "Ezhilarasi",
  "Faizal_Ahamed",
];
const encodings = async () => {
  return Promise.all(
    staffList.map(async (staff) => {
      const descriptions = [];
      for (var i = 0; i <= 1; i++) {
        let img = document.createElement("img");
        img.src = `/Images/${staff}/${i}.jpg`;
        var detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detection.descriptor);
      }
      var data = new faceapi.LabeledFaceDescriptors(staff, descriptions);
      return data;
    })
  )
    .then((data) => {
      encodedData = data;
      //window.localStorage.setItem('faceData',JSON.stringify(data))
    })
    .catch((err) => {
      console.log(err);
    });
};

// Detection
const Detect = (data) => {
  console.log(data.descriptor);
  //var faceData = window.localStorage.getItem('faceData')
  const faceMatcher = new faceapi.FaceMatcher(encodedData, 0.55);
  const result = faceMatcher.findBestMatch(data.descriptor);
  createEntry(result);
  result["dateTime"] = new Date();
};

const rightContainer = document.querySelector(".right-container");
const cardStyle =
  " width:150px;height:75px;border-radius:5px;padding:15px;box-shadow:0 8px 6px -6px black;margin:10px";
const createEntry = (data) => {
  console.log(data);
  const div = document.createElement("div");
  div.setAttribute("class", "card");
  div.setAttribute("style", cardStyle);
  div.innerHTML = data.label.replace("_", " ");
  rightContainer.appendChild(div);
};

// const calculate =()=>{
//     const Data=[]

//     var dataset = JSON.parse(window.localStorage.getItem('faceData'))
//     dataset.map((res,i)=>{
//         var data={}
//         var lable = res.label
//         var TotalSum=0;
//         res.descriptors.map((res,i)=>{
//             var sum=res.reduce((a,b)=>a+b,0)
//             var avg = (sum/res.length)
//             TotalSum+=avg
//         })
//         data.name=lable,
//         data.descriptors=(TotalSum/res.descriptors.length)
//         Data.push(data)
//     })
//     console.log(Data)
//     globalData=Data

// }

// calculate()

// const Detect =(data)=>{
//     const userData={}
//     const records = data.descriptor
//     var sum = records.reduce((a,b)=>a+b,0)
//     var avg = (sum/records.length)
//     userData.descriptor = avg

//     console.log(userData)

//     globalData.map((res,i)=>{
//         var subresult = res.descriptors-userData.descriptor
//         var addresult = res.descriptors+userData.descriptor
//         var denominator = (addresult/2)
//         var d = 100*Math.abs(subresult/denominator)
//         if(d<100){
//             console.log(d+'=>'+res.name)
//         }

//     })

// }
