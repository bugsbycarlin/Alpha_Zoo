
//
// screen_zoo.js contains basically the entire core game scene.
// This is where we create the zoo and also where we manage everything
// about the core zoo game: walking around, building enclosures,
// interacting with existing enclosures, and updating all the living things.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.initializeZoo = function() {
  var self = this;
  var screen = this.screens["zoo"];
  this.clearScreen(screen);
  console.log("initializing " + screen.name)

  this.shakers = [];
  this.drops = [];
  this.foods = [];

  this.terrain = [];
  this.decorations = [];
  this.animals = [];

  makeSections();

  this.dropshadow_filter = new PIXI.filters.DropShadowFilter();
  this.dropshadow_filter.blur  = 2;
  this.dropshadow_filter.quality = 3;
  this.dropshadow_filter.alpha = 0.55;
  this.dropshadow_filter.distance = 8;
  this.dropshadow_filter.rotation = 45;

  this.resetZooScreen();

  this.map.scale.set(1,1);
}

let background_color = 0x318115;
let path_color = 0xf9e6bb;
let grass_color = 0xb1d571;
let forest_color = 0x518f40;
let ice_color = 0xFAFAFF;
let sand_color = 0xf3cca0;
let water_color = 0x42b2d2;
let sign_color = 0xc09f57;
let pen_color = 0x754c25;
let pen_shadow_color = 0x4d321a;

let steak_color = 0x954a4a;
let greens_color = 0x3c713a;
let fruit_color = 0x70527d;

let greyscale_pen_color = 0x8a8a8a;
let greyscale_pen_shadow_color = 0x5b5b5b;

let poop_color = 0x644b38;

let square_width = 900;
let total_ents = 150;

let menu_selection_color = 0x9869d2;

let npc_list = [
  "black_bear", "polar_bear",
  "rabbit_greenshirt", "rabbit_redshirt", "rabbit_blueshirt",
  "yellow_cat", "orange_cat", "light_cat"
];

Game.prototype.resetZooScreen = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.zoo_mode = "loading"; // loading, active, ferris_wheel, fading, menu

  // Make the map
  this.initializeMap();
  this.makeMapGroups();
  this.makeMapPath();
  this.makeMapPens();

  // Make the title image
  this.title_image = new PIXI.Sprite(PIXI.Texture.from("Art/alpha_zoo_title.png"));
  this.title_image.anchor.set(0.5,0);
  this.title_image.position.set(this.width / 2, -20);
  screen.addChild(this.title_image);

  this.title_instructions = new PIXI.Sprite(PIXI.Texture.from("Art/title_instructions.png"));
  this.title_instructions.anchor.set(0.5,1);
  this.title_instructions.position.set(this.width / 2, this.height);
  screen.addChild(this.title_instructions);
  this.title_instructions.alpha = 0.01;
  this.title_instructions.visible = false;

  // this.makeLoadingScreen();
  this.black.alpha = 1;
  this.black.visible = true;
  pixi.stage.addChild(this.black);

  // Make the ui layer
  this.makeUI();
  this.makeMenu();

  // Populate the map with things
  this.designatePens();
  this.swapPens();
  this.drawMap();
  this.playerAndBoundaries();
  this.populateZoo();
  
  this.sortLayer(this.map.decoration_layer, this.decorations);
  // this.greyAllActivePens();

  this.start_time = this.markTime();
  this.first_move = false;

  this.setMusic("background_music");

  delay(function() {
    self.zoo_mode = "active";
    // self.loading_text.visible = false;
    self.fadeFromBlack(3000);
  }, 500);
  
}


Game.prototype.initializeMap = function() {
  var self = this;
  var screen = this.screens["zoo"];

  // The zoo is an NxN grid of square pens. Small is 5, leading to at most 25 pens.
  // Large is 8, leading to at most 64 pens.
  // Note some squares may be snipped, meaning less pens.
  this.zoo_size = parseInt(localStorage.getItem("zoo_size")) || 6;
  if (this.zoo_size == null) this.zoo_size = 6;
  console.log("Zoo size is " + this.zoo_size);

  this.map = new PIXI.Container();
  this.map.position.set(640,480)
  screen.addChild(this.map);

  this.map.background_layer = new PIXI.Container();
  this.map.addChild(this.map.background_layer);

  this.map.build_effect_layer = new PIXI.Container();
  this.map.addChild(this.map.build_effect_layer);

  this.map.terrain_layer = new PIXI.Container();
  this.map.addChild(this.map.terrain_layer);

  this.map.decoration_layer = new PIXI.Container();
  this.map.addChild(this.map.decoration_layer);

  this.decorations = [];

  // Vertices (crossroads in the path)
  this.zoo_vertices = {};
  for (let i = 0; i <= this.zoo_size; i++) {
    this.zoo_vertices[i] = {};
    for (let j = 0; j <= this.zoo_size; j++) {
      this.zoo_vertices[i][j] = {
        use: false,
        n_path: false,
        s_path: false,
        w_path: false,
        e_path: false,
        vertex: [square_width * i, square_width * j],
        halo: {
          nw: [square_width * i - 180 - 60 * Math.random(), square_width * j - 180 - 60 * Math.random()],
          ne: [square_width * i + 180 + 60 * Math.random(), square_width * j - 180 - 60 * Math.random()],
          sw: [square_width * i - 180 - 60 * Math.random(), square_width * j + 180 + 60 * Math.random()],
          se: [square_width * i + 180 + 60 * Math.random(), square_width * j + 180 + 60 * Math.random()],
          n: [square_width * i - 30 + 60 * Math.random(), square_width * j - 180 - 60 * Math.random()],
          s: [square_width * i - 30 + 60 * Math.random(), square_width * j + 180 + 60 * Math.random()],
          e: [square_width * i + 180 + 60 * Math.random(), square_width * j - 30 + 60 * Math.random()],
          w: [square_width * i - 180 - 60 * Math.random(), square_width * j - 30 + 60 * Math.random()],
        }
      };
    }
  }

  // The square faces between vertices.
  // The (0,0) vertex lies above and to the left of the (0,0) square.
  // The (1,1) vertex lies below and to the right of the (1,1) square.
  // Obviously coords are x,y.
  this.zoo_squares = {};
  for (let i = 0; i < this.zoo_size; i++) {
    this.zoo_squares[i] = {};
    for (let j = 0; j < this.zoo_size; j++) {
      this.zoo_squares[i][j] = {
        group: -1,
        new_group: null,
        section: null,
        reachable: false,
        outer: (i == 0 || i == this.zoo_size - 1 || j == 0 || j == this.zoo_size - 1),
        n_edge: false,
        s_edge: false,
        w_edge: false,
        e_edge: false,
        pen: null,
      };
    }
  }

  this.zoo_pens = [];
}


Game.prototype.makeUI = function() {
  var self = this;
  var screen = this.screens["zoo"];
  
  this.ui_layer = new PIXI.Container();
  screen.addChild(this.ui_layer);

  this.typing_ui = new PIXI.Container();
  this.ui_layer.addChild(this.typing_ui);

  this.grey_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 140, fill: 0xDDDDDD, letterSpacing: 8, align: "left"});
  this.grey_text.anchor.set(0,0.5);
  this.grey_text.position.set(25, 93);
  this.typing_ui.addChild(this.grey_text);

  this.typing_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 140, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  this.typing_text.tint = 0x000000;
  this.typing_text.anchor.set(0,0.5);
  this.typing_text.position.set(25, 93);
  this.typing_ui.addChild(this.typing_text);

  this.typing_backing = null;

  this.typing_ui.visible = false;
  this.typing_allowed = false;
  this.display_typing_allowed = false;

  this.display_ui = new PIXI.Container();
  this.ui_layer.addChild(this.display_ui);

  this.display_action_backing = new PIXI.Sprite(PIXI.Texture.from("Art/wood.png"));
  this.display_action_backing.anchor.set(0, 1);
  this.display_action_backing.scale.set(0.5, 1);
  this.display_action_backing.position.set(-180, 960 - 16);
  this.display_action_backing.filters = [this.dropshadow_filter];
  this.display_ui.addChild(this.display_action_backing);

  this.action_glyphs = {};
 
  this.action_glyphs["FEED"] = new PIXI.Sprite(PIXI.Texture.from("Art/Food/food.png"));
  this.action_glyphs["FEED"].anchor.set(0.5,0.75);
  this.action_glyphs["FEED"].position.set(70, 815);
  this.action_glyphs["FEED"].scale.set(0.75, 0.75);
  this.action_glyphs["FEED"].visible = false;
  this.display_ui.addChild(this.action_glyphs["FEED"]);

  this.action_glyphs["POOP"] = new PIXI.Sprite(PIXI.Texture.from("Art/poop.png"));
  this.action_glyphs["POOP"].anchor.set(0.5,0.75);
  this.action_glyphs["POOP"].position.set(70, 905);
  this.action_glyphs["POOP"].scale.set(0.75, 0.75)
  this.action_glyphs["POOP"].visible = false;
  this.display_ui.addChild(this.action_glyphs["POOP"]);

  this.action_glyphs["RIDE"] = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/cart_icon.png"));
  this.action_glyphs["RIDE"].anchor.set(0.5,0.75);
  this.action_glyphs["RIDE"].position.set(70, 910);
  this.action_glyphs["RIDE"].scale.set(0.75, 0.75);
  this.action_glyphs["RIDE"].visible = false;
  this.display_ui.addChild(this.action_glyphs["RIDE"]);
  this.action_glyphs["RIDE"].visible = false;

  this.action_glyphs["MAP"] = new PIXI.Sprite(PIXI.Texture.from("Art/map_icon.png"));
  this.action_glyphs["MAP"].anchor.set(0.5,0.75);
  this.action_glyphs["MAP"].position.set(70, 910);
  this.action_glyphs["MAP"].scale.set(0.75, 0.75);
  this.action_glyphs["MAP"].visible = false;
  this.display_ui.addChild(this.action_glyphs["MAP"]);
  this.action_glyphs["MAP"].visible = false;

  this.action_glyphs["COLOR"] = new PIXI.Sprite(PIXI.Texture.from("Art/color_icon.png"));
  this.action_glyphs["COLOR"].anchor.set(0.5,0.75);
  this.action_glyphs["COLOR"].position.set(70, 910);
  this.action_glyphs["COLOR"].scale.set(0.75, 0.75);
  this.action_glyphs["COLOR"].visible = false;
  this.display_ui.addChild(this.action_glyphs["COLOR"]);
  this.action_glyphs["COLOR"].visible = false;

  // action glyph positions: 905 - 90 per item


  this.action_grey_text = [];
  this.action_typing_text = [];

  for (let i = 0; i < 4; i++) {
    let grey_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xDDDDDD, letterSpacing: 8, align: "left"});
    grey_text.anchor.set(0,1);
    grey_text.position.set(130, 945 - 90 * i);
    this.display_ui.addChild(grey_text);
    this.action_grey_text.push(grey_text);

    let typing_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
    typing_text.tint = 0x000000;
    typing_text.anchor.set(0,1);
    typing_text.position.set(130, 945 - 90 * i);
    this.display_ui.addChild(typing_text);
    this.action_typing_text.push(typing_text);
  }

  this.display_backing = new PIXI.Sprite(PIXI.Texture.from("Art/wood.png"));
  this.display_backing.anchor.set(0, 1);
  this.display_backing.scale.set(0.8, 0.8);
  this.display_backing.position.set(1280 - 400, 960 - 30);
  this.display_backing.filters = [this.dropshadow_filter];
  this.display_ui.addChild(this.display_backing);

  this.display_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 140, fill: 0xFFFFFF, letterSpacing: 8, align: "right"});
  this.display_text.tint = 0x000000;
  this.display_text.anchor.set(1,0.5);
  this.display_text.position.set(1280 - 25, 960 - 90);
  this.display_ui.addChild(this.display_text);

  this.display_ui.visible = false;

  this.map_border = new PIXI.Sprite(PIXI.Texture.from("Art/map_border.png"));
  this.map_border.anchor.set(0,0);
  this.map_border.position.set(0,0);
  this.map_border.visible = false;
  this.map_visible = false;
  screen.addChild(this.map_border);

  this.animal_count_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/brown_bear.png"));
  this.animal_count_glyph.anchor.set(1,0.5);
  this.animal_count_glyph.position.set(this.width + 40, 33);
  this.animal_count_glyph.scale.set(0.4, 0.4)
  this.animal_count_glyph.tint = 0x000000;
  this.animal_count_glyph.alpha = 0.0;
  this.animal_count_glyph.visible = false;
  screen.addChild(this.animal_count_glyph);

  this.animal_count_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 60, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.animal_count_text.anchor.set(1,0.5);
  this.animal_count_text.position.set(this.width - 110, 65);
  this.animal_count_text.alpha = 0.0;
  this.animal_count_text.visible = false;
  screen.addChild(this.animal_count_text);

  this.escape_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/close_button.png"));
  this.escape_glyph.anchor.set(1,1);
  this.escape_glyph.position.set(this.width - 20, this.height - 20);
  this.escape_glyph.scale.set(0.6, 0.6)
  this.escape_glyph.tint = 0x000000;
  this.escape_glyph.alpha = 0.6;
  this.escape_glyph.visible = false;
  screen.addChild(this.escape_glyph);

  this.escape_text = new PIXI.Text("Enter | Escape | Space", {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.escape_text.anchor.set(1,1);
  this.escape_text.position.set(this.width - 100, this.height - 32);
  this.escape_text.alpha = 0.6;
  this.escape_text.visible = false;
  screen.addChild(this.escape_text);
}



Game.prototype.makeMenu = function() {
  var self = this;
  var screen = this.screens["zoo"];
  
  this.menu_layer = new PIXI.Container();
  screen.addChild(this.menu_layer);
  this.menu_layer.visible = false;

  this.menu_selections = [];
  this.sound_slider_left = 815;
  this.music_slider_left = 450;
  this.menu_selection_number = 0;

  this.main_menu_background = new PIXI.Sprite(PIXI.Texture.from("Art/main_menu_background.png"));
  this.main_menu_background.anchor.set(0,0);
  this.main_menu_background.position.set(0, 0);
  this.menu_layer.addChild(this.main_menu_background);

  this.menu_selections[0] = new PIXI.Text("MUSIC", {fontFamily: "Bebas Neue", fontSize: 56, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.menu_selections[0].tint = 0x000000;
  this.menu_selections[0].anchor.set(0,0);
  this.menu_selections[0].position.set(295, 90);
  this.menu_layer.addChild(this.menu_selections[0]);

  this.music_slider = new PIXI.Sprite(PIXI.Texture.from("Art/slider.png"));
  this.music_slider.anchor.set(0,0.5);
  this.music_slider.position.set(this.music_slider_left,113);
  this.menu_layer.addChild(this.music_slider);

  this.music_slider_bar = new PIXI.Sprite(PIXI.Texture.from("Art/slider_bar.png"));
  this.music_slider_bar.anchor.set(0,0.5);
  this.music_slider_bar.position.set(this.music_slider_left + 150 * music_volume,113);
  this.menu_layer.addChild(this.music_slider_bar);
  
  this.menu_selections[1] = new PIXI.Text("SOUND", {fontFamily: "Bebas Neue", fontSize: 56, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.menu_selections[1].tint = 0x000000;
  this.menu_selections[1].anchor.set(0,0);
  this.menu_selections[1].position.set(654, 199);
  this.menu_layer.addChild(this.menu_selections[1]);

  this.sound_slider_left = 815;

  this.sound_slider = new PIXI.Sprite(PIXI.Texture.from("Art/slider.png"));
  this.sound_slider.anchor.set(0,0.5);
  this.sound_slider.position.set(this.sound_slider_left,222);
  this.menu_layer.addChild(this.sound_slider);

  this.sound_slider_bar = new PIXI.Sprite(PIXI.Texture.from("Art/slider_bar.png"));
  this.sound_slider_bar.anchor.set(0,0.5);
  this.sound_slider_bar.position.set(this.sound_slider_left + 150 * sound_volume, 222);
  this.menu_layer.addChild(this.sound_slider_bar);

  this.menu_selections[2] = new PIXI.Text("NEW SMALL ZOO", {fontFamily: "Bebas Neue", fontSize: 56, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.menu_selections[2].tint = 0x000000;
  this.menu_selections[2].anchor.set(0,0);
  this.menu_selections[2].position.set(278, 345);
  this.menu_layer.addChild(this.menu_selections[2]);

  this.menu_selections[3] = new PIXI.Text("NEW LARGE ZOO", {fontFamily: "Bebas Neue", fontSize: 56, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.menu_selections[3].tint = 0x000000;
  this.menu_selections[3].anchor.set(0,0);
  this.menu_selections[3].position.set(603, 488);
  this.menu_layer.addChild(this.menu_selections[3]);

  this.menu_selections[4] = new PIXI.Text("WINDOWED", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.menu_selections[4].tint = 0x000000;
  this.menu_selections[4].anchor.set(0,0);
  this.menu_selections[4].position.set(243, 658);
  this.menu_layer.addChild(this.menu_selections[4]);

  let wfs_bar = new PIXI.Text("|", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  wfs_bar.tint = 0x000000;
  wfs_bar.anchor.set(0,0);
  wfs_bar.position.set(403, 658);
  this.menu_layer.addChild(wfs_bar);

  this.wfs_alt = new PIXI.Text("FULL SCREEN", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.wfs_alt.tint = 0x000000;
  this.wfs_alt.anchor.set(0,0);
  this.wfs_alt.position.set(435, 658);
  this.menu_layer.addChild(this.wfs_alt);

  this.changeMenuSelection(0);


  // 295,90
  // 654,199
  // 272,349
  // 601,495
  // 237,658 + 410 + 435

  this.menu_escape_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/close_button.png"));
  this.menu_escape_glyph.anchor.set(1,1);
  this.menu_escape_glyph.position.set(this.width - 15, this.height - 20);
  this.menu_escape_glyph.scale.set(0.6, 0.6)
  this.menu_escape_glyph.tint = 0x000000;
  this.menu_escape_glyph.alpha = 0.6;
  this.menu_layer.addChild(this.menu_escape_glyph);

  this.menu_escape_text = new PIXI.Text("Escape", {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.menu_escape_text.anchor.set(1,1);
  this.menu_escape_text.position.set(this.width - 90, this.height - 32);
  this.menu_escape_text.alpha = 0.6;
  this.menu_layer.addChild(this.menu_escape_text);
}


Game.prototype.changeMenuSelection = function(delta) {
  this.menu_selection_number = (this.menu_selection_number + delta + this.menu_selections.length) % this.menu_selections.length;
  this.wfs_alt.tint = 0x000000;
  for (let i = 0; i < this.menu_selections.length; i++) {
    this.menu_selections[i].tint = 0x000000;
    if (i == this.menu_selection_number) this.menu_selections[i].tint = menu_selection_color;
  }
  if (this.menu_selection_number == 4 && game_fullscreen == true) {
    this.menu_selections[4].tint = 0x000000;
    this.wfs_alt.tint = menu_selection_color;
  }
}


Game.prototype.makeMapGroups = function() {
  var self = this;
  var screen = this.screens["zoo"];

  // Mark groups using a random search
  let group_num = 1;
  let group_count = 0;
  let max_group_count = Math.floor(2 + Math.random() * 5);
  this.group_colors = {};
  this.group_counts = {};

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].group == -1) {
        let new_group_count = this.markGroup(i, j, group_num, group_count, max_group_count);
        this.group_colors[group_num] = PIXI.utils.rgb2hex([Math.random(), Math.random(), Math.random()]);
        this.group_counts[group_num] = new_group_count;
        group_num += 1;
        group_count = 0;
        max_group_count = Math.floor(2 + Math.random() * 5);
      }
    }
  }

  console.log(group_num);

  // Attach singletons to larger groups
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let cell = this.zoo_squares[i][j];
      if (this.group_counts[cell.group] == 1) {
        console.log("Singleton at " + i + " " + j);
        let neighbors = [];
        if (i > 0) neighbors.push(this.zoo_squares[i-1][j].group);
        if (i < this.zoo_size - 1) neighbors.push(this.zoo_squares[i+1][j].group);
        if (j > 0) neighbors.push(this.zoo_squares[i][j-1].group);
        if (j < this.zoo_size - 1) neighbors.push(this.zoo_squares[i][j+1].group);
        shuffleArray(neighbors);
        cell.new_group = neighbors[0];
      }
    }
  }
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let cell = this.zoo_squares[i][j];
      if (this.group_counts[cell.group] == 1) {
        cell.group = cell.new_group;
        cell.new_group = null;
      }
    }
  }

}


Game.prototype.markGroup = function(i, j, group_num, group_count, max_group_count) {
  if (group_count >= max_group_count) return group_count;

  this.zoo_squares[i][j].group = group_num;
  group_count += 1;

  let neighbors = [];
  if (i > 0 && this.zoo_squares[i-1][j].group == -1) {
    neighbors.push([i-1,j]);
  }
  if (i < this.zoo_size - 1 && this.zoo_squares[i+1][j].group == -1) {
    neighbors.push([i+1,j]);
  }
  if (j > 0 && this.zoo_squares[i][j-1].group == -1) {
    neighbors.push([i,j-1]);
  }
  if (j < this.zoo_size - 1 && this.zoo_squares[i][j+1].group == -1) {
    neighbors.push([i,j+1]);
  }
  
  if (neighbors.length > 0) {
    shuffleArray(neighbors);
    group_count = this.markGroup(neighbors[0][0], neighbors[0][1], group_num, group_count, max_group_count);
  }

  return group_count;
}


Game.prototype.makeMapPath = function() {
  var self = this;
  var screen = this.screens["zoo"];

  for (let i = 1; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].group != this.zoo_squares[i-1][j].group) {
          
        this.zoo_squares[i][j].w_edge = true;
        this.zoo_squares[i-1][j].e_edge = true;

        this.zoo_squares[i][j].reachable = true;
        this.zoo_squares[i-1][j].reachable = true;

        this.zoo_vertices[i][j].s_path = true;
        this.zoo_vertices[i][j+1].n_path = true;
      }
    }
  }

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 1; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].group != this.zoo_squares[i][j-1].group) {
        this.zoo_squares[i][j].n_edge = true;
        this.zoo_squares[i][j-1].s_edge = true;

        this.zoo_squares[i][j].reachable = true;
        this.zoo_squares[i][j-1].reachable = true;

        this.zoo_vertices[i][j].e_path = true;
        this.zoo_vertices[i+1][j].w_path = true;
      }
    }
  }
}


