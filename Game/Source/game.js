'use strict';

var use_music = true;
var use_sound = true;
var use_scores = false;
var log_performance = true;

// open -a Google\ Chrome\ Canary --args --disable-web-security --autoplay-policy=no-user-gesture-required --user-data-dir=/Users/bugsbycarlin/Projects/Messy
// 

// var first_screen = "1p_base_capture";
// var first_screen = "1p_launch_code";
var first_screen = "zoo";
// var first_screen = "1p_lobby";
// var first_screen = "title";
// var first_screen = "cutscene";

var performance_result = null;

var pixi = null;
var game = null;

function initialize() {
  game = new Game();
}



// var words = [
//   "no",
//    "yes",
//    "dog",
//    "pig",
//    "cat",
//    "run",
//    "green",
//    "black",
//    "pink",
//    "red",
//    "jump",
//    "sleep",
//    "sheep",
//    "three",
//    "wow",
//    "bag",
//    "yuck",
//    "rat",
//    "hat",
//    "bat",
//    "man",
//    "cow",
//    "cup",
//    "bird",
//    "tree",
//    "box",
//    "dad",
//    "mom",
//    "stop",
//    "toy",
//    "bee",
//    "boat",
//    "bus",
//    "candy",
//    "coat",
//    "corn",
//    "deer",
//    "dress",
//    "duck",
//    "egg",
//    "farm",
//    "fox",
//    "feet",
//    "food",
//    "goat",
//    "hand",
//    "leg",
//    "milk",
//    "moon",
//    "park",
//    "plant",
//    "pony",
//    "rabbit",
//    "road",
//    "rock",
//    "car",
//    "truck",
//    "bath",
//    "zoo"
// ]


// var picture_counts = {
//   "no": 6,
//    "yes": 13,
//    "dog": 1,
//    "pig": 1,
//    "cat": 1,
//    "run": 13,
//    "green": 1,
//    "black": 1,
//    "pink": 7,
//    "red": 10,
//    "jump": 1,
//    "sleep": 1,
//    "sheep": 1,
//    "three": 1,
//    "wow": 1,
//    "bag": 1,
//    "yuck": 1,
//    "rat": 1,
//    "hat": 1,
//    "bat": 1,
//    "man": 1,
//    "cow": 1,
//    "cup": 1,
//    "bird": 1,
//    "tree": 1,
//    "box": 1,
//    "dad": 1,
//    "mom": 1,
//    "stop": 1,
//    "toy": 1,
//    "bee": 1,
//    "boat": 11,
//    "bus": 1,
//    "candy": 1,
//    "coat": 1,
//    "corn": 1,
//    "deer": 1,
//    "dress": 1,
//    "duck": 1,
//    "egg": 1,
//    "farm": 1,
//    "fox": 1,
//    "feet": 1,
//    "food": 1,
//    "goat": 1,
//    "hand": 1,
//    "leg": 1,
//    "milk": 1,
//    "moon": 1,
//    "park": 1,
//    "plant": 1,
//    "pony": 1,
//    "rabbit": 1,
//    "road": 1,
//    "rock": 1,
//    "car": 1,
//    "truck": 1,
//    "bath": 1,
//    "zoo": 1,
//  }


class Game {
  constructor() {

    var self = this;

    this.tracking = {};

    this.basicInit();

    document.addEventListener("keydown", function(ev) {self.handleKeyDown(ev)}, false);
    document.addEventListener("keyup", function(ev) {self.handleKeyUp(ev)}, false);
    window.onfocus = function(ev) {
      if (self.keymap != null) {
        self.keymap["ArrowDown"] = null;
        self.keymap["ArrowUp"] = null;
        self.keymap["ArrowLeft"] = null;
        self.keymap["ArrowRight"] = null;
      }
    };
    window.onblur = function(ev) {
      if (self.keymap != null) {
        self.keymap["ArrowDown"] = null;
        self.keymap["ArrowUp"] = null;
        self.keymap["ArrowLeft"] = null;
        self.keymap["ArrowRight"] = null;
      }
    };

    this.freefalling = [];
    this.shakers = [];

    this.gravity = 5.8;

    this.pause_time = 0;

    use_music = true;
    use_sound = true;

    this.initializeScreens();

    PIXI.Loader.shared
      .add("Art/bear.json")
      .add("Art/smoke.json")
      .load(function() {
        WebFont.load({
          google: {
            families: ['Bebas Neue']
          },
          active:e=>{
            self.initializeZoo();
            self.current_screen = "zoo";
          }
        });
    });
  }


  basicInit() {
    var self = this;

    this.width = 1280;
    this.height = 960;

    // Create the pixi application
    pixi = new PIXI.Application(this.width, this.height, {antialias: true});
    this.renderer = pixi.renderer;
    document.getElementById("mainDiv").appendChild(pixi.view);
    pixi.renderer.resize(this.width,this.height);
    pixi.renderer.backgroundColor = 0xEEEEEE;

    // Set up rendering and tweening loop
    let ticker = PIXI.Ticker.shared;
    ticker.autoStart = false;
    ticker.stop();

    let fps_counter = 0;
    let last_frame = 0;
    let last_performance_update = 0;

    function animate(now) {
      
      fps_counter += 1;
      let diff = now - last_frame;
      last_frame = now

      if (!self.paused == true) {
        TWEEN.update(now);
        self.update(diff);
        ticker.update(now);
        pixi.renderer.render(pixi.stage);

        if (now - last_performance_update > 3000 && log_performance) {
          //There were 3000 milliseconds, so divide fps_counter by 3
          //console.log("FPS: " + fps_counter / 3);
          //self.trackPrint(["update", "tween", "animate"]);
          fps_counter = 0;
          last_performance_update = now;
        }
      }

      requestAnimationFrame(animate);
    }
    animate(0);
  }


  initializeScreen(screen_name, reset = false) {
    if (screen_name == "zoo") {
      this.initializeZoo();
    }
  }

  update(diff) {
    if (this.current_screen == "zoo") {
      this.updateZoo(diff);
    }
  }


  soundEffect(effect_name, volume = 0.6) {
    if (use_sound) {
      var sound_effect = document.getElementById(effect_name);
      if (sound_effect != null) {
        sound_effect.volume = volume;
        sound_effect.play();
      }
    }
  }


  setMusic(music_name) {
    if (use_music) {
      if (this.music_name == music_name) {
        return;
      }
      var self = this;
      let crossfade = false;
      if (this.music != null && this.music_name != music_name) {
        crossfade = true;
        this.fadeMusic();
      }
      this.music = document.getElementById(music_name);
      this.music.loop = true;
      this.music.pause();
      this.music.currentTime = 0;
      if (crossfade) {
        for (let i = 0; i < 14; i++) {
          delay(function() {
            self.music.volume = i / 20;
          }, 50 * i);
        }
      } else {
        this.music.volume = 0.4;
      }
      this.music_name = music_name;
      this.music.play();
    }
  }


  stopMusic() {
    if (this.music != null) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }


  fadeMusic(delay_time = 0) {
    if (this.music != null) {
      this.old_music = this.music;
      this.music = null;
      //this.old_music.done = true;
      var self = this;
      for (let i = 0; i < 14; i++) {
        delay(function() {
          self.old_music.volume = (13 - i) / 20;
        }, delay_time + 50 * i);
      }
      setTimeout(function() {
        // TO DO
        // DELETE OLD MUSIC
        this.old_music = null;
      }, 1500);
    }
  }

  markTime() {
    return Date.now() - this.pause_time;
  }


  timeSince(mark) {
    return this.markTime() - mark;
  }
}
