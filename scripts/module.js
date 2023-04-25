import { findAutoInputConfig } from './gamepad-utils';

var Module = {
  preRun: [],
  postRun: [],

  // mupen64plus config
  coreConfig: {
    mainLoopTimingMode: 0, // 0 = requestAnimationFrame, 1+ = setTimeout(n)
    emuMode: 0 // 0 = pure_interpreter (recomended) ; 1 = cached (seems to somewhat work)
  },
  romData: undefined,
  netplay: {},
  netplayConfig: {
    player: 0 // netplay is only activated if player != 0
    // Also need to provide: 'reliableChannel' and 'unreliableChannel'
  },

  findAutoInputConfig,
  
  // end mupen64plus config
  
  print: (function() {
    return function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      // These replacements are necessary if you render to raw HTML
      //text = text.replace(/&/g, "&amp;");
      //text = text.replace(/</g, "&lt;");
      //text = text.replace(/>/g, "&gt;");
      //text = text.replace('\n', '<br>', 'g');
      console.log(text);
    };
  })(),
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    if (0) { // XXX disabled for safety typeof dump == 'function') {
      dump(text + '\n'); // fast, straight to the real console
    } else {
      console.error(text);
    }
  },
  setErrorStatus: function(message) {
    console.log("Module.setErrorStatus: %o", message);
  },
  setStatus: function(text) {
    /*
    if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
    if (text === Module.setStatus.text) return;
    var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
    var now = Date.now();
    if (m && now - Date.now() < 30) return; // if this is a progress update, skip it if too soon
    if (m) {
      text = m[1];
      progressElement.value = parseInt(m[2])*100;
      progressElement.max = parseInt(m[4])*100;
      progressElement.hidden = false;
      spinnerElement.hidden = false;
    } else {
      progressElement.value = null;
      progressElement.max = null;
      progressElement.hidden = true;
      if (!text) spinnerElement.style.display = 'none';
    }
    statusElement.innerHTML = text;
    */
  },
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
  },
  fetchFile : function(url, filepath, onload, onerror) {
    console.log("Fetching file ",filepath," from url: ",url);
    var path = filepath.substr(0, filepath.lastIndexOf('/'));
    var filename =  filepath.substr(filepath.lastIndexOf('/')+1);
    console.log("will create file at path: ", path, " and filename: ", filename);
    
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('test/pain; charset=x-user-defined');

    xhr.onreadystatechange = (e) => {
      if(xhr.readyState == 4) {
        if(xhr.status == 200) {
          try {
            console.log("size of xhr is ", xhr.response.length);
            this.FS.createDataFile(path, filename, xhr.response, true, true);
            console.log("url ", url," loaded and written to file ", filepath);
            if(onload) {
              onload();
            }
          }catch(e){
            if(onerror){
              onerror(e);  
            }
          }
        } else {
          if(onerror) {
            onerror();
          }
        }
      }
    };
    xhr.onerror = function(e) {
      console.error("error loding url: ",url," error: ", e);
      if(onerror){
        onerror(e);     
      }
    };
    xhr.open("GET", url, true);
    xhr.send();
  }
};

export default Module;