Game.prototype.isFerrisTile = function(i,j) {
  if (this.special_ferris_tile == null) return false;

  if (i == this.special_ferris_tile[0] && j == this.special_ferris_tile[1]) return true;

  return false;
}


Game.prototype.isCafeTile = function(i,j) {
  if (this.special_cafe_tile == null) return false;

  if (i == this.special_cafe_tile[0] && j == this.special_cafe_tile[1]) return true;

  return false;
}


Game.prototype.makeMapPens = function() {

  // first, choose a special ferris wheel tile pair. hold these out from this process.
  this.special_ferris_tile = null;
  if (this.zoo_size >= 6) {
    let potential_ferris_tiles = [];
    for (let i = 1; i < this.zoo_size - 2; i++) {
      for (let j = 2; j < this.zoo_size - 2; j++) {
        if (this.zoo_squares[i][j].reachable) {
          // console.log(i + "," + j);
          // console.log(this.zoo_squares[i][j].e_edge);
          if (this.zoo_squares[i][j].e_edge == false && this.zoo_squares[i+1][j].w_edge == false) { // both should always be true or false anyway
            potential_ferris_tiles.push([i,j]);
          }
        }
      }
    }

    if (potential_ferris_tiles.length > 0) {
      shuffleArray(potential_ferris_tiles);
      this.special_ferris_tile = potential_ferris_tiles[0];
    }
  }


  // next, choose a special cafe tile, and hold that out too.
  this.special_cafe_tile = null;
  if (this.zoo_size >= 6) {
    let potential_cafe_tiles = [];
    for (let i = 1; i < this.zoo_size - 1; i++) {
      for (let j = 1; j < this.zoo_size - 1; j++) {
        if (this.zoo_squares[i][j].reachable && !this.isFerrisTile(i,j) && !this.isFerrisTile(i-1,j)
          && this.zoo_squares[i][j].s_edge == true) { // put the cafe somewhere where there's a road below it.
          potential_cafe_tiles.push([i,j]);
        }
      }
    }

    if (potential_cafe_tiles.length > 0) {
      shuffleArray(potential_cafe_tiles);
      this.special_cafe_tile = potential_cafe_tiles[0];
    } else {
      console.log("ALERT: NO SPACE TO PUT THE CAFE!");
    }
  }

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {

      if (this.zoo_squares[i][j].reachable && !this.isCafeTile(i,j)
        && !this.isFerrisTile(i,j) && !this.isFerrisTile(i-1,j)) {

        let polygon = [];

        let no_north_neighbor = (j <= 0 || this.zoo_squares[i][j-1].group != this.zoo_squares[i][j].group || !this.zoo_squares[i][j-1].reachable);
        let no_south_neighbor = (j >= this.zoo_size - 1 || this.zoo_squares[i][j+1].group != this.zoo_squares[i][j].group || !this.zoo_squares[i][j+1].reachable);
        let no_west_neighbor = (i <= 0 || this.zoo_squares[i-1][j].group != this.zoo_squares[i][j].group || !this.zoo_squares[i-1][j].reachable);
        let no_east_neighbor = (i >= this.zoo_size - 1 || this.zoo_squares[i+1][j].group != this.zoo_squares[i][j].group || !this.zoo_squares[i+1][j].reachable);

        // northwest corner
        let nw_vertex = this.zoo_vertices[i][j];
        if (nw_vertex.s_path || nw_vertex.n_path || nw_vertex.e_path || nw_vertex.w_path) {
          // pre corner
          if (nw_vertex.s_path == false) {
            polygon.push(nw_vertex.halo.s);
            if (no_north_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          }
          
          // corner
          polygon.push(nw_vertex.halo.se);
          if (no_north_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          
          // post corner
          if (nw_vertex.e_path == false) {
            polygon.push(nw_vertex.halo.e);
            if (no_north_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          }
        } else {
          polygon.push(nw_vertex.vertex);
          if (no_north_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
        }

        // halfsies for the hybrid lands
        polygon.push([square_width * i + square_width / 2 - 50 * Math.random(), polygon[polygon.length - 1][1]]);

        // northeast corner
        let ne_vertex = this.zoo_vertices[i+1][j];
        if (ne_vertex.s_path || ne_vertex.n_path || ne_vertex.e_path || ne_vertex.w_path) {
          // pre corner
          if (ne_vertex.w_path == false) {
            polygon.push(ne_vertex.halo.w);
            if (no_north_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
          }
          
          // corner
          polygon.push(ne_vertex.halo.sw)
          if (no_north_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");

          // post corner
          if (ne_vertex.s_path == false) {
            polygon.push(ne_vertex.halo.s);
            if (no_north_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
          }
        } else {
          polygon.push(ne_vertex.vertex);
          if (no_north_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
        }

        // southeast corner
        let se_vertex = this.zoo_vertices[i+1][j+1];
        if (se_vertex.s_path || se_vertex.n_path || se_vertex.e_path || se_vertex.w_path) {
          // pre corner
          if (se_vertex.n_path == false) {
            polygon.push(se_vertex.halo.n);
            if (no_south_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
          }
          
          // corner
          polygon.push(se_vertex.halo.nw);
          if (no_south_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
          
          // post corner
          if (se_vertex.w_path == false) {
            polygon.push(se_vertex.halo.w);
            if (no_south_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
          }
        } else {
          polygon.push(se_vertex.vertex);
          if (no_south_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
        }

        // halfsies for the hybrid lands
        polygon.push([square_width * i + square_width / 2 - 50 * Math.random(), polygon[polygon.length - 1][1]]);
        
        // southwest corner
        let sw_vertex = this.zoo_vertices[i][j+1];
        if (sw_vertex.s_path || sw_vertex.n_path || sw_vertex.e_path || sw_vertex.w_path) {
          // pre corner
          if (sw_vertex.e_path == false) {
            polygon.push(sw_vertex.halo.e);
            if (no_south_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          }
          
          // corner
          polygon.push(sw_vertex.halo.ne);
          if (no_south_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          
          // post corner
          if (sw_vertex.n_path == false) {
            polygon.push(sw_vertex.halo.n);
            if (no_south_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          }
        } else {
          polygon.push(sw_vertex.vertex);
          if (no_south_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
        }

        let s_count = 0;
        for (let m = 0; m < polygon.length; m++) {
          let point = polygon[m];
          if (polygon[m].length > 2 && polygon[m][2] == "s") {
            s_count += 1;
          }
        }

        // Now do smoothing on any corner with an "s" in it.
        polygon = smoothPolygon(polygon, 0.7, function(x) {return (x.length > 2 && x[2] == "s")});

        // Now remove points that are too close to each other and add points
        // when they're too far
        for(let c = 0; c < 2; c++) {
          polygon = evenPolygon(polygon, 60, 180);
        }

        // Now check the north neighbor and find and copy the common boundary.
        // Note: if you end up doing the western border, do it a little differently
        // BECAUSE THE WESTERN BORDER STARTS WITH A POINT OF CONTACT.
        let northern_border = [];
        if (j > 0 && this.zoo_squares[i][j].n_edge == false
          && this.zoo_squares[i][j - 1].pen != null
          && this.zoo_squares[i][j - 1].pen.special == null) {
          console.log("I'm " + i + "," + j + " and I have a northern neighbor.");
          let points_of_contact = [];

          let neighbor_polygon = this.zoo_squares[i][j - 1].pen.polygon;

          for (let m = 0; m < polygon.length; m++) {
            let point = polygon[m];
            for (let n = 0; n < neighbor_polygon.length; n++) {
              let neighbor_point = neighbor_polygon[n];
              if (distance(point[0], point[1], neighbor_point[0], neighbor_point[1]) < 1) {
                points_of_contact.push([point, m, n]);
              }
            }
          }

          console.log(points_of_contact.length);

          if (points_of_contact.length >= 2) {
            let replaced_polygon = [];
            let m1 = points_of_contact[0][1];
            let m2 = points_of_contact[1][1];
            let n1 = points_of_contact[0][2];
            let n2 = points_of_contact[1][2];
            for (let p = 0; p < m1; p++) {
              replaced_polygon.push(polygon[p]);
            }
            for (let p = n1; p > n2; p--) {
              replaced_polygon.push(neighbor_polygon[p]);
              northern_border.push(neighbor_polygon[p]);
            }
            northern_border.push(polygon[m2]);
            for (let p = m2; p < polygon.length; p++) {
              replaced_polygon.push(polygon[p]);
            }

            polygon = replaced_polygon;
          }
        }

        this.zoo_pens.push({
          use: false,
          outer: false,
          polygon: polygon,
          polygon_flat: polygon.flat(),
          inner_polygon: [],
          cx: square_width * i + square_width / 2,
          cy: square_width * j + square_width / 2,
          animal: null,
          special: null,
          land: "grass",
          northern_border: northern_border,
          //western_border: western_border,
          decorations: ["grass", "tree", "bush", "rock"],
          decoration_objects: [],
          land_object: null,
          special_object: null,
          animal_objects: null,
          state: "ungrey",
          square_numbers: [i,j],
          location: this.zoo_squares[i][j],
        });
        this.zoo_squares[i][j].pen = this.zoo_pens[this.zoo_pens.length - 1];
      } else if (this.zoo_squares[i][j].reachable && this.isFerrisTile(i,j)) {
        let polygon = [];
        let center_x = square_width * (i + 1);
        let center_y = square_width * j + square_width / 2;
        // polygon.push(this.zoo_vertices[i][j].halo.se);
        // polygon.push(this.zoo_vertices[i+1][j].halo.s);
        // polygon.push(this.zoo_vertices[i+2][j].halo.sw);
        // polygon.push(this.zoo_vertices[i+2][j+1].halo.nw);
        // polygon.push(this.zoo_vertices[i+1][j+1].halo.n);
        // polygon.push(this.zoo_vertices[i][j+1].halo.ne);
        // polygon.push(this.zoo_vertices[i][j].halo.se);
        polygon.push([center_x + 600, center_y + 160]);
        polygon.push([center_x - 600, center_y + 160]);
        polygon.push([center_x - 540, center_y + 160 - 60]);
        polygon.push([center_x - 480, center_y + 160 - 120]);
        polygon.push([center_x + 480, center_y + 160 - 120]);
        polygon.push([center_x + 540, center_y + 160 - 60]);
        polygon.push([center_x + 600, center_y + 160]);

        this.zoo_pens.push({
          use: false,
          outer: false,
          polygon: polygon,
          polygon_flat: polygon.flat(),
          cx: center_x,
          cy: center_y,
          animal: null,
          special: "FERRIS_WHEEL",
          land: "grass",
          decorations: null,
          decoration_objects: [],
          land_object: null,
          animal_objects: null,
          state: "ungrey",
          inner_polygon: null,
          square_numbers: [i,j],
          location: this.zoo_squares[i][j],
        });
        this.zoo_squares[i][j].pen = this.zoo_pens[this.zoo_pens.length - 1];
      } else if (this.zoo_squares[i][j].reachable && this.isCafeTile(i,j)) {
        let polygon = [];
        let center_x = square_width * i + square_width / 2;
        let center_y = square_width * (j + 1) - 186; // 100 pixels of path, 86 pixels of space until the cafe door.
        polygon.push([center_x + 300, center_y + 50]); // the bottom is 50 pixels from the door
        polygon.push([center_x + 80, center_y + 50]); // the next four vertices define an indentation for the door
        polygon.push([center_x + 80, center_y - 55]);
        polygon.push([center_x - 80, center_y - 55]);
        polygon.push([center_x - 80, center_y + 50]);
        polygon.push([center_x - 300, center_y + 50]); // now we're back to the proper exterior
        polygon.push([center_x - 300, center_y - 630]); // the top is 630 from the door, with a bit allowed for the player to walk partially out of view behind the building.
        polygon.push([center_x + 300, center_y - 630]);
        polygon.push([center_x + 300, center_y + 50]);

        let grey_polygon = []; // we also define a simpler polygon for when the object is grey.
        grey_polygon.push([center_x + 300, center_y + 50]);
        grey_polygon.push([center_x - 300, center_y + 50]);
        grey_polygon.push([center_x - 300, center_y - 630]);
        grey_polygon.push([center_x + 300, center_y - 630]);
        grey_polygon.push([center_x + 300, center_y + 50]);

        this.zoo_pens.push({
          use: false,
          outer: false,
          polygon: grey_polygon,
          ungrey_polygon: polygon,
          grey_polygon: grey_polygon,
          polygon_flat: polygon.flat(),
          cx: center_x,
          cy: center_y,
          animal: null,
          special: "CAFE",
          land: "grass",
          decorations: null,
          decoration_objects: [],
          land_object: null,
          animal_objects: null,
          state: "ungrey",
          inner_polygon: null,
          square_numbers: [i,j],
          location: this.zoo_squares[i][j],
        });
        this.zoo_squares[i][j].pen = this.zoo_pens[this.zoo_pens.length - 1];
      }
    }
  }

  console.log(this.zoo_pens);
  shuffleArray(this.zoo_pens);
}


Game.prototype.designatePens = function() {
  console.log("There are " + this.zoo_pens.length + " pens.");

  // There are currently three zoo sections.
  // Choose a random angle, and divide the cells into three sections
  // as though they are slices of a pie centered on the center of the zoo.
  // Then assign animals by section.
  let section_dividing_angle = 360 * Math.random();
  console.log("Dividing angle: " + section_dividing_angle);

  let center_x = square_width * this.zoo_size / 2;
  let center_y = square_width * this.zoo_size / 2;

  shuffleArray(section);

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let x = square_width * (i + 0.5);
      let y = square_width * (j + 0.5);
      let relative_angle = (Math.atan2(y - center_y, x - center_x) * 180 / Math.PI - section_dividing_angle + 720) % 360;

      if (relative_angle >= 0 && relative_angle < 120) {
        this.zoo_squares[i][j].section = section[0]
      } else if (relative_angle >= 120 && relative_angle < 240) {
        this.zoo_squares[i][j].section = section[1]
      } else if (relative_angle >= 240 && relative_angle < 360) {
        this.zoo_squares[i][j].section = section[2]
      } 
      
      let group = this.zoo_squares[i][j].group;
    }
  }

  for(let k = 0; k < section.length; k++) {
    shuffleArray(section[k]);
  }
  
  for (let i = 0; i < this.zoo_pens.length; i++) {
    let pen = this.zoo_pens[i];
    if (pen.special == null) {
      let s = pen.location.section;

      if (s != null && s.length > 0) {
        new_animal = s.pop();
        // new_animal = "ORANGUTAN";
        // new_animal = "PENGUIN";
        // new_animal = "SWAN";
        pen.animal = new_animal;
        pen.land = animals[new_animal].land;
        pen.decorations = animals[new_animal].decorations;

        // if (pen.land == "water") {
        //   pen.inner_polygon = shrinkPolygon(pen.polygon, pen.cx, pen.cy, 0.92);
        // }
      }
    }
  }
}


// Spend a few iterations swapping zoo pens to try to increase the number of neighbors with the same terrain.
Game.prototype.swapPens = function() {
  this.countLikeNeighbors();

  let swaps_considered = 0;
  let swaps_performed = 0;
  for (let k = 0; k < 500; k++) {
    let i1 = Math.floor(Math.random() * this.zoo_size);
    let j1 = Math.floor(Math.random() * this.zoo_size);
    let i2 = Math.floor(Math.random() * this.zoo_size);
    let j2 = Math.floor(Math.random() * this.zoo_size);

    if (i1 != i2 || j1 != j2) {
      if (this.zoo_squares[i1][j1].pen != null &&
        this.zoo_squares[i1][j1].pen.special == null
        && this.zoo_squares[i1][j1].pen.animal != null
        && this.zoo_squares[i2][j2].pen != null &&
        this.zoo_squares[i2][j2].pen.special == null
        && this.zoo_squares[i2][j2].pen.animal != null
        && this.zoo_squares[i1][j1].pen.location.section == this.zoo_squares[i2][j2].pen.location.section) {
        swaps_considered +=1;

        let land1 = this.zoo_squares[i1][j1].pen.land;
        let land2 = this.zoo_squares[i2][j2].pen.land;

        let stack_1 = 0;
        if (this.neighborLand(i1,j1,"n") == land1) stack_1 += 1;
        if (this.neighborLand(i1,j1,"s") == land1) stack_1 += 1;
        if (this.neighborLand(i1,j1,"e") == land1) stack_1 += 1;
        if (this.neighborLand(i1,j1,"w") == land1) stack_1 += 1;
        if (this.neighborLand(i2,j2,"n") == land2) stack_1 += 1;
        if (this.neighborLand(i2,j2,"s") == land2) stack_1 += 1;
        if (this.neighborLand(i2,j2,"e") == land2) stack_1 += 1;
        if (this.neighborLand(i2,j2,"w") == land2) stack_1 += 1;

        let stack_2 = 0;
        if (this.neighborLand(i1,j1,"n") == land2) stack_2 += 1;
        if (this.neighborLand(i1,j1,"s") == land2) stack_2 += 1;
        if (this.neighborLand(i1,j1,"e") == land2) stack_2 += 1;
        if (this.neighborLand(i1,j1,"w") == land2) stack_2 += 1;
        if (this.neighborLand(i2,j2,"n") == land1) stack_2 += 1;
        if (this.neighborLand(i2,j2,"s") == land1) stack_2 += 1;
        if (this.neighborLand(i2,j2,"e") == land1) stack_2 += 1;
        if (this.neighborLand(i2,j2,"w") == land1) stack_2 += 1;

        if (stack_2 > stack_1) {

          console.log("Swapping " + this.zoo_squares[i1][j1].pen.animal + " and " + this.zoo_squares[i2][j2].pen.animal)

          let temp_1 = this.zoo_squares[i1][j1].pen.animal;
          this.zoo_squares[i1][j1].pen.animal = this.zoo_squares[i2][j2].pen.animal;
          this.zoo_squares[i2][j2].pen.animal = temp_1;

          let temp_2 = this.zoo_squares[i1][j1].pen.land;
          this.zoo_squares[i1][j1].pen.land = this.zoo_squares[i2][j2].pen.land;
          this.zoo_squares[i2][j2].pen.land = temp_2;

          let temp_3 = this.zoo_squares[i1][j1].pen.decorations;
          this.zoo_squares[i1][j1].pen.decorations = this.zoo_squares[i2][j2].pen.decorations;
          this.zoo_squares[i2][j2].pen.decorations = temp_3;

          // let temp_4 = this.zoo_squares[i1][j1].pen.inner_polygon;
          // this.zoo_squares[i1][j1].pen.inner_polygon = this.zoo_squares[i2][j2].pen.inner_polygon;
          // this.zoo_squares[i2][j2].pen.inner_polygon = temp_4;

          swaps_performed += 1;
        }
      }
    }
  }
  console.log("Swaps considered: " + swaps_considered);
  console.log("Swaps performed: " + swaps_performed);

  this.countLikeNeighbors();
}


// count how many shared lands there are.
// for now, this does not count half lands (eg water neighboring watergrass)
Game.prototype.countLikeNeighbors = function() {
  let neighbor_count = 0;
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].pen != null
          && this.zoo_squares[i][j].pen.special == null) {

        let land = this.zoo_squares[i][j].pen.land;

        // north
        if (this.neighborLand(i,j,"n") == land) neighbor_count += 1;

        // south
        if (this.neighborLand(i,j,"s") == land) neighbor_count += 1;

        // east
        if (this.neighborLand(i,j,"e") == land) neighbor_count += 1;

        // west
        if (this.neighborLand(i,j,"w") == land) neighbor_count += 1;
      }
    }
  }

  console.log("There are " + neighbor_count + " neighboring land borders.");
}


Game.prototype.neighborLand = function(i, j, direction) {
  if (direction == "n") {
    // north
    if (i > 0 && this.zoo_squares[i-1][j].pen != null
      && this.zoo_squares[i-1][j].pen.special == null) {
      return this.zoo_squares[i-1][j].pen.land;
    }
  } else if (direction == "s") {
    // south
    if (i < this.zoo_size - 1 && this.zoo_squares[i+1][j].pen != null
      && this.zoo_squares[i+1][j].pen.special == null) {
      return this.zoo_squares[i+1][j].pen.land;
    }
  } else if (direction == "w") {
    // west
    if (j > 0 && this.zoo_squares[i][j-1].pen != null
      && this.zoo_squares[i][j-1].pen.special == null) {
      return this.zoo_squares[i][j-1].pen.land;
    }
  } else if (direction == "e") {
    // east
    if (j < this.zoo_size - 1 && this.zoo_squares[i][j+1].pen != null
      && this.zoo_squares[i][j+1].pen.special == null) {
      return this.zoo_squares[i][j+1].pen.land;
    }
  }

  return null;
}


Game.prototype.debugDrawMapGroups = function() {
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let group = this.zoo_squares[i][j].group;
      let color = this.group_colors[group];
      let cell = new PIXI.Graphics();
      cell.beginFill(color);
      let polygon = [
        square_width * i, square_width * j,
        square_width * i, square_width * (j+1),
        square_width * (i+1), square_width * (j+1),
        square_width * (i+1), square_width * j,
        square_width * i, square_width * j,
      ]
      cell.drawPolygon(polygon);
      cell.endFill();
      if (!this.zoo_squares[i][j].reachable) cell.alpha = 0.5;
      this.map.background_layer.addChild(cell);
    }
  }
}


Game.prototype.drawMap = function() {
  var self = this;
  var screen = this.screens["zoo"];

  // Map background
  let background = new PIXI.Sprite(PIXI.Texture.from("Art/zoo_gradient.png"));
  background.width = square_width * (this.zoo_size + 4);
  background.height = square_width * (this.zoo_size + 4);
  background.anchor.set(0, 0);
  background.position.set(-2 * square_width, -2 * square_width);
  this.map.background_layer.addChild(background);

  this.drawMapPath();

  for (let i = 0; i < this.zoo_pens.length; i++) {

    let pen = this.zoo_pens[i];

    pen.land_object = new PIXI.Container();
    pen.land_object.cx = pen.cx;
    pen.land_object.cy = pen.cy;

    let corner_x = pen.cx - square_width / 2;
    let corner_y = pen.cy - square_width / 2;

    let grid_i = pen.square_numbers[0];
    let grid_j = pen.square_numbers[1];

    if (pen.special == null) {
      if (pen.land == "magma") {
        var render_container = new PIXI.Container();

        let terrain_grid = [];
        for (let x = 0; x < square_width/100; x++) {
          terrain_grid[x] = [];
          for (let y = 0; y < square_width/100; y++) {
            terrain_grid[x][y] = 0;
          }
        }

        for (let x = 0; x < square_width/100; x++) {
          for (let y = 0; y < square_width/100; y++) {
            let points_inside = 0;
            for (r = 0; r < 30; r++) {
              let test_point = [corner_x + 100 * x + 100 * Math.random(), corner_y + 100 * y + 100 * Math.random()];
              if (pointInsidePolygon(test_point, pen.polygon)) {
                points_inside += 1;
              }
            }
            if (points_inside >= 18) terrain_grid[x][y] = 1;
          }
        }

        let grid_size = square_width/100;
        let tg = terrain_grid;
        for (let x = 0; x < grid_size; x++) {
          for (let y = 0; y < grid_size; y++) {
            let square = null;
            if (terrain_grid[x][y] == 1) {
              // center tile
              if (checkNeighbor(tg, x, y, "w", 1)
                && checkNeighbor(tg, x, y, "e", 1)
                && checkNeighbor(tg, x, y, "n", 1)
                && checkNeighbor(tg, x, y, "s", 1)) {
                square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
              } 
              // north facing tile
              else if (checkNeighbor(tg, x, y, "w", 1)
                && checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "n", 1)) {
                if (grid_j > 0 && this.zoo_squares[grid_i][grid_j-1].pen != null &&
                  this.zoo_squares[grid_i][grid_j-1].pen.land == pen.land) {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
                } else {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_n_v1.png"));
                }
              }
              // south facing tile
              else if (checkNeighbor(tg, x, y, "w", 1)
                && checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "s", 1)) {
                if (grid_j < this.zoo_size - 1 && this.zoo_squares[grid_i][grid_j+1].pen != null &&
                  this.zoo_squares[grid_i][grid_j+1].pen.land == pen.land) {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
                } else {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_s_v1.png"));
                }
              }
              // west facing tile
              else if (checkNeighbor(tg, x, y, "n", 1)
                && checkNeighbor(tg, x, y, "s", 1)
                && !checkNeighbor(tg, x, y, "w", 1)) {
                if (grid_i > 0 && this.zoo_squares[grid_i-1][grid_j].pen != null &&
                  this.zoo_squares[grid_i-1][grid_j].pen.land == pen.land) {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
                } else {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_w_v1.png"));
                }
              }
              // east facing tile
              else if (checkNeighbor(tg, x, y, "n", 1)
                && checkNeighbor(tg, x, y, "s", 1)
                && !checkNeighbor(tg, x, y, "e", 1)) {
                if (grid_i < this.zoo_size - 1 && this.zoo_squares[grid_i+1][grid_j].pen != null &&
                  this.zoo_squares[grid_i+1][grid_j].pen.land == pen.land) {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
                } else {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_e_v1.png"));
                }
                
              }
              // northwest facing tile
              else if (!checkNeighbor(tg, x, y, "w", 1)
                && checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "n", 1)) {
                square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_nw_v1.png"));
              }
              // northeast facing tile
              else if (checkNeighbor(tg, x, y, "w", 1)
                && !checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "n", 1)) {
                square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_ne_v1.png"));
              }
              // southwest facing tile
              else if (!checkNeighbor(tg, x, y, "w", 1)
                && checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "s", 1)) {
                square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_sw_v1.png"));
              }
              // southeast facing tile
              else if (checkNeighbor(tg, x, y, "w", 1)
                && !checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "s", 1)) {
                square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_se_v1.png"));
              }


              if (square != null) {
                square.position.set(100 * x, 100 * y);
                render_container.addChild(square);
              }
              // let square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
              // square.position.set(100 * x, 100 * y);
              // square.scale.set(0.98, 0.98);
              // square.alpha = 0.4;
              // render_container.addChild(square);
            }
          }
        }

        // let nw = [200, 200, "nw"];
        // let ne = [600, 200, "ne"];
        // let sw = [200, 600, "sw"];
        // let se = [600, 600, "se"];

        // if (pen.location.e_edge == false) {
        //   ne = [800, 200, "n"];
        //   se = [800, 600, "s"];


        // }

        // if (pen.location.w_edge == false) {
        //   nw = [0, 200, "n"];
        //   sw = [0, 600, "s"];
        // }

        // if (pen.location.n_edge == false) {
        //   nw = [200, 0, "w"];
        //   ne = [600, 0, "e"];
        // }

        // if (pen.location.s_edge == false) {
        //   sw = [200, 800, "w"];
        //   se = [600, 800, "e"];
        // }

        // let top_left = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_" + nw[2] + "_v1.png"));
        // top_left.position.set(nw[0], nw[1]);
        // render_container.addChild(top_left);
        // let top_right = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_" + ne[2] + "_v1.png"));
        // top_right.position.set(ne[0], ne[1]);
        // render_container.addChild(top_right);
        // let bottom_left = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_" + sw[2] + "_v1.png"));
        // bottom_left.position.set(sw[0], sw[1]);
        // render_container.addChild(bottom_left);
        // let bottom_right = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_" + se[2] + "_v1.png"));
        // bottom_right.position.set(se[0], se[1]);
        // render_container.addChild(bottom_right);

        var terrain_texture = this.renderer.generateTexture(render_container,
        PIXI.SCALE_MODES.LINEAR,
        1,
        new PIXI.Rectangle(0, 0, 1024, 1024));

        var terrain_sprite = new PIXI.Sprite(terrain_texture);
        terrain_sprite.anchor.set(0, 0);
        terrain_sprite.position.set(corner_x, corner_y);
       
        if (pen.land == "grass") {
          terrain_sprite.true_color = grass_color;
        } else if (pen.land == "forest") {
          terrain_sprite.true_color = forest_color;
        }

        terrain_sprite.grey_color = 0xFFFFFF;
        terrain_sprite.tint = terrain_sprite.true_color;
        pen.land_object.addChild(terrain_sprite);

      } else {

        ///////
        /////// Old style
        ///////

        let polygon = pen.polygon;
        if (pen.land == "water") {
          pen.inner_polygon = shrinkPolygon(pen.polygon, pen.cx, pen.cy, 0.92);

          polygon = pen.inner_polygon;
          //console.log(polygon);
        }

        let flat_polygon = polygon.flat();

        let ground = new PIXI.Graphics();
        ground.beginFill(0xFFFFFF);
        ground.drawPolygon(flat_polygon);
        ground.endFill();

        ground.grey_color = 0xFFFFFF;

        if (pen.land == null || pen.land == "grass") {
          ground.true_color = grass_color;
        } else if (pen.land == "water") {
          ground.true_color = water_color;
        } else if (pen.land == "sand") {
          ground.true_color = sand_color;
        } else if (pen.land == "forest") {
          ground.true_color = forest_color;
        } else if (pen.land == "watergrass") {
          ground.true_color = water_color;
        } else if (pen.land == "waterice") {
          ground.true_color = water_color;
        }

        ground.tint = ground.true_color;
        pen.land_object.addChild(ground);

        if (pen.land == "watergrass" || pen.land == "waterice") {
          let super_ground = new PIXI.Graphics();
          super_ground.beginFill(0xFFFFFF);

          let polygon_left = [];
          for (let k = 0; k < pen.polygon.length; k++) {
            if (pen.polygon[k][0] <= pen.cx) {
              polygon_left.push(pen.polygon[k][0])
              polygon_left.push(pen.polygon[k][1]);
            }
          }
          polygon_left.push(polygon_left[0])
          polygon_left.push(polygon_left[1]);
          super_ground.drawPolygon(polygon_left);
          super_ground.endFill();

          super_ground.grey_color = 0xFEFEFE;
          if (pen.land == "watergrass") {
            super_ground.true_color = grass_color;
          } else if (pen.land == "waterice") {
            super_ground.true_color = ice_color;
          }

          super_ground.tint = super_ground.true_color;
          pen.land_object.addChild(super_ground);
        }
        ///////
        ///////
        ///////

        if (pen.land == "forest" || pen.land == "grass" || pen.land == "sand" || pen.land == "water") {

          var render_container = new PIXI.Container();

          for (let k = 0; k < polygon.length; k++) {
            let p1 = polygon[k];
            let p2 = polygon[0];
            if (k < polygon.length - 1) p2 = polygon[k+1];

            let d = distance(p1[0], p1[1], p2[0], p2[1]);
            let fixed_d = null;
            for (let l = 50; l <= 300; l += 50) {
              if (fixed_d == null || Math.abs(l - d) < Math.abs(fixed_d - d)) {
                fixed_d = l;
              }
            }

            let rescale = d / fixed_d;
            // if (rescale < 0.5 && rescale >= 0.2) {
            //   console.log("Value");
            //   console.log(rescale);
            //   console.log(d);
            //   console.log(fixed_d);
            // }
            let angle = 180/Math.PI * Math.atan2(p1[1] - p2[1], p1[0] - p2[0]);
            if (rescale > 0.5 && rescale < 2 && (Math.abs(angle) < 80 || Math.abs(angle) > 100 || pen.land == "water")) {
              let root_name = "Art/Terrain/edging_";
              let dice = 3;
              if (angle <= 90 && angle >= -90) root_name = "Art/Terrain/edging_shadow_";
              if (pen.land == "sand" || pen.land == "water") {
                root_name = "Art/Terrain/edging_reverse_shadow_"
                if (angle <= 90 && angle >= -90) root_name = "Art/Terrain/edging_reverse_";
                dice = 1;
              }
              let edging = new PIXI.Sprite(PIXI.Texture.from(root_name + fixed_d + "_" + Math.ceil(Math.random() * dice) + ".png"));
              let x = (p1[0] + p2[0])/2;
              let y = (p1[1] + p2[1])/2;
              edging.position.set(x - corner_x, y - corner_y);
              edging.anchor.set(0.5, 0.5);
              edging.angle = angle;
              edging.scale.set(rescale, 1);
              //if (edging.angle > 90 || edging.angle < -90) edging.tint = 0x000000; // no shadow for these
              render_container.addChild(edging);

              let fence_shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/fence_shadow.png"));
              fence_shadow.anchor.set(0.5, 0.5);
              fence_shadow.angle = edging.angle;
              fence_shadow.position.set(edging.position.x, edging.position.y);
              fence_shadow.scale.set(d / 300, 1);
              render_container.addChild(fence_shadow);
            }
          }


          var terrain_texture = this.renderer.generateTexture(render_container,
            PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(-50, -50, 1024, 1024));

          var terrain_sprite = new PIXI.Sprite(terrain_texture);
          terrain_sprite.anchor.set(0, 0);
          terrain_sprite.position.set(corner_x - 50, corner_y - 50);
         
          if (pen.land == "grass") {
            terrain_sprite.true_color = grass_color;
          } else if (pen.land == "forest") {
            terrain_sprite.true_color = forest_color;
          } else if (pen.land == "sand") {
            terrain_sprite.true_color = sand_color;
          } else if (pen.land == "water") {
            terrain_sprite.true_color = water_color;
          }

          terrain_sprite.grey_color = 0xFFFFFF;
          terrain_sprite.tint = terrain_sprite.true_color;
          pen.land_object.addChild(terrain_sprite);
        }

      }

      

      // Make the border fence, split into top and bottom sections,
      // and add these to the list of decorations (the thing that gets
      // sorted and drawn in order so things appear at the right depth).
      // The fence consists of posts whose bottoms appear to be on the polygon points,
      // and rails which are just quads drawn from post to post.
      // We find them all, then sort them by depth, then draw them in order,
      // then store the result to a texture object. All the values are shifted
      // to fit in the texture, then the texture is shifted back to the proper location.
      let border_polygon = pen.polygon;
      let top_objects = [];
      let bottom_objects = [];
      let top_x = pen.cx - square_width / 2;
      let top_y = pen.cy - square_width / 2;
      let bottom_x = pen.cx - square_width / 2;
      let bottom_y = pen.cy;
      let highest_top_point = null;
      let lowest_bottom_point = null;

      // compute highest and lowest points
      for (let p = 0; p < border_polygon.length; p++) {
        let border_point = [border_polygon[p][0], border_polygon[p][1]];
        if (highest_top_point == null || border_point[1] - top_y < highest_top_point) highest_top_point = border_point[1] - top_y;
        if (lowest_bottom_point == null || border_point[1] - top_y > lowest_bottom_point) lowest_bottom_point = border_point[1] - top_y;
      }

      // iterate the polygon
      for (let p = 0; p < border_polygon.length; p++) {
        let border_point = [border_polygon[p][0], border_polygon[p][1]];

        let post = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/fence_post.png"));
        post.anchor.set(0.5, 0.78);
        
        // add a fence post to either top or bottom
        if (border_point[1] - top_y < lowest_bottom_point - 70) {
          top_objects.push(post);
          post.position.set(border_point[0] - top_x, border_point[1] - top_y);
        } else {
          bottom_objects.push(post);
          post.position.set(border_point[0] - bottom_x, border_point[1] - bottom_y);
        }
        

        // Draw the rails
        let fence = new PIXI.Graphics();
        let next_point = border_polygon[0];
        if (p < border_polygon.length - 1) {
          next_point = [border_polygon[p + 1][0],border_polygon[p + 1][1]];
        }
        
        // figure out if we're drawing from post A to post B or post B to post A,
        if (next_point[1] < border_point[1]) {
          // then draw a line
          fence.lineStyle(12, 0x462D16, 1);
          fence.moveTo(-3, -23).lineTo(
            next_point[0] - border_point[0], next_point[1] - border_point[1] - 23 - 3);
          fence.lineStyle(8, pen_color, 1);
          fence.moveTo(0, -30).lineTo(
            next_point[0] - border_point[0], next_point[1] - border_point[1] - 30);
          // and add it to either top or bottom
          if (border_point[1] - top_y < lowest_bottom_point - 70) {
            fence.position.set(border_point[0] - top_x, border_point[1] - 6 - top_y);
            top_objects.push(fence);
          } else {
            fence.position.set(border_point[0] - bottom_x, border_point[1] - 6 - bottom_y)
            bottom_objects.push(fence);
          }
        } else {
          fence.lineStyle(12, 0x462D16, 1);
          fence.moveTo(-3, -23).lineTo(
            border_point[0] - next_point[0], border_point[1] - next_point[1] - 23 - 3);
          fence.lineStyle(8, pen_color, 1);
          fence.moveTo(0, -30).lineTo(
            border_point[0] - next_point[0], border_point[1] - next_point[1] - 30);
          if (next_point[1] - top_y < lowest_bottom_point - 70) {
            fence.position.set(next_point[0] - top_x, next_point[1] - 6 - top_y);
            top_objects.push(fence);
          } else {
            fence.position.set(next_point[0] - bottom_x, next_point[1] - 6 - bottom_y);
            bottom_objects.push(fence);
          }
        }
      }

      // sort the top and bottom fences by y depth
      top_objects.sort(function comp(a, b) {
        return (a.y > b.y) ? 1 : -1;
      });
      bottom_objects.sort(function comp(a, b) {
        return (a.y > b.y) ? 1 : -1;
      });

      // make containers
      var top_fence_render_container = new PIXI.Container();
      var bottom_fence_render_container = new PIXI.Container();

      // add everything to the containers
      for (let p = 0; p < top_objects.length; p++) {
        top_fence_render_container.addChild(top_objects[p]);
      }

      for (let p = 0; p < bottom_objects.length; p++) {
        bottom_fence_render_container.addChild(bottom_objects[p]);
      }
      
      // render the stuff in the top container to a texture, and use that
      // texture to make the top fence sprite, and add that to this.decorations.
      var top_texture = this.renderer.generateTexture(top_fence_render_container,
        PIXI.SCALE_MODES.LINEAR,
        1,
        new PIXI.Rectangle(-50, -100, 1024, 1024));

      var top_fence_sprite = new PIXI.Sprite(top_texture);
      top_fence_sprite.anchor.set(0, 0);
      top_fence_sprite.position.set(-50, -100 - highest_top_point);
      top_fence = new PIXI.Container();
      top_fence.type = "fence";
      top_fence.addChild(top_fence_sprite);
      top_fence.position.set(top_x, top_y + highest_top_point);
      top_fence.true_color = 0xFFFFFF;
      top_fence.grey_color = 0xFFFFFF;
      // pen.land_object.addChild(top_fence_sprite);
      this.decorations.push(top_fence);

      // render the stuff in the bottom container to a texture, and use that
      // texture to make the bottom fence sprite, and add that to this.decorations.
      var bottom_texture = this.renderer.generateTexture(bottom_fence_render_container,
        PIXI.SCALE_MODES.LINEAR,
        1,
        new PIXI.Rectangle(-50, -200, 1024, 1024));

      var bottom_fence_sprite = new PIXI.Sprite(bottom_texture);
      bottom_fence_sprite.anchor.set(0, 0);
      // bottom_fence_sprite.tint = 0x000000;
      bottom_fence_sprite.position.set(-50, -200 - lowest_bottom_point + square_width/2);
      bottom_fence = new PIXI.Container();
      bottom_fence.type = "fence";
      bottom_fence.addChild(bottom_fence_sprite);
      bottom_fence.position.set(bottom_x, bottom_y + lowest_bottom_point - square_width/2);
      bottom_fence.true_color = 0xFFFFFF;
      bottom_fence.grey_color = 0xFFFFFF;
      // pen.land_object.addChild(bottom_fence_sprite);
      this.decorations.push(bottom_fence);

    }

    this.terrain.push(pen.land_object)
  }

  this.sortLayer(this.map.terrain_layer, this.terrain, true);
}


Game.prototype.drawMapPath = function() {
  var self = this;
  var screen = this.screens["zoo"];

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let cell = this.zoo_squares[i][j];
      if (cell.e_edge == true) {
        // draw the eastern edge section
        let section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_straight_vertical_v4.png"));
        section.anchor.set(0.5, 0.5);
        section.position.set(square_width * i + square_width, square_width * j + square_width / 2);
        // section.angle = 90;
        this.map.background_layer.addChild(section);
      }

      if (cell.s_edge == true) {
        // draw the southern edge section
        // let shadow = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_straight_horizontal_v3.png"));
        // shadow.anchor.set(0.5, 0.5);
        // shadow.position.set(square_width * i + square_width / 2, square_width * j + square_width);
        // shadow.angle = 0;
        // this.map.background_layer.addChild(shadow);

        let section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_straight_horizontal_v4.png"));
        section.anchor.set(0.5, 0.5);
        section.position.set(square_width * i + square_width / 2, square_width * j + square_width);
        section.angle = 0;
        this.map.background_layer.addChild(section);
      }
    }
  }


  for (let i = 0; i <= this.zoo_size; i++) {
    for (let j = 0; j <= this.zoo_size; j++) {
      let vertex = this.zoo_vertices[i][j];

      let intersection = null;
      if (vertex.s_path && vertex.e_path && vertex.n_path && vertex.w_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_cross_v4.png"));
      }
      else if (vertex.s_path && vertex.e_path && !vertex.n_path && !vertex.w_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_south_to_east_v4.png"));
      }
      else if (vertex.s_path && vertex.w_path && !vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_south_to_west_v4.png"));
        // intersection.scale.set(-1,1);
      }
      else if (!vertex.s_path && !vertex.e_path && vertex.n_path && vertex.w_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_north_to_west_v4.png"));
        // intersection.angle = 180;
      }
      else if (!vertex.s_path && !vertex.w_path && vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_north_to_east_v4.png"));
        // intersection.scale.set(-1,1);
        // intersection.angle = 180;
      }
      else if (vertex.s_path && vertex.w_path && !vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_flat_t_down_v4.png"));
        // intersection.angle = 0;
      }
      else if (!vertex.s_path && vertex.w_path && vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_flat_t_up_v4.png"));
        // intersection.angle = 180;
      }
      else if (vertex.s_path && !vertex.w_path && vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_curve_east_v4.png"));
        intersection.angle = 0;
      }
      else if (vertex.s_path && vertex.w_path && vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_curve_west_v4.png"));
        // intersection.angle = 180;
      }
      else if (!vertex.s_path && vertex.w_path && !vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_span_horizontal_v4.png"));
      }
      else if (vertex.s_path && !vertex.w_path && vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_span_vertical_v4.png"));
        // intersection.angle = 90;
      }
      else if (!vertex.s_path && !vertex.w_path && !vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_west_v4.png"));
        // intersection.angle = 180;
      }
      else if (!vertex.s_path && vertex.w_path && !vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_east_v4.png"));
        // intersection.angle = 0;
      }
      else if (!vertex.s_path && !vertex.w_path && vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_south_v4.png"));
        // intersection.angle = 90;
      }
      else if (vertex.s_path && !vertex.w_path && !vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_north_v4.png"));
        // intersection.angle = 270;
      }

      if (intersection) {
        intersection.anchor.set(0.5, 0.5);
        intersection.position.set(square_width * i, square_width * j);
        this.map.background_layer.addChild(intersection);
      }

      
    }
  }
}


