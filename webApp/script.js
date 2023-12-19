"use strict";

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
  constructor(videoUrl, video, timeCount, timeRange, title, time) {
    this.videoUrl = videoUrl;
    this.video = video;
    this.source = document.querySelector("source");
    this.timeCount = timeCount;
    this.timeRange = timeRange;
    this.counter = 0;
    if (title != undefined && title.toString() != "null") {
      $("#video_title").text(`${title}`);
    }
    if (
      time != undefined &&
      time.toString() != "null" &&
      !isNaN(time.toString())
    ) {
      player.changeTime(time);
    }

    this.source.src = videoUrl;
    this.video.load();

    this.time_interval = initMainInterval();

    handlePlayerError(this.video);
    listenToKeyEvents();
  }

  updateTime() {
    $(this.timeRange).val(this.video.currentTime);
    saveCurrTime();

    let { hours, minutes, seconds } = getCurrentTime(this.video.currentTime);
    $(this.timeCount).text(hours + ":" + minutes + ":" + seconds);
    $(this.timeRange).css(
      "--current-percentage",
      (this.video.currentTime * 100) / this.video.duration + "%"
    );

    this.video.played ? this.counter++ : "";
    this.counter > 3 && !this.video.paused ? this.hideControls(300) : "";
  }

  changeTime(newTime) {
    this.video.currentTime = newTime;
    this.updateTime();
    this.counter = 0;
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
      this.video.play();
    } else {
      // pausing...
      playPauseIcon.attr("src", "./icons/play.svg");
      centerBtn.attr("src", "./icons/play.svg");
      this.video.pause();
    }
  }
  play() {
    const playPauseIcon = $("#playPause img");
    const centerBtn = $("#center_btn img");
    // playing....
    playPauseIcon.attr("src", "./icons/pause.svg");
    centerBtn.attr("src", "./icons/pause.svg");
    this.video.play();
  }
  pause() {
    const playPauseIcon = $("#playPause img");
    const centerBtn = $("#center_btn img");
    // pausing...
    playPauseIcon.attr("src", "./icons/play.svg");
    centerBtn.attr("src", "./icons/play.svg");
    this.video.pause();
  }

  replay() {
    this.video.currentTime = 0;
    this.updateTime();
  }
  forward() {
    this.video.currentTime += 10;
    this.updateTime();
    $("#videoRightSide").css("opacity", 1);
    setTimeout(() => {
      $("#videoRightSide").css("opacity", 0);
    }, 300);
  }
  backward() {
    this.video.currentTime -= 10;
    this.updateTime();
    $("#videoLeftSide").css("opacity", 1);
    setTimeout(() => {
      $("#videoLeftSide").css("opacity", 0);
    }, 300);
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
    if (this.video.muted) {
      $("#toggleMute img").attr("src", "./icons/mute.svg");
    } else {
      $("#toggleMute img").attr("src", "./icons/volume.svg");
    }
  }

  changeAspectRatio() {
    let aspectIndex = Number($(this.video).attr("aspectIndex"));
    aspectIndex >= 3 ? (aspectIndex = 0) : (aspectIndex += 1);
    $(this.video).attr("aspectIndex", aspectIndex);
    switch (aspectIndex) {
      case 0:
        $(this.video).css("aspect-ratio", "auto");
        $("#aspectRatio span").text("Auto");
        popupTimedMsg("Aspect Ratio : Auto", 3000, 300);
        $(this.video).css("max-height", "100vh");
        $(this.video).css("max-width", "100vw");
        $(this.video).width("100vw");
        $(this.video).height("100vh");
        break;
      case 1:
        $(this.video).css("aspect-ratio", "16/9");
        popupTimedMsg("Aspect Ratio : 16 / 9", 3000, 300);
        $("#aspectRatio span").text("16:9");
        break;
      case 2:
        $(this.video).css("aspect-ratio", "auto");
        $(this.video).css("max-height", "none");
        $(this.video).css("max-width", "100vw");
        $(this.video).width(screen.width);
        $(this.video).height("auto");
        $("#aspectRatio span").text("WFill");
        popupTimedMsg("Aspect Ratio : Width fill", 3000, 300);
        break;
      case 3:
        $(this.video).css("aspect-ratio", "auto");
        $(this.video).css("max-height", "100vh");
        $(this.video).css("max-width", "none");
        $(this.video).height(screen.height);
        $(this.video).width("auto");
        $("#aspectRatio span").text("HFill");
        popupTimedMsg("Aspect Ratio : Height fill", 3000, 300);
        break;
    }
  }

  hideControls(animationDuration) {
    $("#controls").stop(true, false).fadeOut(animationDuration);
    $("#center_btn").stop(true, false).fadeOut(animationDuration);
    $("#dimmBg").stop(true, false).fadeOut(animationDuration);
    $("#video_header").stop(true, false).fadeOut(animationDuration);
  }
  showControls(animationDuration) {
    $("#controls").stop(true, false).fadeIn(animationDuration);
    $("#center_btn").stop(true, false).fadeIn(animationDuration);
    $("#dimmBg").stop(true, false).fadeIn(animationDuration);
    $("#video_header").stop(true, false).fadeIn(animationDuration);
    this.counter = 0;
  }
  toggleControls(animationDuration) {
    $("#controls").stop(true, false).fadeToggle(animationDuration);
    $("#center_btn").stop(true, false).fadeToggle(animationDuration);
    $("#dimmBg").stop(true, false).fadeToggle(animationDuration);
    $("#video_header").stop(true, false).fadeToggle(animationDuration);
    this.counter = 0;
  }
}

