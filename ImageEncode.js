import './LoadModels.js'

var imageLink = 'https://drive.google.com/drive/folders/1EOjfyqH6D2sgcdgEA-vG5J75YPCYhSP2?usp=sharing';

var staffList=['Simson','Sam Nishanth','Sam Cladson','Latha']
// get staff list
// $.ajax({
//     type:'GET',
//     url:'http://127.0.0.1:5000/',
//     success:((data)=>{
//         staffList = data;
//         console.log(staffList)
//     })
// }).done(()=>{
//     })
// })

staffList.map(async staff=>{
    for(var i=1;i<=2;i++){
        const img = await faceapi.fetchImage(`${imageLink}/${staff}/${i}.jpg`,
        {
            mode: 'no-cors',
            header: {'Access-Control-Allow-Origin':'*',}
        })
    }
})



export default imageLink;