Game.prototype.playerAndBoundaries = function() {
  
  this.upper_bound = 0;
  this.lower_bound = 0;
  this.left_bound = 0;
  this.right_bound = 0;


  this.upper_bound = -0.5 * square_width;
  this.lower_bound = square_width * (this.zoo_size + 0.5);
  this.left_bound = -0.5 * square_width;
  this.right_bound = square_width * (this.zoo_size + 0.5);

  min_location = [-square_width,-square_width];

  for (let i = 0; i <= this.zoo_size; i++) {
    for (let j = 0; j <= this.zoo_size; j++) {
      if (this.zoo_vertices[i][j].n_path == true && square_width * j + square_width / 2 > min_location[1]) {
        min_location = [square_width * i, square_width * j];
      }
    }
  }

  this.player = this.makeCharacter("brown_bear"); //brown_bear
  this.player.position.set(min_location[0], min_location[1]);
  this.decorations.push(this.player);

  this.npcs = [];

  let count = 0;
  for (let i = 1; i < this.zoo_size; i++) {
    for (let j = 1; j < this.zoo_size; j++) {
      count += 1;
      if (this.zoo_vertices[i][j].n_path == true 
        || this.zoo_vertices[i][j].s_path == true
        || this.zoo_vertices[i][j].e_path == true
        || this.zoo_vertices[i][j].w_path == true) {
        if (Math.random() < 0.75) {
          console.log("Making NPC");
          let new_npc = this.makeCharacter(pick(npc_list));
          new_npc.position.set(square_width * i, square_width * j);
          new_npc.walk_speed = 0.75 * default_walk_speed;
          new_npc.walk_frame_time = walk_frame_time / 0.75;
          this.decorations.push(new_npc);
          this.npcs.push(new_npc);
        }
      }
    }
  }
  console.log(count);
}


