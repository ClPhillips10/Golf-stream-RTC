
import firebase from 'firebase/app';

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

  let pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButton = document.getElementById('callButton');
const answerButton = document.getElementById('answerButton');
const removeVideo = document.getElementById('removeVideo');
const hangupButton = document.getElementById('hangupButton');

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
const callDoc = firestore.Collection('calls').doc();
const offerCandidates = callDoc.Collection('offerCandidates');

callInput.value = callDoc.id;

// create offer 

const offerDescription = await pc.createOffer();
await pc.setLocalDescription(offerDescription);

const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
    };
//  Listen for remote amswer 
callDoc.onSnapshot((onSnapshot)=>{
    const data = onSnapshot.data();
    if (!pc.currentRemoteDescription && data?.answer){
        const answerdescription  = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerdescription);
    }
});

// when answered, add candidate to peer connection
answerCandidates.onSnapshot(onSnapshot => {
    onSnapshot.docChanges().forEach((change)=> {
        if(change.type === 'added'){
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
        }
    });
});


// answer the call with the unique ID
answerButto.onclick = async () => {
    const callId = callInput.value;
    const callDoc = firestore.Collection('calls').doc(callId);
    const answerCandidates = callDoc.Collection('answerCandidates');

    pc.onicecandidate = event => {
        event.candidate && answerCandidates.add(event.candidate.toJSON());
    };
}
const callData = (await callDoc.get()).data();

const offerDescription = callData.offer;
await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
const answerdescription = await pc.createAnswer();
await pc.setLocalDescription(answerdescription);

const answer = {
type : answerdescription.type,
sdp : answerdescription.sdp,
};
await callDoc.update({answer});

offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((changes) => {
        console.log(change)
        if(change.type === 'added'){
            let data = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(data));
        }
    })
});

};

