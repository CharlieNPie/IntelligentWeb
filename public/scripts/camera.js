/**
 * Checks to see if the browser supports getUserMedia.
 * Used as part of the setUpCamera() function.
 */
function hasGetUserMedia() {
    return !!(navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);
}


/**
 * Handles the process of setting up a user's webcam for the app
 * Sets dimensions of camera window and pulls image data from canvas object
 * Allows the user to take a photo of themselves via a form button
 */
function setupCamera() {
    initDatabase();
  

    if (hasGetUserMedia()) {
        var width = 320;    // We will scale the photo width to this
        var height = 0;     // This will be computed based on the input stream
      
        var streaming = false;
      
        var video = null;
        var canvas = null;
        var photo = null;
        var startbutton = null;

        function startup() {
            video = document.getElementById('video');
            canvas = document.getElementById('canvas');
            photo = document.getElementById('photo');
            startbutton = document.getElementById('startbutton');

            var session = {
                audio: false,
                video: {
                    facingMode: 'user',
                    frameRate: {
                        min: 10 
                    },
                },
            }; 

            navigator.mediaDevices.getUserMedia(session)
            .then(function(stream) {
              video.srcObject = stream;
              video.play();
            })
            .catch(function(err) {
              console.log("An error occurred: " + err);
            });

            video.addEventListener('canplay', function(ev){
                if (!streaming) {
                  height = video.videoHeight / (video.videoWidth/width);
                
                  video.setAttribute('width', width);
                  video.setAttribute('height', height);
                  canvas.setAttribute('width', width);
                  canvas.setAttribute('height', height);
                  streaming = true;
                }
            }, false);

            startbutton.addEventListener('click', function(ev){
                takepicture();
                ev.preventDefault();
            }, false);

            clearphoto();
        }

        function clearphoto() {
            var context = canvas.getContext('2d');
            context.fillStyle = "#AAA";
            context.fillRect(0, 0, canvas.width, canvas.height);
        
            var data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
        }

        function takepicture() {
            var context = canvas.getContext('2d');
            if (width && height) {
              canvas.width = width;
              canvas.height = height;
              context.drawImage(video, 0, 0, width, height);
            
              var data = canvas.toDataURL('image/png');
              photo.setAttribute('src', data);
              document.getElementById('output').removeAttribute('hidden');
              var videoFeed = document.getElementById("video");
              videoFeed.style.display = 'none';
            } else {
              clearphoto();
            }
          }

        
          window.addEventListener('load', startup(), false);

    }
    else {
        alert('getUserMedia() is not supported in your browser');
    }
  
  $(function () {
    $(".addPost").on("submit", function(event) {
      event.preventDefault();
    })
  })

}
