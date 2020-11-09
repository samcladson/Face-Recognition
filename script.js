import faceapi from'./LoadModels.js'
import imageLink from './ImageEncode.js';


const video = document.getElementById('video');
video.height=270;

var canvas = document.createElement('canvas');
const leftContainer = document.querySelector('.left-container');

leftContainer.appendChild(canvas)

// face data array
var faceData = [];

const clearArray=()=>{
    faceData=[]
}

// configure video
const stream =(data)=>{
    data==='close'?canvas.style.display='none'&&clearArray() :canvas.style.display='block'
    navigator.getUserMedia(
        {video:{}},
        stream => video.srcObject = data==='start'?stream:stream.getTracks().forEach(tracks => {
            tracks.stop();
        }),
        err => console.error(err)
    )
}



// Capture image
video.addEventListener('play',()=>{
    // canvas = faceapi.createCanvasFromMedia(video);
        
         var trackFace = setInterval(async ()=>{
            var detection =  await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
            detection?faceData.push(detection):null
            const resizedDetections = faceapi.resizeResults(detection,{width:video.width,height:video.height})
            faceapi.matchDimensions(canvas,{width:video.width,height:video.height})
            canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
            faceapi.draw.drawDetections(canvas,resizedDetections)
            if (faceData.length>=10){
                Promise.all([
                    clearInterval(trackFace),
                    stream('close')
                ])
                
                
             }
           
         },100)
    console.log(faceData)   
});



        