Game.prototype.populateZoo = function() {

  this.animals_obtained = 0;
  this.animals_available = 0;

  let sheet = PIXI.Loader.shared.resources["Art/Decorations/trees.json"].spritesheet;

  for (let i = 0; i < this.zoo_pens.length; i++) {
  // for (let i = 0; i < voronoi_size; i++) {
    // if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null && this.voronoi_metadata[i].group != 5000) {
      if (this.zoo_pens[i].decorations != null) {
        let decoration_number = 5;
        // if (this.zoo_pens[i].animal != null && animals[this.zoo_pens[i].animal].movement == "arboreal") {
        //   decoration_number = 10;
        // }
        if (this.zoo_pens[i].land == "forest") decoration_number = 10;
        for (let t = 0; t < decoration_number; t++) {
          if (Math.random() > 0.3) {
            let decoration_type = pick(this.zoo_pens[i].decorations);
            let decoration = null;
            if (decoration_type != "tree") {
              decoration = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/" + decoration_type + ".png"));
            }
            if (decoration_type == "tree") {
              decoration = new PIXI.Container();
              decoration.tree_number = Math.ceil(Math.random() * 3)
              let shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree_shadow.png"));
              shadow.anchor.set(0.5, 0.5);
              shadow.position.set(0,25);
              decoration.addChild(shadow);
              let tree = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
              tree.gotoAndStop(decoration.tree_number - 1);
              tree.anchor.set(0.5, 0.85);
              decoration.addChild(tree);
              this.shakers.push(decoration);
            }
            decoration.type = decoration_type;
            let edge = pick(this.zoo_pens[i].polygon);
            let fraction = 0.3 + 0.5 * Math.random();
            decoration.position.set(
              (1-fraction) * this.zoo_pens[i].cx + (fraction) * edge[0],
              (1-fraction) * this.zoo_pens[i].cy + (fraction) * edge[1]);
            decoration.scale.set(1.2, 1.2);
            if (decoration_type != "tree") {
              decoration.anchor.set(0.5,0.9);
            }
            this.decorations.push(decoration);
            this.zoo_pens[i].decoration_objects.push(decoration);
          }
        }
      }

      if (this.zoo_pens[i].animal != null) {
        this.animals_available += 1;
        this.zoo_pens[i].animal_objects = [];
        let animal_name = this.zoo_pens[i].animal;

        let num_animals_here = animals[animal_name].min + Math.floor(Math.random() * (1 + animals[animal_name].max - animals[animal_name].min))

        for (let n = 0; n < num_animals_here; n++) {
          
          let x = this.zoo_pens[i].cx - 60 + 120 * Math.random();
          let y = this.zoo_pens[i].cy - 60 + 120 * Math.random();
          if (this.pointInPen(x, y) == this.zoo_pens[i]) { // don't make animals outside the pen

            let animal = this.makeAnimal(animal_name, this.zoo_pens[i]);
            animal.position.set(x, y);
            // animal.position.set(this.zoo_pens[i].cx, this.zoo_pens[i].cy);
            this.decorations.push(animal);
            this.zoo_pens[i].animal_objects.push(animal);
            this.animals.push(animal);
            this.shakers.push(animal);
            this.shakers.push(this.zoo_pens[i].land_object);
          }
        }
      }

      if (this.zoo_pens[i].special == "FERRIS_WHEEL") {
        this.ferris_wheel = this.makeFerrisWheel(this.zoo_pens[i]);
        this.ferris_wheel.position.set(this.zoo_pens[i].cx, this.zoo_pens[i].cy + 180);
        this.decorations.push(this.ferris_wheel);
        this.zoo_pens[i].special_object = this.ferris_wheel;
      }

      if (this.zoo_pens[i].special == "CAFE") {
        this.cafe = this.makeCafeExterior(this.zoo_pens[i]);
        this.cafe.position.set(this.zoo_pens[i].cx, this.zoo_pens[i].cy);
        this.decorations.push(this.cafe);
        this.zoo_pens[i].special_object = this.cafe;
      }  
  }

  // Add lots of trees just outside the perimeter.
  // But not a thousand trees.
  // Just a hundred trees. They move around with the player.
  // HA HA HA HA HA HA HA HA HA HA HA.
  this.ent_positions = [];
  for (let i = -1; i <= this.zoo_size; i++) {
    for (let j = -1; j <= this.zoo_size; j++) {
      if (i == -1 || j == -1 || i == this.zoo_size || j == this.zoo_size
        || (i >= 0 && j >= 0 && i < this.zoo_size && j < this.zoo_size && this.zoo_squares[i][j].reachable == false)) {
        for (let t = 0; t < 70; t++) {
          if (Math.random() > 0.4) {
            let x = square_width * i + square_width * Math.random();
            let y = square_width * j + square_width * Math.random();
            // let outside_all_pens = true;
            // for (let k = 0; k < this.zoo_pens.length; k++) {
            //   if (this.zoo_pens[k].animal_objects != null || this.zoo_pens[k].special_object != null) {
            //     if (pointInsidePolygon([x, y], this.zoo_pens[k].polygon)) {
            //       outside_all_pens = false;
            //       console.log("cancelled a tree");
            //       break;
            //     }
            //   }
            // }
            if (this.pointInPen(x, y) == null && distance(x, y, this.player.x, this.player.y) > 250) { // && distance(x, y, blobs)
              this.ent_positions.push([x,y, Math.ceil(Math.random() * 3)]);
            } else {
              console.log("cancelled a tree");
            }
          }
        }
      }
    }
  }
  
  this.ents = [];
  for (let k = 0; k < total_ents; k++) {

    let ent = new PIXI.Container();
    let shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree_shadow.png"));
    shadow.anchor.set(0.5, 0.5);
    shadow.position.set(0,25);
    ent.addChild(shadow);
    let tree = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
    tree.gotoAndStop(0);
    tree.anchor.set(0.5, 0.85);
    ent.addChild(tree);
    ent.tree = tree;

    // let ent = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
    ent.position.set(0, 0);
    // ent.gotoAndStop(0);
    ent.visible = false;
    this.ents.push(ent);
    this.decorations.push(ent);
  }


  // Add a few trees around the edges of the pens
  let tree_lining_points = [];
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].w_edge
        && !this.isCafeTile(i,j)) {
        for (let t = 0; t < 4; t++) {
          if (Math.random() > 0.4) {
            let x = square_width * i + 120 + 20 * Math.random();
            let y = square_width * j + 200 + (square_width - 400) * Math.random();
            if (this.pointInPen(x, y) == null) {
              tree_lining_points.push([x, y])
            }
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].e_edge
        && !this.isCafeTile(i,j)) {
        for (let t = 0; t < 4; t++) {
          if (Math.random() > 0.4) {
            let x = square_width * i + square_width - 120 - 20 * Math.random();
            let y = square_width * j + 200 + (square_width - 400) * Math.random();
            if (this.pointInPen(x, y) == null) {
              tree_lining_points.push([x, y]);
            }
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].n_edge) {
        for (let t = 0; t < 3; t++) {
          if (Math.random() > 0.3) {
            let x = square_width * i + 200 + (square_width - 400) * Math.random();
            let y = square_width * j + 120 + 20 * Math.random();
            if (this.pointInPen(x, y) == null) {
              tree_lining_points.push([x, y]);
            }
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].s_edge
        && !this.isCafeTile(i,j)) {
        for (let t = 0; t < 3; t++) {
          if (Math.random() > 0.2) {
            let x = square_width * i + 200 + (square_width - 400) * Math.random();
            let y = square_width * j + square_width - 120 - 20 * Math.random();
            if (this.pointInPen(x, y) == null) {
              tree_lining_points.push([x, y]);
            }
          }
        }
      }
    }
  }

  for (let i = 0; i < tree_lining_points.length; i++) {
    let x = tree_lining_points[i][0];
    let y = tree_lining_points[i][1];

    let decoration = new PIXI.Container();
    decoration.type = "tree";
    decoration.tree_number = Math.ceil(Math.random() * 3)
    let shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree_shadow.png"));
    shadow.anchor.set(0.5, 0.5);
    shadow.position.set(0,25);
    decoration.addChild(shadow);
    let tree = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
    tree.gotoAndStop(decoration.tree_number - 1);
    tree.anchor.set(0.5, 0.85);
    decoration.addChild(tree);
    decoration.position.set(x, y);
    this.decorations.push(decoration);
  }

  this.updateAnimalCount();

  this.updateEnts();
}


