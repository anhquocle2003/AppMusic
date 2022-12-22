// 1 Render songs
// 2. Scroll Top
// 3. Play / Pause / Seek
// 4. CD rotate
// 5. Next / Prev song
// 6. Random song
// 7. Next / Repeat when ended
// 8. Active song
// 9. Scroll active song into view
// 10. Play song when click
const PLAYER_STORAGE_KEY = "AQ - MUSIC";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const player = $(".player");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const songTrack = $('.song-track');
const songCurrent = $('.song-current');
const songDuration = $('.song-duration')

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Head In The Clouds",
      singer: "Hayd",
      path: "./assets/music/Head In the Clouds - Hayd.mp3",
      image: "./assets/images/Head In the Clouds.jpg",
      id: 2,
    },
    {
      name: "Under The Influence",
      singer: "Chris Brown",
      path: "./assets/music/UnderTheInfluence-ChrisBrown.mp3",
      image: "./assets/images/UnderTheInfluence.webp",
      id: 3,
    },

    {
      name: "Beautiful",
      singer: "Bazzi feat. Camila Cabello",
      path: "./assets/music/Beautiful - Bazzi_ Camila Cabello.mp3",
      image: "./assets/images/Bazzi feat. Camila Cabello - Beautiful.jpg",
      id: 5,
    },

    {
      name: "Never Be the Same",
      singer: "Camila Cabello",
      path: "./assets/music/Never Be The Same - Camila Cabello.mp3",
      image: "./assets/images/Camila Cabello - Never Be the Same.jpg",
      id: 14,
    },
    {
      name: "Attention",
      singer: "Charlie Puth",
      path: "./assets/music/Attention - Charlie Puth.mp3",
      image: "./assets/images/Charlie Puth - Attention.jpg",
      id: 15,
    },

    {
      name: "2U",
      singer: "David Guetta ft Justin Bieber",
      path: "./assets/music/2U - David Guetta_ Justin Bieber.mp3",
      image: "./assets/images/David Guetta ft Justin Bieber - 2U.jpg",
      id: 20,
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
            <div class="song ${
              index === this.currentIndex ? "active" : ""
            }" data-index="${index}">
                <div
                    class="thumb"
                    style="
                    background-image: url('${song.image}');
                    "
                ></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperty: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    // Cách cũ
    const _this = this;
    const cdWidth = cd.offsetWidth;
    // Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000, //10 second
        iterations: Infinity, //Lặp vô hạn
      }
    );
    cdThumbAnimate.pause();
    // Xử lí phóng to thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;

      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lí khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi song được player
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        songTrack.style.width = progressPercent+'%';
        progress.value = progressPercent;

        // Get time in song
        songDuration.innerHTML = _this.formatTimer(audio.duration);

        songCurrent.innerHTML = _this.formatTimer(audio.currentTime);

      }
    };

    // Xử lí khi tua song
    progress.onchange = function (event) {
      const seekTime = (audio.duration / 100) * event.target.value;
      audio.currentTime = seekTime;
    };

    // Khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };
    // Khi prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();

      _this.scrollToActiveSong();
    };
    // Xử lí bật / tắt random song
    randomBtn.onclick = function (event) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Repeat Song
    repeatBtn.onclick = function (event) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);

      repeatBtn.classList.toggle("active", _this.isRepeat);
    };
    // Xử lí next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    // Lắng nghe click vào playlist
    playlist.onclick = function (event) {
      const songNode = event.target.closest(".song:not(.active)");
      const optionSong = event.target.closest(".option");
      if (songNode || optionSong) {
        // Xử lí khi click vào song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        // Xử lí khi click vào song option
        if (optionSong) {
        }
      }
    };
  },
  formatTimer: function (number) {
    const minutes = Math.floor(number / 60);
    const seconds = Math.floor(number - minutes * 60);
    return `${
      minutes < 10 ? "0" + minutes : minutes
    }:${seconds < 10 ? "0" + seconds : seconds}`;
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;

    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }

    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }

    this.loadCurrentSong();
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    this.defineProperty();

    // Lắng nghe xử lí các sự kiện
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // Random Song
    this.playRandomSong();

    // FormatTimer
    this.formatTimer();

    // Render playlist
    this.render();

    // Hiển thị trạng thái ban đầu của button repeat và random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};
app.start();
