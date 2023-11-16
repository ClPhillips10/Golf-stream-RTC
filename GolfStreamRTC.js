import './style.css';
import firebase from 'firebase/app';
import'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC1ne_M2O-AhOYsfiRstNUUnRYbQ52MqoM",
    authDomain: "golf-stream.firebaseapp.com",
    projectId: "golf-stream",
    storageBucket: "golf-stream.appspot.com",
    messagingSenderId: "1004887959435",
    appId: "1:1004887959435:web:527debc0d37a83b05cf18e",
    measurementId: "G-40LY1TG74H"
  };
  if (!firebase.getApps.length){
    firebase.initializeApp(firebaseConfig);
  }
  const servers = {
    iceServers:[
        {
            urls: ['stun:stun1.1.google.com:19302','stun:stun2.1.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
  };
//Global state
  let pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButton = document.getElementById('callButton');
const answerButton = document.getElementById('answerButton');
const removeVideo = document.getElementById('removeVideo');
const hangupButton = document.getElementById('hangupButton');

webcamButtom.onclick = async() => {

}
localStream = await navigator.mediaDevices.getUserMedia({Audio : true ,video : true});
remoteStream = new MediaStream();
// push tracks from local stream to peer connection
localStream.getTracks().forEach((track)=>{
    pc.addTrack(track, localStream);
});
// pull tracks from remote stream, add video to stream
pc.ontrack = event => {
    event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
    });
};
webcamVideo.srcObject = localStream;
remoteVideo.srcObject = remoteStream;

// create an offer
callButton.onclick = async () => {
// reference firestore collection
    const callDoc = firestore.Collection('calls').doc();
const offerCandidates = callDoc.Collection('offerCandidates');

callInput.value = callDoc.id;
//  Get candidates for caller,save to db
pc.onicecandidate = event => {
    event.candidate&& offerCandidates.add(event.candidate.toJSON());
};
// create offer 

const offerDescription = await pc.createOffer();
await pc.setLocalDescription(offerDescription);

const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
    };
    await callDoc.set({offer});
//  Listen for remote amswer 
callDoc.onSnapshot((onSnapshot)=>{
    const data = onSnapshot.data();
    if (!pc.currentRemoteDescription && data?.answer){
        const answerdescription  = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerdescription);
    }
});
// when answered, add candiddate to peer connection
answerCandidates.onSnapshot(snapshot => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === 'added'){ 
            const candidate = new RTCIceCandidate (change.doc.data());
            pc.addIceCandidate();
        }

    });
    // Answer the call with the unique ID
    answerButton.onclick = async () => {
        const callId = callInput.value;
        const callDoc = firestore.Collection('calls').doc(callId);
        const answerCandidates = callDoc.Collection('answerCandidates')
    }
})
};

