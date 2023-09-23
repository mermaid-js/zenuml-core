
function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var milliseconds = now.getMilliseconds();
    hours = formatTime(hours);
    minutes = formatTime(minutes);
    seconds = formatTime(seconds);
    milliseconds = formatMilliseconds(milliseconds);
    var clock = document.getElementById("clock");
    clock.textContent = hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }
  
  function formatTime(time) {
    if (time < 10) {
      return "0" + time;
    } else {
      return time;
    }
  }
  
  function formatMilliseconds(milliseconds) {
    if (milliseconds < 10) {
      return "00" + milliseconds;
    } else if (milliseconds < 100) {
      return "0" + milliseconds;
    } else {
      return milliseconds;
    }
  }
  
  setInterval(updateClock, 1);