Game.prototype.zooKeyDown = function(ev) {
  var self = this;
  var screen = this.screens["zoo"];

  let key = ev.key;

  if (this.zoo_mode == "active" && this.map_visible == true) {
    if (key === "Escape" || key === " " || key === "Enter") {
      this.hideMap();
      return;
    }
  } else if (this.zoo_mode == "active" && !this.map_visible) {
    if (key === "Escape") {
      this.menu_selection_number = 0;
      this.changeMenuSelection(0);
      this.zoo_mode = "menu";
      this.menu_layer.visible = true;
    }
  } else if (this.zoo_mode == "menu") {
    if (key === "Escape") {
      this.zoo_mode = "active";
      this.menu_layer.visible = false;
    }
  }

  if (this.zoo_mode == "menu") {
    if (key === "ArrowUp") {
      this.changeMenuSelection(-1);
    } else if (key === "ArrowDown") {
      this.changeMenuSelection(1);
    }


    if (this.menu_selection_number == 0 && key == "ArrowLeft") {
      if (music_volume >= 0.1) {
        music_volume -= 0.1;
        if (music_volume < 0.001) music_volume = 0;
        music_volume = Math.round(music_volume * 10) / 10;
        localStorage.setItem("music_volume", music_volume);
        if (this.music != null) this.music.volume = music_volume;
        if (this.music == null && music_volume > 0) this.setMusic("background_music");
        this.music_slider_bar.position.set(this.music_slider_left + 150 * music_volume,113);
      }
    }

    if (this.menu_selection_number == 0 && key == "ArrowRight") {
      if (music_volume <= 0.9) {
        music_volume += 0.1;
        if (music_volume > 0.999) music_volume = 1;
        music_volume = Math.round(music_volume * 10) / 10;
        localStorage.setItem("music_volume", music_volume);
        if (this.music != null) this.music.volume = music_volume;
        if (this.music == null && music_volume > 0) this.setMusic("background_music");
        this.music_slider_bar.position.set(this.music_slider_left + 150 * music_volume,113);
      }
    }

    if (this.menu_selection_number == 1 && key == "ArrowLeft") {
      if (sound_volume >= 0.1) {
        sound_volume -= 0.1;
        if (sound_volume < 0.001) sound_volume = 0;
        sound_volume = Math.round(sound_volume * 10) / 10;
        localStorage.setItem("sound_volume", sound_volume);
        this.soundEffect("pop");
        this.sound_slider_bar.position.set(this.sound_slider_left + 150 * sound_volume, 222);
      }
    }

    if (this.menu_selection_number == 1 && key == "ArrowRight") {
      if (sound_volume <= 0.9) {
        sound_volume += 0.1;
        if (sound_volume > 0.999) sound_volume = 1;
        sound_volume = Math.round(sound_volume * 10) / 10;
        localStorage.setItem("sound_volume", sound_volume);
        this.soundEffect("pop");
        this.sound_slider_bar.position.set(this.sound_slider_left + 150 * sound_volume, 222);
      }
    }

    if (this.menu_selection_number == 4 && (key == "ArrowLeft" || key == "ArrowRight" || key == "Enter")) {
      game_fullscreen = !game_fullscreen;
      if (game_fullscreen == true) {
        window.gameFullScreen(game_fullscreen);
      } else {
        window.gameFullScreen(game_fullscreen);
        window.gameFullScreen(game_fullscreen); // twice to force the resize.
      }
      this.keymap = {};
      this.changeMenuSelection(0);
    }

    if (this.menu_selection_number == 2 && key == "Enter") {
      this.zoo_mode = "fading";
      this.fadeToBlack(1000);
      delay(function() {
        localStorage.setItem("zoo_size", 6);
        self.zoo_size = localStorage.getItem("zoo_size");
        self.initializeZoo();
      }, 1000);
    }

    if (this.menu_selection_number == 3 && key == "Enter") {
      this.zoo_mode = "fading";
      this.fadeToBlack(1000);
      delay(function() {
        localStorage.setItem("zoo_size", 8);
        self.zoo_size = localStorage.getItem("zoo_size");
        self.initializeZoo();
      }, 1000);
    }
  }

  if (this.zoo_mode == "ferris_wheel" && this.ferris_wheel.moving == true && key === "Escape") {
    this.ferris_wheel.ride_number += 1;
    this.ferris_wheel.stopMoving();
    this.fadeToBlack(1000);

    delay(function() {
      self.ferris_wheel.reset();
    }, 900)

    delay(function() {
        self.decorations.push(self.player);
        self.sortLayer(self.map.decoration_layer, self.decorations);

        self.fadeFromBlack(1000);

        self.zoo_mode = "active";

        self.checkPenProximity(self.player.x, self.player.y, self.player.direction);
    }, 2400);
  }

  if (this.zoo_mode == "active") {
    if (this.typing_allowed && this.typing_ui.visible) {
      for (i in lower_array) {
        if (key === lower_array[i] || key === letter_array[i]) {
          this.addType(letter_array[i]);
        }
      }

      if (key === "Backspace" || key === "Delete") {
        this.deleteType();
      }
    } else if (this.display_typing_allowed && this.display_ui.visible) {
      for (i in lower_array) {
        if (key === lower_array[i] || key === letter_array[i]) {
          this.addDisplayType(letter_array[i]);
        }
      }

      if (key === "Backspace" || key === "Delete") {
        this.deleteDisplayType();
      }
    }
  }
}


