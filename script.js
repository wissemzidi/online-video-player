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
    const centerBtn = $("#center_btn i");
    if (this.video.paused) {
      // playing....
      playPauseIcon.removeClass("fa-play");
      centerBtn.removeClass("fa-play");
      playPauseIcon.addClass("fa-pause");
      centerBtn.addClass("fa-pause");
      this.video.play();
    } else {
      // pausing...
      playPauseIcon.removeClass("fa-pause");
      centerBtn.removeClass("fa-pause");
      playPauseIcon.addClass("fa-play");
      centerBtn.addClass("fa-play");
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
    this.animateActionsBtn(this.video.muted ? "mute" : "volume-high");
    $("#toggleMute i").toggleClass("fa-volume-xmark fa-volume-high");
  }

  volumeUp() {
    if (this.video.volume > 0.9) return;
    this.video.volume += 0.1;
    this.animateActionsBtn("volumeUp");
    $("#volume").css("--volume", this.video.volume * 100 + "%");
    $("#volume").val(this.video.volume * 100);
  }
  volumeDown() {
    if (this.video.volume < 0.1) {
      // !
      console.log(("hello"));
      return
    };
    this.video.volume -= 0.1;
    this.animateActionsBtn("volumeDown");
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

  animateActionsBtn(iconName) {
    $("#actions_viewer img").attr("src", `./icons/${iconName}.svg`);
    $("#actions_viewer").fadeTo(100, 0.5).fadeOut(100);
  }

  hideControls(animationDuration) {
    $("#controls").fadeOut(animationDuration);
    $("#center_btn").fadeOut(animationDuration);
  }
  showControls(animationDuration) {
    $("#controls").fadeIn(animationDuration);
    $("#center_btn").fadeIn(animationDuration);
  }
  toggleControls(animationDuration) {
    $("#controls").fadeToggle(animationDuration);
    $("#center_btn").fadeToggle(animationDuration);
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
    try {
      player = new Player(
        document.getElementById("main_vid"),
        document.getElementById("time_value"),
        document.getElementById("time_range")
      );
      player.changeSrc($("#video_link").val());
      $("#toggle_video_link_form_btn").click();
      player.playPause();
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

  player.video.onclick = () => {
    player.toggleControls(200);
    counter = 0;
  };
  player.video.ondblclick = () => {
    player.playPause();
    counter = 0;
  };

  // $(document).on("click input mousemove mousedown", function (e) {
  //   player.showControls(200);
  //   counter = 0;
  // });
  $("#volume").on("click input mousemove mousedown", function (e) {
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
    // let dblclickTimer = setTimeout();
    $("#videoLeftSide").on("click", function () {
      if (dblclickLeft == null) {
        dblclickLeft = true;
        dblclickTimer = setTimeout(() => {
          dblclickLeft = null;
        }, 300);
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
    $("#videoRightSide").on("click", function () {
      console.log("dblclick right");
      player.forward();
      $(this).css("opacity", 1);
      setTimeout(() => {
        $(this).css("opacity", 0);
      }, 300);
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

    player.video.onclick = () => {
      player.playPause();
      counter = 0;
    };
    player.video.ondblclick = () => {
      player.fullScreen();
    };
  }
});
