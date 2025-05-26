// Ensure tesseract.js is available in your extension by including it in your manifest or using a CDN
const script = document.createElement('script');
script.src = 'https://cdn.rawgit.com/naptha/tesseract.js/1.0.19/dist/tesseract.js';
document.head.appendChild(script);

// Load user-defined keywords for spoilers
chrome.storage.sync.get({ keywords: [] }, function(data) {
  const keywords = data.keywords.map(item => item.keyword.toLowerCase());

  // Block spoilers in text content
  function blockSpoilersInText() {
    let elements = document.body.getElementsByTagName('*');

    for (let element of elements) {
      for (let node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          let textContent = node.textContent.toLowerCase();

          // Call the FastAPI server to check if the text is a spoiler using ML model
          checkIfSpoiler(textContent).then(result => {
            if (result.is_spoiler) {
              element.style.filter = "blur(5px)";
              element.title = "Spoiler blocked by ML Model";
              element.style.cursor = "pointer";
              element.setAttribute("data-blurred", "true");

              // Show "View" button on hover
              element.addEventListener('mouseenter', function() {
                if (element.getAttribute("data-blurred") === "true") {
                  showViewOption(element); 
                }
              });
              element.addEventListener('mouseleave', function() {
                setTimeout(() => {
                  if (!document.querySelector('button:hover')) {
                    hideViewOption();
                  }
                }, 300);
              });
            }
          });

          // Check user-defined keywords as a fallback
          keywords.forEach(keyword => {
            if (textContent.includes(keyword)) {
              element.style.filter = "blur(5px)";
              element.title = "Spoiler blocked by Keyword";
              element.style.cursor = "pointer";
              element.setAttribute("data-blurred", "true");

              // Show "View" button on hover
              element.addEventListener('mouseenter', function() {
                if (element.getAttribute("data-blurred") === "true") {
                  showViewOption(element); 
                }
              });
              element.addEventListener('mouseleave', function() {
                setTimeout(() => {
                  if (!document.querySelector('button:hover')) {
                    hideViewOption();
                  }
                }, 300);
              });
            }
          });
        }
      }
    }
  }

  // Function to show and hide "View" button
  function showViewOption(element) {
    hideViewOption();
    let viewButton = document.createElement('button');
    viewButton.innerText = "View";
    viewButton.style.position = "absolute";
    viewButton.style.zIndex = 1000;
    viewButton.style.padding = "10px 15px";
    viewButton.style.backgroundColor = "#FF5722";
    viewButton.style.color = "#ffffff";
    viewButton.style.border = "2px solid #ffffff";
    viewButton.style.cursor = "pointer";
    viewButton.style.borderRadius = "5px";
    viewButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    viewButton.style.fontSize = "16px";
    viewButton.style.fontWeight = "bold";
    viewButton.style.opacity = "0.9";

    let rect = element.getBoundingClientRect();
    viewButton.style.top = `${rect.top + window.scrollY + 5}px`;
    viewButton.style.left = `${rect.left + window.scrollX + rect.width - 70}px`;
    document.body.appendChild(viewButton);

    viewButton.onclick = function() {
      element.style.filter = "none";
      element.setAttribute("data-blurred", "false");
      hideViewOption();
    };
  }

  function hideViewOption() {
    const existingButton = document.querySelector('button');
    if (existingButton && existingButton.parentNode) {
      existingButton.parentNode.removeChild(existingButton);
    }
  }

  // Blur images and videos containing spoilers
  function analyzeImagesAndVideos() {
    let images = document.getElementsByTagName('img');
    let videos = document.getElementsByTagName('video');

    for (let image of images) {
      analyzeImageForSpoilers(image);
    }

    for (let video of videos) {
      analyzeVideoForSpoilers(video);
    }
  }

  // Analyze image alt text or metadata for spoilers
  function analyzeImageForSpoilers(image) {
    let altText = image.alt.toLowerCase();
    keywords.forEach(keyword => {
      if (altText.includes(keyword)) {
        image.style.filter = "blur(5px)";
      }
    });
  }

  // Capture video frames and perform OCR
  function analyzeVideoForSpoilers(video) {
    const interval = 5; // Analyze every 5 seconds
    const duration = video.duration;

    // Capture frames at intervals and run OCR
    for (let time = 0; time < duration; time += interval) {
      captureVideoFrame(video, 'jpeg', time).then(imageData => {
        performOCR(imageData).then(extractedText => {
          keywords.forEach(keyword => {
            if (extractedText.includes(keyword)) {
              video.style.filter = "blur(5px)";
            }
          });
        });
      });
    }

    // Also check subtitles
    analyzeSubtitlesForSpoilers(video);
  }

  // Capture a video frame as a data URL
  function captureVideoFrame(video, format, time) {
    return new Promise((resolve, reject) => {
      video.currentTime = time;
      video.onseeked = function() {
        let canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        resolve(canvas.toDataURL('image/' + format));
      };
      video.onerror = reject;
    });
  }

  // Perform OCR using Tesseract.js
  function performOCR(imageData) {
    return Tesseract.recognize(
      imageData,
      'eng', 
      {
        logger: m => console.log(m) 
      }
    ).then(result => {
      return result.data.text;
    });
  }

  // Analyze subtitles for spoilers
  function analyzeSubtitlesForSpoilers(video) {
    let track = video.textTracks[0];
    if (track && track.cues) {
      for (let cue of track.cues) {
        let subtitleText = cue.text.toLowerCase();
        keywords.forEach(keyword => {
          if (subtitleText.includes(keyword)) {
            video.style.filter = "blur(5px)";
          }
        });
      }
    }
  }

  // Trigger the spoiler blocking functionality on page load
  window.onload = function() {
    blockSpoilersInText();
    analyzeImagesAndVideos();
  };

  // Function to check if text is a spoiler via FastAPI server
  async function checkIfSpoiler(text) {
    try {
      // Logging the text sent for prediction
      console.log('Checking for spoiler with text:', text);
  
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text })
      });
  
      // Log the response status and data
      if (response.ok) {
        const data = await response.json();
        console.log('Received response from server:', data);
  
        // Check if the server says it's a spoiler
        return data;  // Assuming the server returns { is_spoiler: true/false }
      } else {
        console.error('Server error:', response.status);
        return { is_spoiler: false };  // Default to no spoiler if error
      }
    } catch (error) {
      console.error('Error checking spoiler:', error);
      return { is_spoiler: false };  // Default to no spoiler in case of an error
    }
  }
  
});
