import { useEffect, useState } from "react";
import axios from 'axios';
import { Button } from 'reactstrap';
import './App.css';

var mediaRecorder;

function App() {
  const [recordingFinished, setRecordingFinished] = useState(false);
  const [url, setURL] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    getPermissions();
  }, []);

  var chunks = [];

  const getAudio = () => {
    axios.get('/audio')
      .then((response) => {
        const { data } = response;

        const raw = window.atob(data);
        const binaryData = new Uint8Array(new ArrayBuffer(raw.length));

        for (let i = 0; i < raw.length; i++) {
          binaryData[i] = raw.charCodeAt(i);
        }

        const blob = new Blob([binaryData]);
        var audioURL = window.URL.createObjectURL(blob);

        setURL(audioURL);
      })
  }

  const sendToBackend = (blob) => {
    let formData = new FormData();
    formData.append('recording', blob, 'blob.wav');
    axios.post('/upload', formData, {
      'Content-type': 'multipart/form-data',
    });
  }

  const getPermissions = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorder = new MediaRecorder(stream);
  
      mediaRecorder.onstop = function(e) {
        var audio = document.createElement('audio');
        audio.controls = true;
        var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        
        sendToBackend(blob);
      }
      mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
      }
    }).catch(function(err) {
        setIsBlocked(true);
    });
  }

  const startRecording = () => {
    if (isBlocked) {
      console.log('Permission Denied');
    } else {
      console.log("recording started");
      mediaRecorder.start();
    }
  };

  const stopRecording = () => {
    setRecordingFinished(true);
    mediaRecorder.stop();
  };

  return (
    <div className="App-body">
      <p>
        Press "Record" to record and upload to server. Press "Get Audio" to retrieve audio from server to be played back.
      </p>
      <div className="App-controls">
        <Button onMouseDown={startRecording} onMouseUp={stopRecording} color="danger" disabled={recordingFinished}>
          Record
        </Button>
        <Button onClick={getAudio} color="success" disabled={!recordingFinished}>
          Get Audio
        </Button>
      </div>
      <audio src={url} controls="controls" />
    </div>
  );
}

export default App;