Game.prototype.addType = function(letter) {
  var self = this;
  var screen = this.screens["typing"];

  if (this.typing_text.text.length < this.thing_to_type.length) {
    if (this.thing_to_type[this.typing_text.text.length] == "_") {
      this.typing_text.text += " ";
    }
    this.typing_text.text += letter;
  }

  if (this.typing_text.text == this.thing_to_type.replace("_", " ")) {
    this.soundEffect("success");
    flicker(this.typing_text, 300, 0x000000, 0xFFFFFF);
    this.typing_allowed = false;

    let thing_to_type = this.thing_to_type;
    let pen_to_fix = this.pen_to_fix;

    delay(function() {
      self.ungrey(pen_to_fix);
      self.soundEffect("build");
      if (pen_to_fix.animal_objects != null) {
        self.animals_obtained += 1;
        self.updateAnimalCount();
      }
      pen_to_fix.land_object.shake = self.markTime();

      for (let i = 0; i < self.pen_to_fix.polygon.length; i++) {
        let x = pen_to_fix.polygon[i][0];
        let y = pen_to_fix.polygon[i][1];
        self.makeSmoke(self.map.build_effect_layer, x, y, 1.8, 1.8);
      }

      self.hideTypingText();

      self.checkPenProximity(self.player.x, self.player.y, self.player.direction);

    }, 200);


    delay(function() {
      self.changeDisplayText(thing_to_type, pen_to_fix);
      self.hideTypingText();
    }, 300);
  }
}


Game.prototype.deleteType = function() {
  var self = this;
  var screen = this.screens["zoo"];

  if (this.typing_text.text.length > 0) {
    if (this.typing_text.text[this.typing_text.text.length - 1] === " ") { 
      console.log("yes it does");
      this.typing_text.text = this.typing_text.text.slice(0,-1);
    }
    let l = this.typing_text.text.slice(-1,this.typing_text.text.length);
    let t = new PIXI.Text(l, {fontFamily: "Bebas Neue", fontSize: 140, fill: 0x000000, letterSpacing: 3, align: "left"});
    t.anchor.set(0,0.5);
    t.position.set(25 + 50 * (this.typing_text.text.length - 1), 93);
    t.vx = -20 + 40 * Math.random();
    t.vy = -5 + -20 * Math.random();
    t.floor = 1200;
    screen.addChild(t);
    this.freefalling.push(t);

    this.typing_text.text = this.typing_text.text.slice(0,-1);
    this.soundEffect("swipe");
  }
}


Game.prototype.addDisplayType = function(letter) {
  var self = this;
  var screen = this.screens["zoo"];

  let prefix = false;

  // console.log(this.action_typing_text[this.action_default_slot].text);

  if (this.action_typing_text[this.action_default_slot].text.length  == 0) {
    // console.log("checking prefix");
    // only perform this prefix check if you're not using the existing field.
    for (let i = 0; i < this.action_list.length; i++) {
      let word = this.action_typing_text[i].text + letter;
      // console.log(this.action_list[i]);
      // console.log(word);
      if (this.action_list[i].indexOf(word) == 0) {
        console.log("it is a prefix");
        prefix = true;
        this.action_default_slot = i;
      }
      // console.log("---");
    }
  }

  if (prefix) {
    for (let i = 0; i < this.action_list.length; i++) {
      if (i == this.action_default_slot) {
        if (this.action_typing_text[this.action_default_slot].text.length < this.action_grey_text[this.action_default_slot].text.length) {
          this.action_typing_text[this.action_default_slot].text += letter;
        }
      } else {
        this.action_typing_text[i].text = "";
      }
    }
  } else {
    if (this.action_typing_text[this.action_default_slot].text.length < this.action_grey_text[this.action_default_slot].text.length) {
      this.action_typing_text[this.action_default_slot].text += letter;
    }
  }


  if (this.action_typing_text[this.action_default_slot].text == this.action_grey_text[this.action_default_slot].text) {
    if (this.action_typing_text[this.action_default_slot].text == "RIDE") {
      this.rideFerrisWheel();
    } else if (this.action_typing_text[this.action_default_slot].text == "FEED") {
      this.feedAnimal();
    } else if (this.action_typing_text[this.action_default_slot].text == "POOP") {
      this.poopAnimal();
    } else if (this.action_typing_text[this.action_default_slot].text == "MAP") {
      this.activateMap();
    } else if (this.action_typing_text[this.action_default_slot].text == "COLOR") {

      this.soundEffect("success");
    
      this.display_typing_allowed = false;

      delay(function() {
        self.action_typing_text[self.action_default_slot].text = "";
        self.display_typing_allowed = true;
      }, 300);

      flicker(this.action_typing_text[this.action_default_slot], 300, 0x000000, 0xFFFFFF);

      // remove previous ferris wheel, I think.
      let new_decorations = [];
      for (let i = 0; i < this.decorations.length; i++) {
        if (this.decorations[i] != this.ferris_wheel) {
          new_decorations.push(this.decorations[i]);
        }
      }
      this.decorations = new_decorations;
      this.sortLayer(this.map.decoration_layer, this.decorations);

      let pen = this.ferris_wheel.pen;

      this.ferris_wheel = this.makeFerrisWheel(pen);
      this.ferris_wheel.position.set(pen.cx, pen.cy + 180);
      this.decorations.push(this.ferris_wheel);
      pen.special_object = this.ferris_wheel;
    }
  }
}


Game.prototype.deleteDisplayType = function() {
  var self = this;
  var screen = this.screens["zoo"];

  let text_box = this.action_typing_text[this.action_default_slot];

  let l = text_box.text.slice(-1, text_box.text.length);
  let t = new PIXI.Text(l, {fontFamily: "Bebas Neue", fontSize: 80, fill: 0x000000, letterSpacing: 3, align: "left"});
  t.anchor.set(0,1);
  t.position.set(130 + 28 * (text_box.text.length - 1), text_box.y);
  t.vx = -20 + 40 * Math.random();
  t.vy = -5 + -20 * Math.random();
  t.floor = 1200;
  screen.addChild(t);
  this.freefalling.push(t);

  text_box.text = text_box.text.slice(0,-1);
  this.soundEffect("swipe");
}


Game.prototype.changeTypingText = function(new_word, found_pen) {
  var self = this;
  var screen = this.screens["zoo"];

  this.thing_to_type = new_word;
  this.pen_to_fix = found_pen;
  
  if (this.typing_backing != null) {
    this.typing_ui.removeChild(this.typing_backing);
    this.typing_backing.destroy();
  }

  if (this.typing_picture != null) {
    this.typing_ui.removeChild(this.typing_picture);
    this.typing_picture.destroy();
  }

  let measure = new PIXI.TextMetrics.measureText(new_word, this.typing_text.style);
  // sign_backing.width = measure.width + 6;
  // sign_backing.height = measure.height + 6;

  if (this.thing_to_type == "FERRIS_WHEEL") {
    this.typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/icon.png"));
  } else if (this.thing_to_type == "CAFE") {
    this.typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Cafe/icon.png"));
  } else if (!(this.thing_to_type in animated_animals) && !(animals[this.thing_to_type].movement == "arboreal")) {
    this.typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/" + this.thing_to_type.toLowerCase() + ".png"));
  } else {
    console.log(this.thing_to_type);
    var sheet = PIXI.Loader.shared.resources["Art/Animals/" + this.thing_to_type.toLowerCase() + ".json"].spritesheet;
    this.typing_picture = new PIXI.AnimatedSprite(sheet.animations[this.thing_to_type.toLowerCase()]);
  }
  
  this.typing_picture.anchor.set(0.5, 0.77);
  this.typing_picture.scale.set(0.7, 0.7);
  this.typing_picture.position.set(110 + measure.width, 133);

  this.typing_backing = new PIXI.Graphics();
  this.typing_backing.beginFill(0xFFFFFF, 1);
  this.typing_backing.drawRoundedRect(-20, -20, measure.width + 180, 120, 20);
  for (let i = 0; i < measure.width + 200; i += 40 + Math.floor(Math.random() * 20)) {
    //this.typing_backing.drawRoundedRect(-20, -20, 500, 180, 20);
    this.typing_backing.drawCircle(i, 120 + 40 * Math.random() - 40 * (i / (measure.width + 200)), 50 + 30 * Math.random());
  }
  this.typing_backing.drawCircle(measure.width + 200, 10 + 30 * Math.random(), 50 + 30 * Math.random());
  this.typing_backing.endFill();
  this.typing_backing.filters = [this.dropshadow_filter];

  this.grey_text.text = new_word.replace("_", " ");
  this.typing_text.text = "";

  this.typing_ui.addChild(this.typing_backing);
  this.typing_ui.addChild(this.typing_picture);
  this.typing_ui.addChild(this.grey_text);
  this.typing_ui.addChild(this.typing_text);

  if (!this.typing_ui.visible) {
    this.typing_ui.visible = true;
    this.typing_ui.position.set(0, -300);
  }
  new TWEEN.Tween(this.typing_ui)
    .to({y: 0})
    .duration(250)
    .start()
    .onUpdate(function() {
      self.typing_ui.visible = true;
    })
    .onComplete(function() {
      self.typing_allowed = true;
      self.typing_ui.visible = true;
    });
}


