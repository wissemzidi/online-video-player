function getCurrentTime(currentTime) {
  let seconds = Math.round(currentTime % 60).toString();
  let minutes = Math.round((currentTime / 60) % 60).toString();
  let hours = Math.round(currentTime / 60 / 60).toString();
  seconds.length < 2 ? (seconds = "0" + seconds) : "";
  minutes.length < 2 ? (minutes = "0" + minutes) : "";
  hours.length < 2 ? (hours = "0" + hours) : "";
  return { hours, minutes, seconds };
}

class Player {
  constructor(video, timeCount, timeRange) {
    this.video = video;
    this.timeCount = timeCount;
    this.timeRange = timeRange;
  }

  updateTime() {
    let { hours, minutes, seconds } = getCurrentTime(this.video.currentTime);
    $(this.timeCount).text(hours + ":" + minutes + ":" + seconds);
    $(this.timeRange).css(
      "--current-percentage",
      (this.video.currentTime * 100) / this.video.duration + "%"
    );
  }

  changeTime(newTime) {
    this.video.currentTime = newTime;
    this.updateTime();
  }

  playPause() {
    const playPauseIcon = $("#playPause i");
    if (this.video.paused) {
      // playing....
      playPauseIcon.addClass("fa-pause");
      playPauseIcon.removeClass("fa-play");
      this.video.play();
    } else {
      // pausing...
      playPauseIcon.addClass("fa-play");
      playPauseIcon.removeClass("fa-pause");
      this.video.pause();
    }
  }

  resetTime() {
    this.video.currentTime = 0;
    this.updateTime();
  }
  forward() {
    this.video.currentTime += 10;
    this.animateCenterBtn("fa-forward");
    this.updateTime();
  }
  backward() {
    this.video.currentTime -= 10;
    this.animateCenterBtn("fa-backward");
    this.updateTime();
  }

  isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  fullScreen() {
    let videoContainer = document.getElementById("video_container");
    if (this.isFullscreen()) {
      // exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      videoContainer.requestFullscreen();
    }
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    this.animateCenterBtn(
      this.video.muted ? "fa-volume-xmark" : "fa-volume-high"
    );
    $("#toggleMute i").toggleClass("fa-volume-xmark fa-volume-high");
  }

  volumeUp() {
    if (this.video.volume > 0.9) return;
    this.video.volume += 0.1;
    this.animateCenterBtn("fa-volume-high");
    $("#volume").css("--volume", this.video.volume * 100 + "%");
    $("#volume").val(this.video.volume * 100);
  }
  volumeDown() {
    if (this.video.volume < 0.1) return;
    this.video.volume -= 0.1;
    this.animateCenterBtn("fa-volume-low");
    $("#volume").css("--volume", this.video.volume * 100 + "%");
    $("#volume").val(this.video.volume * 100);
  }
  changeVolume(newVolume) {
    this.video.volume = newVolume / 100;
    $("#volume").css("--volume", newVolume + "%");
  }

  changeSrc(newSrc) {
    this.video.src = newSrc;
  }

  animateCenterBtn(iconClass) {
    $("#center_btn i").addClass("fa-solid " + iconClass);
    setTimeout(() => {
      $("#center_btn").fadeIn(300).fadeOut(600);
      setTimeout(() => {
        $("#center_btn i").removeClass("fa-solid " + iconClass);
      }, 1000);
    }, 200);
  }
}

let player = new Player(
  document.getElementById("main_vid"),
  document.getElementById("time_value"),
  document.getElementById("time_range")
);

// on document ready
$(function () {
  $("#video_link_form").on("submit", function (e) {
    e.preventDefault();
    player = new Player(
      document.getElementById("main_vid"),
      document.getElementById("time_value"),
      document.getElementById("time_range")
    );
    player.changeSrc($("#video_link").val());
    $("#toggle_video_link_form_btn").click();
    player.playPause();
  });

  $(document).on("keydown", function (e) {
    switch (e.key) {
      case "F11":
        e.preventDefault();
        player.fullScreen();
        break;
      case "f":
        e.preventDefault();
        player.fullScreen();
        break;
      case "F":
        e.preventDefault();
        player.fullScreen();
        break;
      case "ArrowRight":
        e.preventDefault();
        player.forward();
        break;
      case "ArrowLeft":
        e.preventDefault();
        player.backward();
        break;
      case "ArrowUp":
        e.preventDefault();
        player.volumeUp();
        break;
      case "ArrowDown":
        e.preventDefault();
        player.volumeDown();
        break;
      case " ":
        e.preventDefault();
        player.playPause();
        break;
      case "m":
        e.preventDefault();
        player.toggleMute();
        break;
      case "M":
        e.preventDefault();
        player.toggleMute();
        break;
    }
  });

  $("#toggle_video_link_form_btn").on("click", function () {
    $("#video_link_form").fadeToggle(300);
    $("#toggle_video_link_form_btn i").toggleClass(
      "fa-chevron-up fa-chevron-down"
    );
    let time_interval = setInterval(function () {
      player.updateTime();
    }, 1000);
  });

  let counter = 0;
  let counterInterval = setInterval(() => {
    counter++;
    if (counter > 5) {
      $("#controls").fadeOut(800);
    }
  }, 1000);

  $("#time_range").on("mousemove", function (e) {
    $(this).css("--indicator-left-pos", e.clientX - 12 + "px");
  });

  $(document).on("mousemove", function (e) {
    $("#controls").fadeIn(300);
    clearInterval(counterInterval);
    counter = 0;
    counterInterval = setInterval(() => {
      counter++;
      if (counter > 5) {
        $("#controls").fadeOut(800);
      }
    }, 1000);
  });

  $("#time_range").on("input", function () {
    player.changeTime(
      Math.round(($(this).val() * player.video.duration) / 100)
    );
  });
  $("#volume").on("input", function () {
    player.changeVolume($(this).val());
  });
});
