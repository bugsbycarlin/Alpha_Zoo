
//
// The game class runs the entire game, managing pixi.js setup and basic game setup,
// handling scenes, running the master update and input handlers, and handling
// pause and time.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

'use strict';

var use_scores = false;
var log_performance = true;

// open -a Google\ Chrome\ Canary --args --disable-web-security --autoplay-policy=no-user-gesture-required --user-data-dir=/Users/bugsbycarlin/Projects/Messy
// 

var first_screen = "character_select";

var performance_result = null;

var pixi = null;
var game = null;

var default_font = "Bebas Neue";

let game_fullscreen = false;

let pixi_draw_count = 0;

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

    use_voice = localStorage.getItem("use_voice") == "false" ? false : true;

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
      .add("Art/Characters/brown_bear_shirt.json")

      .add("Art/Characters/brown_bear_sun_glasses.json")
      .add("Art/Characters/brown_bear_glasses.json")

      .add("Art/Characters/brown_bear_scooter.json")

      .add("Art/Characters/brown_bear_safari_hat.json")
      .add("Art/Characters/brown_bear_witch_hat.json")
      .add("Art/Characters/brown_bear_top_hat.json")
      .add("Art/Characters/brown_bear_ball_cap.json")
      .add("Art/Characters/brown_bear_beanie.json")

      .add("Art/Characters/polar_bear_ghost.json")
      .add("Art/Characters/polar_bear.json")

      .add("Art/Characters/black_bear_ghost.json")
      .add("Art/Characters/black_bear.json")
  
      .add("Art/Characters/rabbit_greenshirt_ghost.json")
      .add("Art/Characters/rabbit_greenshirt.json")

      .add("Art/Characters/rabbit_redshirt_ghost.json")
      .add("Art/Characters/rabbit_redshirt.json")

      .add("Art/Characters/rabbit_blueshirt_ghost.json")
      .add("Art/Characters/rabbit_blueshirt.json")

      .add("Art/Characters/orange_cat_ghost.json")
      .add("Art/Characters/orange_cat.json")

      .add("Art/Characters/yellow_cat_ghost.json")
      .add("Art/Characters/yellow_cat.json")

      .add("Art/Characters/light_cat_ghost.json")
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


      // MidJourney generated animations
      .add("Art/Animals/alligator.json")
      .add("Art/Animals/alpaca.json")
      .add("Art/Animals/anteater.json")
      .add("Art/Animals/baboon.json")
      .add("Art/Animals/beaver.json")
      .add("Art/Animals/bighorn_sheep.json")
      .add("Art/Animals/black_bear.json")
      .add("Art/Animals/brown_bear.json")
      .add("Art/Animals/camel.json")
      .add("Art/Animals/capybara.json")
      .add("Art/Animals/cat.json")
      .add("Art/Animals/cheetah.json")
      .add("Art/Animals/chicken_1.json")
      .add("Art/Animals/chicken_2.json")
      .add("Art/Animals/chimpanzee.json")
      .add("Art/Animals/cow.json")
      .add("Art/Animals/deer.json")
      .add("Art/Animals/dog.json")
      .add("Art/Animals/duck.json")
      .add("Art/Animals/elephant.json")
      .add("Art/Animals/elk.json")
      .add("Art/Animals/flamingo.json")
      .add("Art/Animals/fox.json")
      .add("Art/Animals/frog_1.json")
      .add("Art/Animals/frog_2.json")
      .add("Art/Animals/frog_3.json")
      .add("Art/Animals/frog_4.json")
      .add("Art/Animals/frog_5.json")
      .add("Art/Animals/gazelle.json")
      .add("Art/Animals/giraffe.json")
      .add("Art/Animals/goat.json")
      .add("Art/Animals/goose.json")
      .add("Art/Animals/gorilla.json")
      .add("Art/Animals/hippo.json")
      .add("Art/Animals/horse.json")
      .add("Art/Animals/kangaroo.json")
      .add("Art/Animals/koala.json")
      .add("Art/Animals/lemur.json")
      .add("Art/Animals/lion.json")
      .add("Art/Animals/llama.json")
      .add("Art/Animals/lynx.json")
      .add("Art/Animals/meerkat.json")
      .add("Art/Animals/moose.json")
      .add("Art/Animals/mouse.json")
      .add("Art/Animals/orangutan.json")
      .add("Art/Animals/ostrich.json")
      .add("Art/Animals/otter.json")
      .add("Art/Animals/owl.json")
      .add("Art/Animals/panda_bear.json")
      .add("Art/Animals/panther.json")
      .add("Art/Animals/parrot_1.json")
      .add("Art/Animals/parrot_2.json")
      .add("Art/Animals/parrot_3.json")
      .add("Art/Animals/parrot_4.json")
      .add("Art/Animals/parrot_5.json")
      .add("Art/Animals/peacock.json")
      .add("Art/Animals/penguin.json")
      .add("Art/Animals/pig.json")
      .add("Art/Animals/polar_bear.json")
      .add("Art/Animals/rabbit.json")
      .add("Art/Animals/raccoon.json")
      .add("Art/Animals/red_panda.json")
      .add("Art/Animals/rhino.json")
      .add("Art/Animals/seal.json")
      .add("Art/Animals/sheep.json")
      .add("Art/Animals/sloth.json")
      .add("Art/Animals/snake_1.json")
      .add("Art/Animals/snake_2.json")
      .add("Art/Animals/snake_3.json")
      .add("Art/Animals/swan.json")
      .add("Art/Animals/tiger.json")
      .add("Art/Animals/turtle.json")
      .add("Art/Animals/warthog.json")
      .add("Art/Animals/wolf.json")
      .add("Art/Animals/yak.json")
      .add("Art/Animals/zebra.json")


      .add("Art/Food/fruit.json")
      .add("Art/Food/steak.json")
      .add("Art/Food/greens.json")
      .add("Art/Food/fish.json")
      .add("Art/Food/bamboo.json")
      .add("Art/Food/micro.json")

      .add("Art/smoke.json")
      .add("Art/steam.json")
      .add("Art/puff.json")
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

    // // count the number of drawings
    // // https://stackoverflow.com/questions/63294038/pixi-js-how-do-i-get-draw-count
    // const drawElements = this.renderer.gl.drawElements;
    // this.renderer.gl.drawElements = (...args) => {
    //   drawElements.call(self.renderer.gl, ...args);
    //   pixi_draw_count++;
    // }; // rewrite drawElements to count draws

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
          // console.log("Pixi draw count: " + pixi_draw_count);
          // console.log("Ents: " + ent_count);
          fps_counter = 0;
          last_performance_update = now;
        }
      }

      pixi_draw_count = 0;

      requestAnimationFrame(animate);
    }
    animate(0);
  }


  initializeScreen(screen_name, reset = false) {
    console.log(screen_name);
    if (screen_name == "character_select") {
      this.initializeCharacterSelect();
    } else if (screen_name == "zoo") {
      this.initializeZoo();
    } else if (screen_name == "cafe") {
      this.initializeCafe();
    } else if (screen_name == "gift_shop") {
      this.initializeGiftShop();
    } else if (screen_name == "animal_pop") {
      this.initializeAnimalPop();
    }
  }

  update(diff) {
    if (this.current_screen == "character_select") {
      this.updateCharacterSelect(diff);
    } else if (this.current_screen == "zoo") {
      this.updateZoo(diff);
    } else if (this.current_screen == "cafe") {
      this.updateCafe(diff);
    } else if (this.current_screen == "gift_shop") {
      this.updateGiftShop(diff);
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

    if(this.current_screen === "character_select") {
      this.characterSelectKeyDown(ev);
    } else if(this.current_screen === "zoo") {
      this.zooKeyDown(ev);
    } else if (this.current_screen == "cafe") {
      this.cafeKeyDown(ev);
    } else if (this.current_screen == "gift_shop") {
      this.giftShopKeyDown(ev);
    }
  }


  markTime() {
    return Date.now() - this.pause_time;
  }


  timeSince(mark) {
    return this.markTime() - mark;
  }
}