Game.prototype.hideTypingText = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.typing_allowed = false;
  this.pen_to_fix = null;
  this.thing_to_type = "";
  new TWEEN.Tween(this.typing_ui)
    .to({y: -300})
    .duration(250)
    .start()
    .onComplete(function() {
      self.typing_ui.visible = false;
    });
}


Game.prototype.changeDisplayText = function(thing_to_display, pen_to_display, word_list = []) {
  var self = this;
  var screen = this.screens["zoo"];

  this.thing_to_display = thing_to_display;
  this.pen_to_display = pen_to_display;

  let measure = new PIXI.TextMetrics.measureText(this.thing_to_display, this.display_text.style);
  this.display_backing.position.set(1280 - (measure.width + 50), 960 - 30)
  this.display_text.text = this.thing_to_display.replace("_", " ");

  if (word_list.length == 0) {
    if (this.thing_to_display == "MAP") {
      word_list = ["MAP"];
    } else if (this.thing_to_display == "FERRIS_WHEEL") {
      word_list = ["COLOR", "RIDE"];
    } else if (this.thing_to_display == "CAFE") {
      word_list = [];
    } else {
      word_list = ["POOP", "FEED", "MAP"];
    }
  }

  if (word_list.length > 1 || word_list[0] != "MAP") {
    this.display_backing.visible = true;
    this.display_text.visible = true;
  } else {
    this.display_backing.visible = false;
    this.display_text.visible = false;
  }

  for (const [name, glyph] of Object.entries(this.action_glyphs)) {
    this.action_glyphs[name].visible = false;
  }

  for (let i = 0; i < 4; i++) {
    this.action_typing_text[i].text = "";
    this.action_grey_text[i].text = "";
  }

  for (let i = 0; i < word_list.length; i++) {
    this.action_grey_text[i].text = word_list[i];
    this.action_glyphs[word_list[i]].visible = true;
    this.action_glyphs[word_list[i]].y = 905 - 90 * i;
  }

  this.display_action_backing.anchor.set(0, 1);
  this.display_action_backing.scale.set(0.5, 0.5 * word_list.length);

  this.action_default_slot = word_list.length - 1;
  this.action_list = word_list;

  if (!this.display_ui.visible) {
    this.display_ui.visible = true;
    this.display_ui.position.set(0, 300);
  }
  new TWEEN.Tween(this.display_ui)
    .to({y: 0})
    .duration(250)
    .start()
    .onUpdate(function() {
      self.display_ui.visible = true;
    })
    .onComplete(function() {
      self.display_typing_allowed = true;
      self.display_ui.visible = true;
    });
}


Game.prototype.hideDisplayText = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.display_typing_allowed = false;
  this.pen_to_display = null;

  this.thing_to_display = "";
  new TWEEN.Tween(this.display_ui)
    .to({y: 300})
    .duration(250)
    .start()
    .onComplete(function() {
      self.display_ui.visible = false;
    });
}


Game.prototype.grey = function(pen) {
  pen.state = "grey";
  if (pen.animal_objects != null) {
    for (let j = 0; j < pen.animal_objects.length; j++) {
      pen.animal_objects[j].alpha = 0.4;
      if (j > 0) pen.animal_objects[j].visible = false;
    }
  }
  for (let j = 0; j < pen.decoration_objects.length; j++) {
    pen.decoration_objects[j].visible = false;
  }
  if (pen.special == "FERRIS_WHEEL") {
    for (let j = 0; j < pen.special_object.all_objects.length; j++) {
      pen.special_object.all_objects[j].tint = pen.special_object.all_objects[j].grey_color;
    }
  }
  if (pen.special == "CAFE") {
    pen.special_object.grey();
  }
  if (pen.land_object != null) {
    for (let j = 0; j < pen.land_object.children.length; j++) {
      let land = pen.land_object.children[j];
      land.tint = land.grey_color;
    }
  }
}


Game.prototype.ungrey = function(pen) {

  pen.land_object.filters = [];

  pen.state = "ungrey";
  if (pen.animal_objects != null) {
    for (let j = 0; j < pen.animal_objects.length; j++) {
      pen.animal_objects[j].alpha  = 1;
      pen.animal_objects[j].visible = true;
    }
  }
  for (let j = 0; j < pen.decoration_objects.length; j++) {
    pen.decoration_objects[j].visible = true;
  }
  if (pen.special == "FERRIS_WHEEL") {
    for (let j = 0; j < pen.special_object.all_objects.length; j++) {
      pen.special_object.all_objects[j].tint = pen.special_object.all_objects[j].true_color;
    }
  }
  if (pen.special == "CAFE") {
    pen.special_object.ungrey();
  }
  if (pen.land_object != null) {
    for (let j = 0; j < pen.land_object.children.length; j++) {
      let land = pen.land_object.children[j];
      land.tint = land.true_color;
    }
  }
}


Game.prototype.greyAll = function() {
  for (let i = 0; i < this.zoo_pens.length; i++) {
    //if(this.zoo_pens[i].use == true && this.zoo_pens[i].group != 5000) {
      this.grey(this.zoo_pens[i]);
    //}
  }
}


Game.prototype.ungreyAll = function() {
  for (let i = 0; i < this.zoo_pens.length; i++) {
    //if(this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != 5000) {
      this.ungrey(this.zoo_pens[i]);
    //}
  }
}


Game.prototype.greyAllActivePens = function() {
  // for (let i = 0; i < voronoi_size; i++) {
  //   if(this.voronoi_metadata[i].use == true 
  //     && this.voronoi_metadata[i].group != 5000
  //     && this.voronoi_metadata[i].animal != null) {
  //     this.grey(i);
  //   }
  // }
  for (let i = 0; i < this.zoo_pens.length; i++) {
    if (this.zoo_pens[i].animal != null || this.zoo_pens[i].special != null) {
      this.grey(this.zoo_pens[i]);
    }
  }
}


Game.prototype.displayMap = function() {
  for (let i = 0; i < this.zoo_pens.length; i++) {
    //if(this.zoo_pens[i].use == true && this.zoo_pens[i].group != 5000) {
      //this.grey(this.zoo_pens[i]);
    //}
    let pen = this.zoo_pens[i];
    if (pen.animal_objects != null) {
      for (let j = 0; j < pen.animal_objects.length; j++) {
        if (pen.state == "grey") pen.animal_objects[j].alpha = 0.4;
        if (j > 0) pen.animal_objects[j].visible = false;
        pen.animal_objects[j].scale.set(3,3);
      }
    }
    for (let j = 0; j < pen.decoration_objects.length; j++) {
      pen.decoration_objects[j].visible = false;
    }
    // if (pen.land_object != null) {
    //   pen.land_object.visible = false;
    // }
  }
  for (let i = 0; i < this.npcs.length; i++) {
    this.npcs[i].visible = false;
  }
  // for (let i = 0; i < this.decorations.length; i++) {
  //   if (this.decorations[i].type == "fence") {
  //     this.decorations[i].visible = false;
  //   }
  // }
  this.player.scale.set(3 * 0.72,3 * 0.72);
  this.player.red_circle.visible = true;
  this.map_border.visible = true;

  // gonna have to change this when map is typed
  if (this.typing_allowed) this.hideTypingText();
  this.hideDisplayText();

  this.map.scale.set(0.2, 0.2);

  this.escape_glyph.visible = true;
  this.escape_text.visible = true;

  this.map_visible = true;
}


Game.prototype.hideMap = function() {
  for (let i = 0; i < this.zoo_pens.length; i++) {
    //if(this.zoo_pens[i].use == true && this.zoo_pens[i].group != 5000) {
      //this.grey(this.zoo_pens[i]);
    //}
    let pen = this.zoo_pens[i];
    if (pen.animal_objects != null) {
      for (let j = 0; j < pen.animal_objects.length; j++) {
        if (pen.state == "grey") pen.animal_objects[j].alpha = 0.4;
        if (pen.state == "ungrey") {
          pen.animal_objects[j].alpha = 1.0;
          pen.animal_objects[j].visible = true;
        }
        pen.animal_objects[j].scale.set(1,1);
      }
    }
    if (pen.state == "ungrey") {
      for (let j = 0; j < pen.decoration_objects.length; j++) {
        pen.decoration_objects[j].visible = true;
      }
    }
    if (pen.land_object != null) {
      pen.land_object.visible = true;
    }
  }
  for (let i = 0; i < this.npcs.length; i++) {
    this.npcs[i].visible = true;
  }
  // for (let i = 0; i < this.decorations.length; i++) {
  //   if (this.decorations[i].type == "fence") {
  //     this.decorations[i].visible = true;
  //   }
  // }
  this.player.scale.set(0.72,0.72);
  this.player.red_circle.visible = false;
  this.map_border.visible = false;

  this.map.scale.set(1, 1);

  this.map_visible = false;

  this.escape_glyph.visible = false;
  this.escape_text.visible = false;

  console.log(this.player.direction);
  if (this.map_visible == false) {
    this.checkPenProximity(this.player.x, this.player.y, this.player.direction);
  }
}


Game.prototype.rideFerrisWheel = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.soundEffect("success");
    
  this.display_typing_allowed = false;

  flicker(this.action_typing_text[this.action_default_slot], 300, 0x000000, 0xFFFFFF);

  delay(function() {
    self.action_typing_text[self.action_default_slot].text = "";
    self.display_typing_allowed = true;
  }, 300);

  this.zoo_mode = "pre_ferris_wheel";
  // this.fadeScreens("zoo", "zoo", true);

  this.ferris_wheel.ride_number += 1;
  let ride_number = this.ferris_wheel.ride_number;

  delay(function() {
    self.hideDisplayText();
    self.fadeToBlack(1000);
  }, 300);

  delay(function() {
    self.player.old_position = [self.player.position.x, self.player.position.y];

    self.zoo_mode = "ferris_wheel";

    new_decorations = [];
    for (let i = 0; i < self.decorations.length; i++) {
      if (self.decorations[i].character_name != "brown_bear") {
        new_decorations.push(self.decorations[i]);
      } else {
      }
    }
    self.decorations = new_decorations;
    self.sortLayer(self.map.decoration_layer, self.decorations);

    self.ferris_wheel.addPlayer(self.player);
  }, 1400)

  delay(function() {
    self.fadeFromBlack(1000);
  }, 1800);

  delay(function() {
    self.ferris_wheel.startMoving();
  }, 2800);

  delay(function() {
    if (self.ferris_wheel.ride_number == ride_number) { // guard so we can skip a ride
      self.ferris_wheel.stopMoving();
    }
  }, 62800)

  delay(function() {
    if (self.ferris_wheel.ride_number == ride_number) {
      self.fadeToBlack(1000);
    }
  }, 63100)

  delay(function() {
    if (self.ferris_wheel.ride_number == ride_number) {
      self.ferris_wheel.reset();
    }
  }, 64200)

  delay(function() {
    if (self.ferris_wheel.ride_number == ride_number) {
      self.decorations.push(self.player);
      self.sortLayer(self.map.decoration_layer, self.decorations);

      self.fadeFromBlack(1000);

      self.zoo_mode = "active";

      self.checkPenProximity(self.player.x, self.player.y, self.player.direction);
    }
  }, 64600);
}


Game.prototype.feedAnimal = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.soundEffect("success");
    
  this.display_typing_allowed = false;

  delay(function() {
    self.action_typing_text[self.action_default_slot].text = "";
    self.display_typing_allowed = true;
  }, 300);

  flicker(this.action_typing_text[this.action_default_slot], 300, 0x000000, 0xFFFFFF);

  let food_types = ["greens"]
  if (this.thing_to_display in animals) food_types = animals[this.thing_to_display].food;
  let food_type = pick(food_types);

  let sheet = PIXI.Loader.shared.resources["Art/Food/" + food_type + ".json"].spritesheet
  let food = new PIXI.AnimatedSprite(sheet.animations[food_type]);
  food.scale.set(0.75, 0.75);
  food.type = food_type;
  food.start_x = this.player.x;
  food.start_y = this.player.y + 1;
  food.end_x = this.pen_to_display.cx - 60 + 120 * Math.random();
  food.end_y = this.pen_to_display.cy - 60 + 120 * Math.random();
  food.anchor.set(0.5,0.75)
  food.position.set(food.start_x, food.start_y);
  food.interpolation = 0;
  food.state = "flying";
  food.parent = this.map.decoration_layer;
  food.animal_target = this.thing_to_display;
  this.decorations.push(food);
  this.foods.push(food);
}


Game.prototype.poopAnimal = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.soundEffect("success");
    
  this.display_typing_allowed = false;

  delay(function() {
    self.action_typing_text[self.action_default_slot].text = "";
    self.display_typing_allowed = true;
  }, 300);

  flicker(this.action_typing_text[this.action_default_slot], 300, 0x000000, 0xFFFFFF);

  let current_animal = pick(this.pen_to_display.animal_objects);
  self.soundEffect("poop_" + Math.ceil(Math.random() * 3));
  for(let i = 0; i <= 600; i+= 300) {
    delay(function() {
      let b = current_animal.global_butt_coords();
    
      let poop_shard = new PIXI.Graphics();
      poop_shard.beginFill(poop_color);
      poop_shard.drawPolygon([
        -4, -6,
        2 + 4 * Math.random(), -4 - 4 * Math.random(),
        6 + 5 * Math.random(), 4 + 4 * Math.random(),
        -6 - 5 * Math.random(), 4 + 4 * Math.random(),
        -4, -6,
      ]);
      poop_shard.position.set(b[0], b[1]);
      poop_shard.endFill();
      // let poop_shard = new PIXI.Sprite(PIXI.Texture.from("Art/poop.png"));
      // poop_shard.anchor.set(0.5, 0.5);
      // poop_shard.position.set(x, y);
      poop_shard.vx = -1 - 1.5 * Math.random();
      if (current_animal.direction < 0) poop_shard.vx *= -1;
      poop_shard.vy = 0;
      poop_shard.gravity = 1;
      poop_shard.floor = b[1] + 50;
      poop_shard.parent = self.map.decoration_layer;
      self.map.decoration_layer.addChild(poop_shard);
      self.decorations.push(poop_shard);

      console.log(poop_shard);
      self.drops.push(poop_shard);

      delay(function() {
        poop_shard.parent.removeChild(poop_shard);
        poop_shard.status = "dead";
      }, 2000 + Math.random() * 2000);

    }, i);
  }
}