var is_player_created = false;
var player = null;

function loadLocalVideo() {
  let file = document.getElementById("video_file").files[0];
  let fileName = file.name;
  let fileURL = window.URL.createObjectURL(file);
  player = new Player(
    fileURL,
    document.getElementById("main_vid"),
    document.getElementById("time_value"),
    document.getElementById("time_range"),
    fileName
  );
  activate_player();
  popupTimedMsg(" Loading video  ", 2000, 200);
  return;
}

function activate_player() {
  handleShowHideControls();
  handleTouchMove();

  $(".control_btn").on("click", function () {
    player.counter = 0;
  });
}

function initMainInterval() {
  return setInterval(function () {
    player.updateTime();
  }, 1000);
}

function handleTouchMove() {
  let startTouchPos = null;
  let timeCurrentPercentage = null;
  let changePercentage = 0;
  $(`#${player.video.id}, #videoLeftSide, #videoRightSide`).on(
    "touchmove",
    function (e) {
      if (startTouchPos == null || timeCurrentPercentage == null) {
        player.pause();
        clearInterval(player.time_interval);
        startTouchPos = e.touches[0].clientX;
        timeCurrentPercentage = Number(
          $("#time_range").css("--current-percentage").replace("%", "")
        );
      }
      changePercentage =
        ((e.changedTouches[0].clientX - startTouchPos) * 100) / screen.width;
      let newPercentage = timeCurrentPercentage + changePercentage;
      newPercentage >= 100 ? (newPercentage = 100) : "";
      newPercentage <= 0 ? (newPercentage = 0) : "";
      $("#time_range").css(
        "--current-percentage",
        newPercentage.toString() + "%"
      );
      let { hours, minutes, seconds } = getCurrentTime(
        (player.video.duration * newPercentage) / 100
      );
      $(player.timeCount).text(hours + ":" + minutes + ":" + seconds);
      player.showControls(100);
    }
  );
  $(`#${player.video.id}, #videoLeftSide, #videoRightSide`).on(
    "touchend",
    function (e) {
      if (changePercentage == null || timeCurrentPercentage == null) {
        return;
      }

      if (changePercentage > 0) {
        player.video.currentTime +=
          (changePercentage * player.video.duration) / 100;
      } else {
        player.video.currentTime -=
          (Math.abs(changePercentage) * player.video.duration) / 100;
      }
      startTouchPos = null;
      timeCurrentPercentage = null;
      player.updateTime();
      player.time_interval = setInterval(function () {
        player.updateTime();
      }, 1000);
      player.play();
    }
  );
}

function handleShowHideControls() {
  $("#video_container").on("click", function (e) {
    if (
      e.target.tagName.toUpperCase() == "IMG" ||
      e.target.tagName.toUpperCase() == "BUTTON" ||
      e.target.tagName.toUpperCase() == "SPAN" ||
      e.target.tagName.toUpperCase() == "INPUT"
    ) {
      player.showControls(200);
    } else {
      player.toggleControls(200);
    }
  });
}

function handlePlayerError(video) {
  video.onerror = (e) => {
    $(".spinner").hide();
    player.hideControls(100);
    $("#errorContainer").text(`${e.type.toUpperCase()}, resource not found.`);
  };

  video.addEventListener("waiting", (e) => {
    $(".spinner").show();
  });

  video.addEventListener("canplay", (e) => {
    $(".spinner").hide();
    $(player.video).show();
    $(player.timeRange).attr("max", video.duration);
    $(player.timeRange).css("--thumb-color", "red");

    var promise = video.play();

    if (promise !== undefined) {
      promise
        .then((_) => {
          $(`#playPause img, #center_btn img`).attr("src", "./icons/pause.svg");
        })
        .catch((error) => {
          popupTimedMsg("Auto play is disabled", 3000, 400);
        });
    }

    $("#bufferingIndicator").css(
      "--buffered-percentage",
      ((video.buffered.end(0) / video.duration) * 100).toString() + "%"
    );
    video.addEventListener("progress", () => {
      let bufferedPercentage =
        (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
      $("#bufferingIndicator").css(
        "--buffered-percentage",
        bufferedPercentage.toString() + "%"
      );
    });
  });
}

function popupTimedMsg(msg, duration, animationDuration) {
  $("#popup").html(msg);
  $("#popup").css("display", "block");
  $("#popup").stop(true, false).animate({
    top: 16,
    opacity: 1,
  });
  setTimeout(() => {
    $("#popup")
      .stop(true, false)
      .fadeOut(animationDuration, () => {
        $("#popup").css("top", "-1rem");
        $("#popup").css("opacity", "0");
      });
  }, duration);
}

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

function saveCurrTime() {
  localStorage.setItem(`${player.videoUrl}`, `${$("#time_range").val()}`);
}
