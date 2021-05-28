const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer({config: {'iceServers': [
  { url: 'stun:stun.l.google.com:19302' },
  { url: 'stun:stun1.l.google.com:19302' },
  { url: 'stun:stun2.l.google.com:19302' },
  { url: 'stun:stun3.l.google.com:19302' },
  { url: 'stun:stun4.l.google.com:19302' },
]}, 
  host: 'meetclone.herokuapp.com',
  secure: true,
  port: 443,
});
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
var data = ''
 async function getdata(){
  var response  =  await fetch('http://60103ecc9493.ngrok.io/data')
  if (response.ok) { // if HTTP-status is 200-299
    // get the response body (the method explained below)
    let json = await response.json();
    data = json['data']
    if(data!=""){
      document.getElementById('prediction').value = data
      // var data = document.getElementById("prediction").value
    //   myPeer.on('connection', function(conn) {
    //   conn.on('open', function() {
    //     // Receive messages
    //     conn.on('data', function(data) {
    //       console.log('Received', data);
    //     });
      
    //     // Send messages
    //     conn.send(data);
    //   });
    // });
    }
  } else {
    alert("HTTP-Error: " + response.status);
  }
 }
 
setInterval(getdata, 1500);
const myVideo = document.createElement('video');
// myVideo.style.height = "400px"
// myVideo.style.width = "500px"
// myVideo.style.marginRight = "100px"
let mystream;
myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    
    mystream = stream;
    addVideoStream(myVideo, stream);
    myPeer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  });

socket.on('user-disconnected', (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  var conn = myPeer.connect(userId);
  conn.on('open', function() {
    // Receive messages
    conn.on('data', function(data) {
      console.log('Received', data);
    });
  
    // Send messages
    conn.send('add video function ');
  });
  call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  video.style.marginLeft = "400px"
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

const miceToggle = () => {
  const enabled = mystream.getAudioTracks()[0].enabled;
  if (enabled) {
    mystream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    mystream.getAudioTracks()[0].enabled = true;
  }
};

//buttons
const mics = document.querySelectorAll('#mic');
const camera = document.querySelectorAll('#camera');

//audio toggling

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  const mobileHtml = `
  <i class="unmute fas fa-microphone"></i>`;
  for (const item of mics) {
    if (window.innerWidth <= '580') {
      item.innerHTML = mobileHtml;
    } else {
      item.innerHTML = html;
    }
  }
};



const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  const mobileHtml = `
  <i class="unmute fas fa-microphone-slash"></i>`;
  for (const item of mics) {
    if (window.innerWidth <= '580') {
      item.innerHTML = mobileHtml;
    } else {
      item.innerHTML = html;
    }
  }
};

//video toggling

const videoToggle = () => {
  let enabled = mystream.getVideoTracks()[0].enabled;
  if (enabled) {
    mystream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    mystream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  const mobileHtml = `<i class="stop fas fa-video"></i>`;
  for (const item of camera) {
    if (window.innerWidth <= '580') {
      item.innerHTML = mobileHtml;
    } else {
      item.innerHTML = html;
    }
  }
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  const mobileHtml = `<i class="stop fas fa-video-slash"></i>`
  for (const item of camera) {
    if (window.innerWidth <= '580') {
      item.innerHTML = mobileHtml;
    } else {
      item.innerHTML = html;
    }
  }
};
