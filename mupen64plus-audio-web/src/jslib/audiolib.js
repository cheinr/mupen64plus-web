mergeInto(LibraryManager.library, {

  createWebAudioContext: function(freq) {
    console.error('******** game required freq: ',freq);
    if(!Module.audio)
    {
      Module.audio = {};
    }
    console.error('###############SOUND INITIALIZING ################');
    if(!Module)
    {
      console.error('Cant initialize our audio context as module defined...');
      return;
    }
    Module.audio.context = Module.audio.context || new (window.AudioContext || window.webkitAudioContext)();
    Module.audio.channels = 2;
    Module.audio.BUFFER_LENGTH_MS = 100;
    Module.audio.BUFFER_LENGTH_S =  Module.audio.BUFFER_LENGTH_MS / 1000.0;
    Module.audio.LOOKAHEAD = (Module.audio.BUFFER_LENGTH_MS - 1) / 1000.0;
    Module.audio.SAMPLE_RATE = freq;
    Module.audio.soundStopTime = 0;
    Module.audio.TIME_BETWEEN_BUFFERS = 0.1;
    Module.audio.lastHWUpdate = 0;
    
  },

  updateWebAudioBuffer: function(pBuffer, bufferSize) {
    // We have a buffer pointer and number of samples
    // Just pass them to webaudio.

    if(!pBuffer || bufferSize < 1)
    {
      return 0;
    }
    
    var now = Module.audio.context.currentTime;
    var numSamples = bufferSize / 4; // 2 channels of 16bit sound, 4 bytes per sample.

    // Unpack our samples into a new webaudio buffer
    var newBuffer = Module.audio.context.createBuffer(2, numSamples, Module.audio.SAMPLE_RATE);
    soundDataLeft = newBuffer.getChannelData(0);
    soundDataRight = newBuffer.getChannelData(1);
    
    var n  = 0; // number of sample frames generated
    for(var i=0; i < bufferSize/4; i++) {

      var leftAddress = pBuffer + i * 4;
      var rightAddress = leftAddress + 2;
      var leftsample = getValue(leftAddress, 'i16')/32768.0;
      var rightsample = getValue(rightAddress, 'i16')/32768.0;

      soundDataLeft[n] = leftsample;
      soundDataRight[n] = rightsample;
      n++;
    }

    if(Module.audio.soundStopTime < now)
    {
      Module.audio.soundStopTime = now + 0.2; // 200 millisecond lookahead
    }
    
    var bufferSource = Module.audio.context.createBufferSource();
    bufferSource.buffer = newBuffer;
    bufferSource.connect(Module.audio.context.destination);
    
    bufferSource.start(Module.audio.soundStopTime);
    Module.audio.soundStopTime = Module.audio.soundStopTime + newBuffer.duration;

    return n;
  }
});
