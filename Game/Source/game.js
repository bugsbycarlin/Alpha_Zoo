
//
// The game class runs the entire game, managing pixi.js setup and basic game setup,
// handling scenes, running the master update and input handlers, and handling
// pause and time.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

'use strict';

var music_volume = 0.4;
var sound_volume = 0.6;
var use_scores = false;
var log_performance = true;

// open -a Google\ Chrome\ Canary --args --disable-web-security --autoplay-policy=no-user-gesture-required --user-data-dir=/Users/bugsbycarlin/Projects/Messy
// 

var first_screen = "zoo";

var performance_result = null;

var pixi = null;
var game = null;

var default_font = "Bebas Neue";

let game_fullscreen = false;

function initialize() {
  game = new Game();
}

class Game {
  constructor() {

    var self = this;

    this.tracking = {};
    this.keymap = {};

    this.basicInit();

    sound_volume = localStorage.getItem("sound_volume");
    if (sound_volume == null) sound_volume = 0.6;
    if (sound_volume == NaN) sound_volume = 0.6;
    if (sound_volume < 0.001) sound_volume = 0.0;
    sound_volume = Math.round(sound_volume * 10) / 10;

    music_volume = localStorage.getItem("music_volume");
    if (music_volume == null) music_volume = 0.4;
    if (music_volume == NaN) music_volume = 0.4;
    if (music_volume < 0.001) music_volume = 0.0;
    music_volume = Math.round(music_volume * 10) / 10;

    game_fullscreen = window.gameIsFullScreen();

    console.log(sound_volume);

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

    this.initializeScreens();

    PIXI.Loader.shared
      .add("Art/Characters/brown_bear.json")
      .add("Art/Characters/brown_bear_ghost.json")
      .add("Art/Characters/polar_bear.json")
      .add("Art/Characters/black_bear.json")
      .add("Art/Characters/rabbit_greenshirt.json")
      .add("Art/Characters/rabbit_redshirt.json")
      .add("Art/Characters/rabbit_blueshirt.json")
      .add("Art/Characters/orange_cat.json")
      .add("Art/Characters/yellow_cat.json")
      .add("Art/Characters/light_cat.json")

      .add("Art/Decorations/trees.json")
      
      .add("Art/Terrain/fence_post.png")
      .add("Art/Terrain/fence_shadow.png")

      .add("Art/Terrain/edging_50_1.png")
      .add("Art/Terrain/edging_100_1.png")
      .add("Art/Terrain/edging_150_1.png")
      .add("Art/Terrain/edging_200_1.png")
      .add("Art/Terrain/edging_250_1.png")
      .add("Art/Terrain/edging_300_1.png")
      .add("Art/Terrain/edging_50_2.png")
      .add("Art/Terrain/edging_100_2.png")
      .add("Art/Terrain/edging_150_2.png")
      .add("Art/Terrain/edging_200_2.png")
      .add("Art/Terrain/edging_250_2.png")
      .add("Art/Terrain/edging_300_2.png")
      .add("Art/Terrain/edging_50_3.png")
      .add("Art/Terrain/edging_100_3.png")
      .add("Art/Terrain/edging_150_3.png")
      .add("Art/Terrain/edging_200_3.png")
      .add("Art/Terrain/edging_250_3.png")
      .add("Art/Terrain/edging_300_3.png")
      
      .add("Art/Terrain/edging_shadow_50_1.png")
      .add("Art/Terrain/edging_shadow_100_1.png")
      .add("Art/Terrain/edging_shadow_150_1.png")
      .add("Art/Terrain/edging_shadow_200_1.png")
      .add("Art/Terrain/edging_shadow_250_1.png")
      .add("Art/Terrain/edging_shadow_300_1.png")
      .add("Art/Terrain/edging_shadow_50_2.png")
      .add("Art/Terrain/edging_shadow_100_2.png")
      .add("Art/Terrain/edging_shadow_150_2.png")
      .add("Art/Terrain/edging_shadow_200_2.png")
      .add("Art/Terrain/edging_shadow_250_2.png")
      .add("Art/Terrain/edging_shadow_300_2.png")
      .add("Art/Terrain/edging_shadow_50_3.png")
      .add("Art/Terrain/edging_shadow_100_3.png")
      .add("Art/Terrain/edging_shadow_150_3.png")
      .add("Art/Terrain/edging_shadow_200_3.png")
      .add("Art/Terrain/edging_shadow_250_3.png")
      .add("Art/Terrain/edging_shadow_300_3.png")

      .add("Art/Terrain/edging_reverse_50_1.png")
      .add("Art/Terrain/edging_reverse_100_1.png")
      .add("Art/Terrain/edging_reverse_150_1.png")
      .add("Art/Terrain/edging_reverse_200_1.png")
      .add("Art/Terrain/edging_reverse_250_1.png")
      .add("Art/Terrain/edging_reverse_300_1.png")
      .add("Art/Terrain/edging_reverse_shadow_50_1.png")
      .add("Art/Terrain/edging_reverse_shadow_100_1.png")
      .add("Art/Terrain/edging_reverse_shadow_150_1.png")
      .add("Art/Terrain/edging_reverse_shadow_200_1.png")
      .add("Art/Terrain/edging_reverse_shadow_250_1.png")
      .add("Art/Terrain/edging_reverse_shadow_300_1.png")

      .add("Art/Terrain/bank_lines_50_3.png")
      .add("Art/Terrain/bank_lines_50_2.png")
      .add("Art/Terrain/bank_lines_50_1.png")
      .add("Art/Terrain/bank_lines_100_3.png")
      .add("Art/Terrain/bank_lines_100_2.png")
      .add("Art/Terrain/bank_lines_100_1.png")
      .add("Art/Terrain/bank_lines_150_2.png")
      .add("Art/Terrain/bank_lines_150_3.png")
      .add("Art/Terrain/bank_lines_150_1.png")

      .add("Art/Terrain/light_grass.png")
      .add("Art/Terrain/light_round.png")

      .add("Art/Animals/parrot.json")
      .add("Art/Animals/owl.json")
      .add("Art/Animals/peacock.json")
      .add("Art/Animals/koala.json")
      .add("Art/Animals/sloth.json")
      .add("Art/Animals/lemur.json")
      .add("Art/Animals/orangutan.json")

      .add("Art/Food/fruit.json")
      .add("Art/Food/steak.json")
      .add("Art/Food/greens.json")
      .add("Art/Food/fish.json")
      .add("Art/Food/bamboo.json")
      .add("Art/Food/micro.json")

      .add("Art/smoke.json")
      .add("Art/pop.json")

      .add("Art/Cafe/Food/pizza.json")
      .add("Art/Cafe/Food/burger.json")
      .add("Art/Cafe/Food/hot_dog.json")
      .add("Art/Cafe/Food/salad.json")
      .add("Art/Cafe/Food/milk.json")
      .add("Art/Cafe/Food/soda.json")
      .add("Art/Cafe/Food/water.json")
      .add("Art/Cafe/Food/juice.json")
      .add("Art/Cafe/Food/apple.json")
      .add("Art/Cafe/Food/kiwi.json")
      .add("Art/Cafe/Food/plum.json")
      .add("Art/Cafe/Food/pear.json")
      .add("Art/Cafe/Food/peach.json")
      .add("Art/Cafe/Food/banana.json")
      .add("Art/Cafe/Food/orange.json")
      .add("Art/Cafe/Food/candy.json")
      .add("Art/Cafe/Food/donut.json")
      .add("Art/Cafe/Food/cookie.json")
      .add("Art/Cafe/Food/ice_cream.json")
      .add("Art/Cafe/Food/celery.json")
      .add("Art/Cafe/Food/carrots.json")
      .add("Art/Cafe/Food/tomatoes.json")
      .add("Art/Cafe/Food/cucumbers.json")
      .load(function() {
        // WebFont.load({
        //   google: {
        //     families: ['Bebas Neue']
        //   },
        //   active:e=>{
        //     // self.initializeZoo();
        //     // self.current_screen = "zoo";
        //     self.initializeScreen(first_screen);
        //     self.current_screen = first_screen;
        //   }
        // });
        self.initializeScreen(first_screen);
        self.current_screen = first_screen;
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

    this.width = 1440;
    this.height = 900;

    // Create the pixi application
    pixi = new PIXI.Application(this.width, this.height, {antialias: true, backgroundColor: 0x000000});
    this.renderer = pixi.renderer;
    document.getElementById("mainDiv").appendChild(pixi.view);
    pixi.renderer.resize(this.width,this.height);

    // pixi.renderer.resize(screen.availWidth, screen.availHeight);

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
          // // There were 3000 milliseconds, so divide fps_counter by 3
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
    console.log(screen_name);
    if (screen_name == "zoo") {
      this.initializeZoo();
    } else if (screen_name == "cafe") {
      this.initializeCafe();
    } else if (screen_name == "animal_pop") {
      this.initializeAnimalPop();
    }
  }

  update(diff) {
    if (this.current_screen == "zoo") {
      this.updateZoo(diff);
    } else if (this.current_screen == "cafe") {
      this.updateCafe(diff);
    } else if (this.current_screen == "animal_pop") {
      this.updateAnimalPop(diff);
    } 
  }



  handleKeyUp(ev) {
    ev.preventDefault();

    this.keymap[ev.key] = null;
  }


  handleKeyDown(ev) {
    if (ev.key === "Tab") {
      ev.preventDefault();
    }

    this.keymap[ev.key] = true;

    if(this.current_screen === "zoo") {
      this.zooKeyDown(ev);
    } else if (this.current_screen == "cafe") {
      this.cafeKeyDown(ev);
    }
  }


  soundEffect(effect_name) {
    if (sound_volume > 0) {
      var sound_effect = document.getElementById(effect_name);
      if (sound_effect != null) {
        sound_effect.volume = sound_volume;
        sound_effect.play();
      }
    }
  }


  setMusic(music_name) {
    if (music_volume > 0) {
      if (this.music_name == music_name) {
        return;
      }
      var self = this;
      // let crossfade = false;
      // if (this.music != null && this.music_name != music_name) {
      //   crossfade = true;
      //   this.fadeMusic();
      // }
      this.music = document.getElementById(music_name);
      this.music.loop = true;
      this.music.pause();
      this.music.currentTime = 0;
      // if (crossfade) {
      //   for (let i = 0; i < 14; i++) {
      //     delay(function() {
      //       self.music.volume = i / 20;
      //     }, 50 * i);
      //   }
      // } else {
      //   this.music.volume = 0.4;
      // }
      this.music.volume = music_volume;
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
