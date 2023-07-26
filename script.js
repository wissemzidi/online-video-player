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
    $("#main_vid").attr("src", videoUrl);
    this.videoUrl = videoUrl;
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
    const centerBtn = $("#center_btn i");
    if (this.video.paused) {
      // playing....
      playPauseIcon.removeClass("fa-play");
      centerBtn.removeClass("fa-play");
      playPauseIcon.addClass("fa-pause");
      centerBtn.addClass("fa-pause");
      this.animateActionsBtn("pause");
      this.video.play();
    } else {
      // pausing...
      playPauseIcon.removeClass("fa-pause");
      centerBtn.removeClass("fa-pause");
      playPauseIcon.addClass("fa-play");
      centerBtn.addClass("fa-play");
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
      screen.orientation.unlock();
    } else {
      videoContainer.requestFullscreen();
      screen.orientation.lock("landscape");
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

  if (movieUrl) {
    try {
      player = new Player(
        movieUrl,
        document.getElementById("main_vid"),
        document.getElementById("time_value"),
        document.getElementById("time_range")
      );
      player.fullScreen();
      player.playPause();
      $("#video_link_form").hide();
      $("#toggle_video_link_form_btn").hide();
    } catch (error) {
      alert("Error in the provided link");
      throw new Error("Error: " + error);
    }
  }

  $("#video_link_form").on("submit", function (e) {
    e.preventDefault();
    try {
      player = new Player(
        $("#video_link").val(),
        document.getElementById("main_vid"),
        document.getElementById("time_value"),
        document.getElementById("time_range")
      );
      $("#toggle_video_link_form_btn").click();
      player.playPause();
      player.fullScreen();
    } catch (error) {
      throw new Error("Error: " + error);
    }
  });

  $(document).on("keydown", function (e) {
    switch (e.key) {
      case "F11":
        e.preventDefault();
        player.fullScreen();
        break;
      case "f":
        player.fullScreen();
        break;
      case "F":
        player.fullScreen();
        break;
      case "ArrowRight":
        player.forward();
        break;
      case "ArrowLeft":
        player.backward();
        break;
      case "ArrowUp":
        player.volumeUp();
        break;
      case "ArrowDown":
        player.volumeDown();
        break;
      case " ":
        player.playPause();
        break;
      case "m":
        player.toggleMute();
        break;
      case "M":
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

    player.video.onclick = (e) => {
      player.toggleControls(200);
      counter = 0;
    };
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
