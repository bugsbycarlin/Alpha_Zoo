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
      .add("Art/Animals/parrot.json")
      .add("Art/Animals/owl.json")
      .add("Art/Food/fruit.json")
      .add("Art/Food/steak.json")
      .add("Art/Food/greens.json")
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


  //
  // Tracking functions, useful for testing the timing of things.
  //
  trackStart(label) {
    if (!(label in this.tracking)) {
      this.tracking[label] = {
        start: 0,
        total: 0
      }
    }
    this.tracking[label].start = Date.now();
  }


  trackStop(label) {
    if (this.tracking[label].start == -1) {
      console.log("ERROR! Tracking for " + label + " stopped without having started.")
    }
    this.tracking[label].total += Date.now() - this.tracking[label].start;
    this.tracking[label].start = -1
  }


  trackPrint(labels) {
    var sum_of_totals = 0;
    for (var label of labels) {
      sum_of_totals += this.tracking[label].total;
    }
    for (var label of labels) {
      var fraction = this.tracking[label].total / sum_of_totals;
      console.log(label + ": " + Math.round(fraction * 100).toFixed(2) + "%");
    }
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

        // self.trackStart("tween");
        // TWEEN.update(now);
        // self.trackStop("tween");

        // self.trackStart("update");
        // self.update(diff);
        // self.trackStop("update");

        // self.trackStart("animate");
        // ticker.update(now);
        // pixi.renderer.render(pixi.stage);
        // self.trackStop("animate");


        if (now - last_performance_update > 3000 && log_performance) {
          //There were 3000 milliseconds, so divide fps_counter by 3
          // console.log("FPS: " + fps_counter / 3);
          // self.trackPrint(["update", "tween", "animate"]);
          
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
