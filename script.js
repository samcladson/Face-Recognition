

// accessing models

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(console.log('started'))



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
const Stream =(data)=>{
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
video.addEventListener('play',async ()=>{
    
    // canvas = faceapi.createCanvasFromMedia(video);

        const labledFaceDescriptors = await encodings();
        const faceMatcher = new faceapi.faceMatcher(labledFaceDescriptors,0.6)
        
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
                    Stream('close')
                ])
                
                
             }
           
         },100)
    console.log(faceData)   
});


var imgLink = 'https://drive.google.com/drive/u/0/folders/1EOjfyqH6D2sgcdgEA-vG5J75YPCYhSP2';
var staffList=['Latha','Sam_Cladson','Sam_Nishanth','Simson']

const encodings =()=>{

return Promise.all(
    staffList.map(async staff=>{
        const descriptions = []
        for(var i=0;i<=2;i++){
            const img = await faceapi.fetchImage(`https://cors-anywhere.herokuapp.com/${imgLink}/${staff}/${i}.jpg`)
            const detection = await faceapi.detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor()
            descriptions.push(detection.descriptors)
            }

            return new faceapi.LabledFaceDescriptors(staff,descriptions)
        })
    )
}
        
