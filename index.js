let isDictating = false
let isSpeaking = false
// Print out element
const contentFinal = document.querySelector('#content--final')
const contentInterim = document.querySelector('#content--interim')

// Button
const micButton = document.querySelector('.button.mic')
const speakButton = document.querySelector('.button.speak')
const icon = document.querySelector('#mic-icon')

// SLIDES
const slideContainer = document.querySelector('.slides')
const slides = document.querySelectorAll('.slide')
let activeSlide = 0

var codewords = [ 'development', 'javascript' ];

const recognition = new webkitSpeechRecognition()
// set params
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

// CONTENT
let finalTranscript = ''

let start
// ON START
recognition.onstart = () => {
  start = new Date()
  console.log('Listening:', start);
  isDictating = true
  icon.src="mic-off.svg"
  finalTranscript = ''
  contentFinal.innerHTML = ''
  contentInterim.innerHTML = ''
}

// ON RESULT
recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    let interimTranscript = ''
    if ((slides.length - 1) > activeSlide) {
      if (event.results[i].isFinal) {
        if (event.results[i][0].transcript.trim() === 'next') {
          handleSlideChange('forward')
        } else if (event.results[i][0].transcript.trim() === 'previous') {
          handleSlideChange('backward')
        }
      }
    } else {
      speakButton.classList.add('visible')
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Highlight codewords
      let result = finalTranscript.split(' ').map(item => codewords.includes(item.toLowerCase()) ? `<span class="highlight">${item}</span>` : item).join(' ')

      result = capitalize(result)
      contentFinal.innerHTML = linebreak(result);
      contentInterim.innerHTML = linebreak(interimTranscript);
    }
  }
}

const handleSlideChange = (direction) => {
  slides[activeSlide].classList.remove('active')
  const newIndex = direction === 'forward' ? activeSlide + 1 : activeSlide - 1
  activeSlide = newIndex
  slides[newIndex].classList.add('active')
  slideContainer.setAttribute('class', `slides slide-${newIndex}`)
}


// ON SPEECH END

// ON END
recognition.onend = () => {
  // const end = new Date()
  // const diffTime = Math.abs(start - end);
  // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  // console.log('Difference milliseconds', diffTime)
  // console.log('Difference seconds', Math.ceil(diffTime / 1000))
  // console.log('Difference minutes', Math.ceil(diffTime / (1000 * 60)))
  isDictating = false
  icon.src="mic-on.svg"
}

// ON ERROR
recognition.onerror = (event) => {
  console.error('error?');
  console.error(event);
}

micButton.onclick = () => toggleListener()
speakButton.onclick = () => toggleSpeaker()

const toggleListener = () => {
  if (isDictating) {
    recognition.stop()
    return
  }
  recognition.start();
}

const toggleSpeaker = () => {
  if (!isSpeaking) {
    recognition.stop()
    isSpeaking = true
    const message = new SpeechSynthesisUtterance(contentFinal.textContent);
    window.speechSynthesis.speak(message);

    message.onend = () => {
      console.log('speak ended')
      isSpeaking = false
    }
  }
}

// Helpers
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

