function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var milliseconds = now.getMilliseconds();
  
    // 将小时、分钟、秒数和毫秒格式化为两位数或三位数
    hours = formatTime(hours);
    minutes = formatTime(minutes);
    seconds = formatTime(seconds);
    milliseconds = formatMilliseconds(milliseconds);
  
    // 获取 clock 元素
    var clock = document.getElementById("clock");
  
    // 更新时钟的显示
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
  
  // 每毫秒更新一次时钟
  setInterval(updateClock, 1);