Game.prototype.activateMap = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.soundEffect("success");
    
  this.display_typing_allowed = false;

  delay(function() {
    self.action_typing_text[self.action_default_slot].text = "";
    self.display_typing_allowed = true;
    self.displayMap();
  }, 300);

  flicker(this.action_typing_text[this.action_default_slot], 300, 0x000000, 0xFFFFFF);
}


Game.prototype.fadeTitle = function() {
  var self = this;

  this.first_move = true;

  new TWEEN.Tween(this.title_image)
    .to({alpha: 0})
    .duration(1000)
    .start()
    .onUpdate(function() {
    })
    .onComplete(function() {
      self.title_image.visible = false;
    });

  if (this.title_instructions.visible == true) {
    new TWEEN.Tween(this.title_instructions)
      .to({alpha: 0})
      .duration(1000)
      .start()
      .onUpdate(function() {
      })
      .onComplete(function() {
        self.title_instructions.visible = false;
      });
  }

  this.updateAnimalCount();

  this.animal_count_text.alpha = 0.01;
  this.animal_count_text.visible = true;
  new TWEEN.Tween(this.animal_count_text)
    .to({alpha: 0.6})
    .duration(1000)
    .start()
    .onUpdate(function() {
    }); 

  this.animal_count_glyph.alpha = 0.01;
  this.animal_count_glyph.visible = true;
  new TWEEN.Tween(this.animal_count_glyph)
    .to({alpha: 0.6})
    .duration(1000)
    .start()
    .onUpdate(function() {
    });  
}


Game.prototype.updateAnimalCount = function() {
  this.animal_count_text.text = this.animals_obtained + " / " + this.animals_available;
}


Game.prototype.sortLayer = function(layer_name, layer_object_list, artificial_y = false) {
  if (layer_object_list == null || layer_object_list.length == 0) return;

  if (artificial_y) {
    layer_object_list.sort(function(a,b) {
      return a.cy - b.cy;
    })
  } else {
    layer_object_list.sort(function(a,b) {
      return a.y - b.y;
    })
  }

  while(layer_name.children[0]) {
    let x = layer_name.removeChild(layer_name.children[0]);
  }

  for (let i = 0; i < layer_object_list.length; i++) {
    if (!(layer_object_list[i].status == "dead")) {
      layer_name.addChild(layer_object_list[i]);
    }
  }
}


Game.prototype.poopsAndFoods = function(fractional) {
  var self = this;
  var screen = this.screens[this.current_screen];

  for (let i = 0; i < this.foods.length; i++) {
    let food = this.foods[i];
    if (food.interpolation < 1) {
      food.interpolation += 0.05;
      food.position.set(
        (1 - food.interpolation) * food.start_x + food.interpolation * food.end_x,
        (1 - food.interpolation) * food.start_y + food.interpolation * food.end_y - 50 * Math.sin(food.interpolation * Math.PI),
      )
      if (food.interpolation >= 1) {
        food.interpolation = 1;
        food.status = "ground";
        food.position.set(food.end_x, food.end_y);
      }
    }
  }

  for (let i = 0; i < this.drops.length; i++) {
    let item = this.drops[i];
    if (item.position.y < item.floor) {
      item.position.x += item.vx * fractional;
      item.position.y += item.vy * fractional;
      item.vy += item.gravity * fractional;
    } else {
      item.position.y = item.floor;
    }
  }

  let new_drops = [];
  for (let i = 0; i < this.drops.length; i++) {
    let item = this.drops[i];
    if (item.status != "dead") {
      new_drops.push(item);
    }
  }
  this.drops = new_drops;
}


Game.prototype.updatePlayer = function() {
  var self = this;
  var keymap = this.keymap;
  var player = this.player;

  if (keymap["ArrowUp"] && keymap["ArrowRight"]) {
    player.direction = "upright";
  } else if (keymap["ArrowUp"] && keymap["ArrowLeft"]) {
    player.direction = "upleft";
  } else if (keymap["ArrowDown"] && keymap["ArrowRight"]) {
    player.direction = "downright";
  } else if (keymap["ArrowDown"] && keymap["ArrowLeft"]) {
    player.direction = "downleft";
  } else if (keymap["ArrowDown"]) {
    player.direction = "down";
  } else if (keymap["ArrowUp"]) {
    player.direction = "up";
  } else if (keymap["ArrowLeft"]) {
    player.direction = "left";
  } else if (keymap["ArrowRight"]) {
    player.direction = "right";
  } else {
    player.direction = null;
  }

  if (this.testMove(player.x, player.y, true, player.direction)) {
    if (player.direction != null && this.title_image.visible == true && this.title_image.alpha == 1) {
      this.fadeTitle();
    }

    player.move();

    this.updateEnts();

    if (player.direction != null && this.map_visible == false) {
      this.checkPenProximity(player.x, player.y, player.direction);
    }

    if (this.cafe != null) {
      if (Math.abs(player.x - this.cafe.x) <= 80 && player.y < this.cafe.y && player.y > this.cafe.y - 50) {
        this.player.visible = false;
        this.zoo_mode = "fading";
        this.initializeScreen("cafe");
        this.fadeScreens("zoo", "cafe", true);
      }
    }
  } else if (player.direction != null) {
    player.updateDirection();
  }
}


Game.prototype.testMove = function(x, y, use_bounds, direction) {
  let tx = x;
  let ty = y;

  if (direction == "right") tx += 40;
  if (direction == "left") tx -= 40;
  if (direction == "up") ty -= 30;
  if (direction == "down") ty += 64;
  if (direction == "downright") {
    tx += 40;
    ty += 64;
  }
  if (direction == "downleft") {
    tx -= 40;
    ty += 64;
  }
  if (direction == "upright") {
    tx += 40;
    ty -= 64;
  }
  if (direction == "upleft") {
    tx -= 40;
    ty -= 64;
  }

  if (use_bounds) {
    if (tx >= this.right_bound
      || tx <= this.left_bound
      || ty <= this.upper_bound
      || ty >= this.lower_bound) return false;
  }

  // if (direction == "up")
  // for (let i = 0; i < voronoi_size; i++) {
  //   if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null) {
  for (let i = 0; i < this.zoo_pens.length; i++) {
      if (pointInsidePolygon([tx, ty], this.zoo_pens[i].polygon)) {
        return false;
      }
    // }
  }

  return true;
}


Game.prototype.pointInPen = function(x, y, find_closest=false) {
  let min_distance = 100000;
  let closest_pen = null;
  for (let i = 0; i < this.zoo_pens.length; i++) {
    if (this.zoo_pens[i].animal_objects != null || this.zoo_pens[i].special_object != null) {
      if (pointInsidePolygon([x, y], this.zoo_pens[i].polygon)) {
        if (!find_closest) {
          return this.zoo_pens[i];
        } else {
          let d = distance(x, y, this.zoo_pens[i].cx, this.zoo_pens[i].cy);
          if (d < min_distance) {
            min_distance = d;
            closest_pen = this.zoo_pens[i];
          }
        }
      }
    }
  }
  if (find_closest) return closest_pen;
  return null;
}


Game.prototype.checkPenProximity = function(x, y, direction) {
  // Check proximity to any animal pens, first by casting a ray,
  // Then falling back on a small radius.

  let found_pen = null;
  for (let r = 1; r < 5; r++) {
    let tx = x;
    let ty = y;
    if (direction == "right") tx += 60*r;
    if (direction == "left") tx -= 60*r;
    if (direction == "up") ty -= 60*r;
    if (direction == "down") ty += 60*r;
    if (direction == "downright") {
      tx += 42*r;
      ty += 42*r;
    }
    if (direction == "downleft") {
      tx -= 42*r;
      ty += 42*r;
    }
    if (direction == "upright") {
      tx += 42*r;
      ty -= 42*r;
    }
    if (direction == "upleft") {
      tx -= 42*r;
      ty -= 42*r;
    }


    // for (let i = 0; i < this.zoo_pens.length; i++) {
    //   if (this.zoo_pens[i].animal_objects != null || this.zoo_pens[i].special_object != null) {
    //     if (pointInsidePolygon([tx, ty], this.zoo_pens[i].polygon)) {
    //       found_pen = this.zoo_pens[i];

    //       break;
    //     }
    //   }
    // }
    found_pen = this.pointInPen(tx, ty);
    if (found_pen != null) break;
  }

  if (found_pen == null) {
    for (let a = 0; a < 360; a += 45) {
      let tx = x + 120 * Math.cos(Math.PI / 180 * a);
      let ty = y + 120 * Math.sin(Math.PI / 180 * a);

      // for (let i = 0; i < this.zoo_pens.length; i++) {
      //   if (this.zoo_pens[i].animal_objects != null || this.zoo_pens[i].special_object != null) {
      //     if (pointInsidePolygon([tx, ty], this.zoo_pens[i].polygon)) {
      //       found_pen = this.zoo_pens[i];
      //       break;
      //     }
      //   }
      // }
      found_pen = this.pointInPen(tx, ty, true);
      if (found_pen != null) break;
    }
  }

  if (found_pen != null) {
    if (found_pen.animal_objects != null) {
      if (found_pen.animal != this.thing_to_type && found_pen.state == "grey") {
        // console.log("typing");
        this.changeTypingText(found_pen.animal, found_pen);
        if (this.display_ui.visible == true) {
          this.hideDisplayText();
        }
      } else if (found_pen.animal != this.thing_to_display && found_pen.state == "ungrey") {
        // console.log("display");
        this.changeDisplayText(found_pen.animal, found_pen);
        if (this.typing_ui.visible == true) {
          this.hideTypingText();
        }
      }
    } else if (found_pen.special_object != null) {
      if (found_pen.special != this.thing_to_type && found_pen.state == "grey") {
        // console.log("typing");
        this.changeTypingText(found_pen.special, found_pen);
        if (this.display_ui.visible == true) {
          this.hideDisplayText();
        }
      } else if (found_pen.special != this.thing_to_display && found_pen.state == "ungrey") {
        // console.log("display");
        this.changeDisplayText(found_pen.special, found_pen);
        if (this.typing_ui.visible == true) {
          this.hideTypingText();
        }
      }
    }
  }

  if (found_pen == null) {
    if (this.typing_allowed) this.hideTypingText();
    //this.hideDisplayText();
    this.changeDisplayText("MAP", null);
  }
}


Game.prototype.updateEnts = function() {
  if (this.ents.length == 0) return;
  if (this.player == null) return;
  for (let k = 0; k < total_ents; k++) {
    this.ents[k].visible = false;
  }
  ent_count = 0;
  for (let e = 0; e < this.ent_positions.length; e++) {
    let pos = this.ent_positions[e];

    if(Math.abs(this.player.x - pos[0]) < 800 && Math.abs(this.player.y - pos[1]) < 700) {
      if (ent_count < total_ents) {
        this.ents[ent_count].visible = true;
        this.ents[ent_count].position.set(pos[0], pos[1]);
        this.ents[ent_count].tree.gotoAndStop(pos[2] - 1);
        ent_count += 1;
      }
    }
  }
}


let npc_directions = [
  "up", "down", "left", "right",
  "downleft", "downright", "upleft", "upright",
  "pause", "pause", "pause", "pause"
]
Game.prototype.updateNPC = function(npc) {
  if (npc.change_direction_time == null || this.timeSince(npc.change_direction_time) > 500) {
    let dice = Math.random();
    if (dice < 0.5) {
      // keep the same direction
    } else {
      npc.direction = pick(npc_directions);
    }
    npc.change_direction_time = this.markTime();
  }

  if (npc.direction != "pause") {
    if (this.testMove(npc.x, npc.y, true, npc.direction)) {
      npc.move();
    }
  }
}


Game.prototype.updateZoo = function(diff) {
  var self = this;
  var screen = this.screens["zoo"];

  let fractional = diff / (1000/30.0);

  if(this.player == null) return;

  if (this.zoo_mode == "active") this.updatePlayer();

  if (this.zoo_mode == "ferris_wheel") this.ferris_wheel.update(fractional);

  if (this.first_move == false && this.timeSince(this.start_time) > 4000
    && this.title_instructions.visible == false) {
    this.title_instructions.visible = true;
    new TWEEN.Tween(this.title_instructions)
      .to({alpha: 1})
      .duration(1000)
      .start();
  }

  // if (this.timeSince(this.start_time) < 5000) {
  //     let scale = Math.max(0.1, (this.timeSince(this.start_time) / 5000));
  //     this.map.scale.set(scale, scale);
  //   } else {
  //     this.map.scale.set(1, 1);  
  //   }
  // if(true) {
  //   if (this.timeSince(this.start_time) < 2000) {
  //     this.map.position.set(640 - this.player.x * this.map.scale.x, 500 * ((2000 - this.timeSince(this.start_time)) / 2000) + 580 - this.player.y * this.map.scale.y);
  //   } else {
  //     this.map.position.set(640 - this.player.x * this.map.scale.x, 580 - this.player.y * this.map.scale.y);
  //   }
  // } else {
  //   this.map.scale.set(0.2, 0.2);
  //   this.map.position.set(640 - this.player.x * this.map.scale.x, 580 - this.player.y * this.map.scale.y);
  // }

  if (this.zoo_mode == "active" || this.zoo_mode == "fading" || this.zoo_mode == "loading") {
    // if (this.timeSince(this.start_time) < 2000) {
    //   this.map.position.set(640 - this.player.x * this.map.scale.x, 500 * ((2000 - this.timeSince(this.start_time)) / 2000) + 580 - this.player.y * this.map.scale.y);
    // } else {
    //   this.map.position.set(640 - this.player.x * this.map.scale.x, 580 - this.player.y * this.map.scale.y);
    // }
    this.map.position.set(640 - this.player.x * this.map.scale.x, 480 - this.player.y * this.map.scale.y);
  } else if (this.zoo_mode == "pre_ferris_wheel") {
    this.map.position.set(640 - this.player.x * this.map.scale.x, 480 - this.player.y * this.map.scale.y);
  } else if (this.zoo_mode == "ferris_wheel") {
    let x = this.ferris_wheel.x + this.player.x;
    let y = this.ferris_wheel.y + this.player.y;
    this.map.position.set(640 - x * this.map.scale.x, 480 - y * this.map.scale.y);
  }

  
  if (this.ferris_wheel != null) {
    if ((this.zoo_mode == "active" || this.zoo_mode == "fading") && this.player.y + 150 < this.ferris_wheel.y && this.map_visible == false) {
      this.ferris_wheel.alpha = Math.max(1 - (this.ferris_wheel.y - this.player.y - 150) / 800, 0.0);
    } else {
      this.ferris_wheel.alpha = 1;
    }
  }

  for (let i = 0; i < this.animals.length; i++) {
    if (this.animals[i].pen.state == "ungrey") {
      this.animals[i].update();
    }
  }

  for (let i = 0; i < this.npcs.length; i++) {
    this.updateNPC(this.npcs[i]);
  }

  this.sortLayer(this.map.decoration_layer, this.decorations);

  this.shakeThings();
  this.freeeeeFreeeeeFalling(fractional);
  this.poopsAndFoods(fractional);

}