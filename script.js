function getCurrentTime(currentTime) {
  let seconds = Math.floor(currentTime % 60).toString();
  let minutes = Math.floor((currentTime / 60) % 60).toString();
  let hours = Math.floor(currentTime / 3600).toString();
  seconds.length < 2 ? (seconds = "0" + seconds) : "";
  minutes.length < 2 ? (minutes = "0" + minutes) : "";
  hours.length < 2 ? (hours = "0" + hours) : "";
  return { hours, minutes, seconds };
}

class Player {
  constructor(videoUrl, video, timeCount, timeRange) {
    this.videoUrl = videoUrl;
    this.video = video;
    this.source = document.querySelector("source");
    this.timeCount = timeCount;
    this.timeRange = timeRange;

    this.source.src = videoUrl;
    this.video.load();
    this.video.play();

    handlePlayerError(this.video);
  }

  updateTime() {
    this.video.addEventListener("progress", (e) => {
      let bufferedDuration = Math.round(
        (this.video.buffered.end(this.video.buffered.length - 1) * 100) /
          this.video.duration
      );
      $("#bufferingIndicator").css(
        "--buffered-percentage",
        bufferedDuration + "%"
      );
    });
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

  changeSpeed() {
    let currSpeed = $(this.video).attr("speed");
    if (currSpeed >= 2) {
      this.video.playbackRate = this.video.playbackRate = 0.5;
    } else {
      this.video.playbackRate += 0.25;
    }
    $("#currentSpeed").text(this.video.playbackRate);
    $(this.video).attr("speed", this.video.playbackRate);
  }

  playPause() {
    const playPauseIcon = $("#playPause img");
    const centerBtn = $("#center_btn img");
    if (this.video.paused) {
      // playing....
      playPauseIcon.attr("src", "./icons/pause.svg");
      centerBtn.attr("src", "./icons/pause.svg");
      this.animateActionsBtn("pause");
      this.video.play();
    } else {
      // pausing...
      playPauseIcon.attr("src", "./icons/play.svg");
      centerBtn.attr("src", "./icons/play.svg");
      this.animateActionsBtn("play");
      this.video.pause();
    }
  }

  resetTime() {
    this.video.currentTime = 0;
    this.updateTime();
  }
  forward() {
    this.video.currentTime += 10;
    this.animateActionsBtn("forward");
    this.updateTime();
  }
  backward() {
    this.video.currentTime -= 10;
    this.animateActionsBtn("backward");
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
    const videoContainer = document.getElementById("video_container");
    let wakeLock = null;
    if (this.isFullscreen()) {
      // exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      screen.orientation.unlock();
      if ("wakeLock" in navigator && wakeLock != null) {
        wakeLock.release("screen");
      }
    } else {
      if (videoContainer.mozRequestFullScreen) {
        videoContainer.mozRequestFullScreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else {
        videoContainer.requestFullscreen();
      }
      screen.orientation.lock("landscape");
      if ("wakeLock" in navigator) {
        wakeLock = navigator.wakeLock.request("screen");
      }
    }
  }

  goFullScreen() {
    if (!this.isFullscreen()) {
      this.fullScreen();
    }
  }

  toggleFillScreen() {
    const videoContainer = document.getElementById("video_container");
    if ($(videoContainer).attr("fill") == "true") {
      $(videoContainer).attr("fill", "false");
      $(videoContainer).height("auto");
    } else {
      $(videoContainer).attr("fill", "true");
      $(videoContainer).height(screen.height);
    }
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    this.animateActionsBtn(this.video.muted ? "mute" : "volume");
    if (this.video.muted) {
      $("#volume").css("--volume", 0);
      $("#volume").val(0);
      $("#toggleMute img").attr("src", "./icons/mute.svg");
    } else {
      $("#volume").css("--volume", 100);
      $("#volume").val(100);
      $("#toggleMute img").attr("src", "./icons/volume.svg");
    }
  }

  volumeUp() {
    this.video.muted = false;
    this.video.volume += 0.1;
    $("#volume").css("--volume", this.video.volume * 100 + "%");
    $("#volume").val(this.video.volume * 100);
    this.animateActionsBtn("volumeUp");
  }
  volumeDown() {
    this.video.muted = false;
    this.video.volume -= 0.1;
    $("#volume").css("--volume", this.video.volume * 100 + "%");
    $("#volume").val(this.video.volume * 100);
    this.animateActionsBtn("volumeDown");
  }
  changeVolume(newVolume) {
    if (newVolume <= 0) {
      $("#toggleMute img").attr("src", "./icons/mute.svg");
      this.animateActionsBtn("mute");
    } else {
      this.video.muted = false;
      $("#toggleMute img").attr("src", "./icons/volume.svg");
    }

    this.video.volume = newVolume / 100;
    $("#volume").val(newVolume);
    $("#volume").css("--volume", newVolume + "%");
  }

  changeAspectRatio() {
    let aspectIndex = Number($(this.video).attr("aspectIndex"));
    aspectIndex >= 3 ? (aspectIndex = 0) : (aspectIndex += 1);
    $(this.video).attr("aspectIndex", aspectIndex);
    switch (aspectIndex) {
      case 0:
        $(this.video).css("aspect-ratio", "auto");
        $("#aspectRatio span").text("Auto");
        $(this.video).css("max-height", "100vh");
        $(this.video).css("max-width", "100vw");
        $(this.video).width("auto");
        $(this.video).height("auto");
        break;
      case 1:
        $(this.video).css("aspect-ratio", "16/9");
        $("#aspectRatio span").text("16:9");
        break;
      case 2:
        $(this.video).css("aspect-ratio", "auto");
        $(this.video).css("max-height", "none");
        $(this.video).css("max-width", "100vw");
        $(this.video).width(screen.width);
        $("#aspectRatio span").text("WFill");
        break;
      case 3:
        $(this.video).css("aspect-ratio", "auto");
        $(this.video).css("max-height", "100vh");
        $(this.video).css("max-width", "none");
        $(this.video).height(screen.height);
        $("#aspectRatio span").text("HFill");
        break;
      // case 3:
      //   $(this.video).css("max-height", "100vh");
      //   $(this.video).width("auto");
      //   $(this.video).css("aspect-ratio", "4/3");
      //   $("#aspectRatio span").text("4:3");
      //   break;
      // case 4:
      //   $(this.video).css("aspect-ratio", "1/1");
      //   $("#aspectRatio span").text("1:1");
      //   break;
    }
  }

  animateActionsBtn(iconName) {
    $("#actions_viewer img").attr("src", `./icons/${iconName}.svg`);
    $("#actions_viewer").fadeTo(150, 0.5).fadeOut(250);
  }

  hideControls(animationDuration) {
    $("#controls").fadeOut(animationDuration);
    $("#center_btn").fadeOut(animationDuration);
    $("#dimmBg").fadeOut(animationDuration);
  }
  showControls(animationDuration) {
    $("#controls").fadeIn(animationDuration);
    $("#center_btn").fadeIn(animationDuration);
    $("#dimmBg").fadeIn(animationDuration);
  }
  toggleControls(animationDuration) {
    $("#controls").fadeToggle(animationDuration);
    $("#center_btn").fadeToggle(animationDuration);
    $("#dimmBg").fadeToggle(animationDuration);
  }
}

let player = new Player(
  "",
  document.getElementById("main_vid"),
  document.getElementById("time_value"),
  document.getElementById("time_range")
);

// on document ready
$(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const movieUrl = decodeURI(urlParams.get("url"));

  if (
    movieUrl != "null" &&
    movieUrl != null &&
    movieUrl.trim() != "" &&
    movieUrl != undefined
  ) {
    player = new Player(
      movieUrl,
      document.getElementById("main_vid"),
      document.getElementById("time_value"),
      document.getElementById("time_range")
    );
    let time_interval = setInterval(function () {
      player.updateTime();
    }, 1000);
    $(document).on("mousemouve", function (e) {
      player.fullScreen();
    });
  } else {
    window.location.href = "./entry.html";
  }

  listenToKeyEvents();

  let counter = 0;
  setInterval(() => {
    counter++;
    if (counter > 3) {
      player.hideControls(400);
    }
  }, 1000);

  $("#time_range").on("mousemove", function (e) {
    $(this).css("--indicator-left-pos", e.clientX - 12 + "px");
  });

  $("#time_range").on("input", function () {
    player.changeTime(
      Math.round(($(this).val() * player.video.duration) / 100)
    );
  });
  $("#volume").on("input", function () {
    player.changeVolume($(this).val());
  });

  $(".control_btn").on("click", function () {
    counter = 0;
  });

  $("#volume").on("click input mousemove", function (e) {
    player.showControls(200);
    counter = 0;
  });

  //
  //
  // * Phone features Only
  //
  if (!window.matchMedia("(hover: hover)").matches) {
    $(player.video).on("click", player.showControls(200));

    let startTouchPos = null;
    $("#video_container").on("touchmove", function (e) {
      if (startTouchPos == null) {
        startTouchPos = e.touches[0].clientX;
      }

      player.video.currentTime += e.touches[0].clientX - startTouchPos;
      player.showControls(100);
      counter = 0;
    });
    $("#video_container").on("touchend", function (e) {
      startTouchPos = null;
    });

    let dblclickLeft = null;
    $("#videoLeftSide").on("click", function () {
      if (dblclickLeft == null) {
        dblclickLeft = true;
        dblclickTimer = setTimeout(() => {
          dblclickLeft = null;
        }, 200);
      } else {
        dblclickLeft = null;
        clearTimeout(dblclickTimer);
        player.backward();
        $(this).css("opacity", 1);
        setTimeout(() => {
          $(this).css("opacity", 0);
        }, 300);
      }
    });

    let dblclickRight = null;
    $("#videoRightSide").on("click", function () {
      if (dblclickRight == null) {
        dblclickRight = true;
        dblclickTimer = setTimeout(() => {
          dblclickRight = null;
        }, 200);
      } else {
        dblclickRight = null;
        clearTimeout(dblclickTimer);
        player.forward();
        $(this).css("opacity", 1);
        setTimeout(() => {
          $(this).css("opacity", 0);
        }, 300);
      }
    });

    $("#video_container").on("click", function (e) {
      if (
        e.target.tagName.toUpperCase() == "IMG" ||
        e.target.tagName.toUpperCase() == "VIDEO" ||
        e.target.tagName.toUpperCase() == "INPUT"
      ) {
        player.showControls(200);
        counter = 0;
      } else {
        player.toggleControls(200);
        counter = 0;
      }
    });
  } else {
    //
    //
    // * PC features Only
    //

    $(document).on("mousemove", function () {
      player.showControls(200);
      counter = 0;
    });

    $("#video_container").on("click input mousemove mousedown", function (e) {
      player.showControls(200);
      counter = 0;
    });

    player.video.onclick = () => {
      player.playPause();
      counter = 0;
    };
    player.video.ondblclick = () => {
      player.fullScreen();
    };
  }
});

function listenToKeyEvents() {
  $(document).on("keydown", function (e) {
    switch (e.key.toUpperCase()) {
      case "F11":
      case "F":
        e.preventDefault();
        player.fullScreen();
        break;
      case " ":
      case "K":
        player.playPause();
        break;
      case "M":
        player.toggleMute();
        break;
      case "ARROWRIGHT":
      case "L":
        player.forward();
        break;
      case "ARROWLEFT":
      case "J":
        player.backward();
        break;
      case "ARROWUP":
        player.volumeUp();
        break;
      case "ARROWDOWN":
        player.volumeDown();
        break;
      case "S":
        player.changeSpeed();
        break;
      case "+":
      case "-":
        player.changeAspectRatio();
        break;
    }
  });
}

function handlePlayerError(video) {
  video.onerror = (e) => {
    $(".spinner").hide();
    $("#errorContainer").text(`${e.type.toUpperCase()}, resource not found.`);
  };

  video.addEventListener("waiting", (e) => {
    $(".spinner").show();
  });
  video.addEventListener("canplay", (e) => {
    $(".spinner").hide();
  });
}
