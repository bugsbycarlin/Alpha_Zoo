
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
  this.free_balloons = [];

  this.terrain = [];
  this.decorations = [];
  this.animals = [];

  if (this.generated_textures != null) {
    // this.old_generated_textures = this.generated_textures;
    this.flushOldTextures();
  }
  this.generated_textures = [];

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


Game.prototype.flushOldTextures = function() {
  for (let i = 0; i < this.generated_textures.length; i++) {
    this.generated_textures[i].destroy(true);
  }
}


let steak_color = 0x954a4a;
let greens_color = 0x3c713a;
let fruit_color = 0x70527d;

let poop_color = 0x644b38;

let menu_selection_color = 0x42b2d2;
// let menu_selection_number = 

let npc_list = [
  "black_bear", "polar_bear",
  "rabbit_greenshirt", "rabbit_redshirt", "rabbit_blueshirt",
  "yellow_cat", "orange_cat", "light_cat"
];

Game.prototype.resetZooScreen = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.zoo_mode = "loading"; // loading, active, ferris_wheel, fading, menu

  // Make the map. These methods are in land.js.
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

  this.ghost = this.player = this.makeCharacter("brown_bear_ghost");
  screen.addChild(this.ghost);
  this.ghost.position.set(this.width / 2, this.height / 2);

  // this.makeLoadingScreen();
  this.black.alpha = 1;
  this.black.visible = true;
  pixi.stage.addChild(this.black);

  // Make the ui layer
  this.makeUI();
  this.makeMenu();

  // Populate the map with things. These methods are in land.js.
  this.designatePens();
  this.swapPens();
  this.prepPondsAndTerraces();
  this.drawMap();
  this.playerAndBoundaries();
  // populate zoo
  this.addAnimalsAndDecorations();
  
  this.sortLayer(this.map.decoration_layer, this.decorations);
  this.greyAllActivePens();
  // this.ungreyAll();

  this.initializeScreen("gift_shop");
  this.initializeScreen("cafe");

  this.start_time = this.markTime();
  this.first_move = false;

  this.setMusic("background_music");

  delay(function() {
    self.zoo_mode = "active";
    // self.loading_text.visible = false;
    self.fadeFromBlack(3000);
  }, 500);
}


Game.prototype.makeUI = function() {
  var self = this;
  var screen = this.screens["zoo"];
  
  this.ui_layer = new PIXI.Container();
  screen.addChild(this.ui_layer);

  this.typing_ui = new PIXI.Container();
  this.ui_layer.addChild(this.typing_ui);

  this.grey_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 140, fill: 0xDDDDDD, letterSpacing: 8, align: "left"});
  this.grey_text.anchor.set(0,0.5);
  this.grey_text.position.set(25, 93);
  this.typing_ui.addChild(this.grey_text);

  this.typing_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 140, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
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
  this.display_action_backing.position.set(-180, this.height - 16);
  this.display_action_backing.filters = [this.dropshadow_filter];
  this.display_ui.addChild(this.display_action_backing);

  this.action_glyphs = {};
 
  this.action_glyphs["FEED"] = new PIXI.Sprite(PIXI.Texture.from("Art/Food/food.png"));
  this.action_glyphs["FEED"].anchor.set(0.5,0.75);
  this.action_glyphs["FEED"].position.set(70, this.height - 145);
  this.action_glyphs["FEED"].scale.set(0.75, 0.75);
  this.action_glyphs["FEED"].visible = false;
  this.display_ui.addChild(this.action_glyphs["FEED"]);

  this.action_glyphs["POOP"] = new PIXI.Sprite(PIXI.Texture.from("Art/poop.png"));
  this.action_glyphs["POOP"].anchor.set(0.5,0.75);
  this.action_glyphs["POOP"].position.set(70, this.height - 55);
  this.action_glyphs["POOP"].scale.set(0.75, 0.75)
  this.action_glyphs["POOP"].visible = false;
  this.display_ui.addChild(this.action_glyphs["POOP"]);

  this.action_glyphs["RIDE"] = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/cart_icon.png"));
  this.action_glyphs["RIDE"].anchor.set(0.5,0.75);
  this.action_glyphs["RIDE"].position.set(70, this.height - 50);
  this.action_glyphs["RIDE"].scale.set(0.75, 0.75);
  this.action_glyphs["RIDE"].visible = false;
  this.display_ui.addChild(this.action_glyphs["RIDE"]);
  this.action_glyphs["RIDE"].visible = false;

  this.action_glyphs["MAP"] = new PIXI.Sprite(PIXI.Texture.from("Art/map_icon.png"));
  this.action_glyphs["MAP"].anchor.set(0.5,0.75);
  this.action_glyphs["MAP"].position.set(70, this.height - 50);
  this.action_glyphs["MAP"].scale.set(0.75, 0.75);
  this.action_glyphs["MAP"].visible = false;
  this.display_ui.addChild(this.action_glyphs["MAP"]);
  this.action_glyphs["MAP"].visible = false;

  this.action_glyphs["LET GO"] = new PIXI.Sprite(PIXI.Texture.from("Art/balloon_icon.png"));
  this.action_glyphs["LET GO"].anchor.set(0.5,0.75);
  this.action_glyphs["LET GO"].position.set(70, this.height - 50);
  this.action_glyphs["LET GO"].scale.set(0.75, 0.75);
  this.action_glyphs["LET GO"].tint = 0xec4e4e;
  this.action_glyphs["LET GO"].visible = false;
  this.display_ui.addChild(this.action_glyphs["LET GO"]);
  this.action_glyphs["LET GO"].visible = false;

  this.action_glyphs["THROW"] = new PIXI.Sprite(PIXI.Texture.from("Art/throw_icon.png"));
  this.action_glyphs["THROW"].anchor.set(0.5,0.75);
  this.action_glyphs["THROW"].position.set(70, this.height - 50);
  this.action_glyphs["THROW"].scale.set(0.75, 0.75);
  this.action_glyphs["THROW"].visible = false;
  this.display_ui.addChild(this.action_glyphs["THROW"]);
  this.action_glyphs["THROW"].visible = false;

  this.action_glyphs["COLOR"] = new PIXI.Sprite(PIXI.Texture.from("Art/color_icon.png"));
  this.action_glyphs["COLOR"].anchor.set(0.5,0.75);
  this.action_glyphs["COLOR"].position.set(70, this.height - 50);
  this.action_glyphs["COLOR"].scale.set(0.75, 0.75);
  this.action_glyphs["COLOR"].visible = false;
  this.display_ui.addChild(this.action_glyphs["COLOR"]);
  this.action_glyphs["COLOR"].visible = false;

  // action glyph positions: 905 - 90 per item


  this.action_grey_text = [];
  this.action_typing_text = [];

  for (let i = 0; i < 4; i++) {
    let grey_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 80, fill: 0xDDDDDD, letterSpacing: 5, align: "left"});
    grey_text.anchor.set(0,1);
    grey_text.position.set(130, this.height - 15 - 90 * i);
    this.display_ui.addChild(grey_text);
    this.action_grey_text.push(grey_text);

    let typing_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 80, fill: 0xFFFFFF, letterSpacing: 5, align: "left"});
    typing_text.tint = 0x000000;
    typing_text.anchor.set(0,1);
    typing_text.position.set(130, this.height - 15 - 90 * i);
    this.display_ui.addChild(typing_text);
    this.action_typing_text.push(typing_text);
  }

  this.display_backing = new PIXI.Sprite(PIXI.Texture.from("Art/wood.png"));
  this.display_backing.anchor.set(0, 1);
  this.display_backing.scale.set(0.8, 0.8);
  this.display_backing.position.set(this.width - 400, this.height - 30);
  this.display_backing.filters = [this.dropshadow_filter];
  this.display_ui.addChild(this.display_backing);

  this.display_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 140, fill: 0xFFFFFF, letterSpacing: 8, align: "right"});
  this.display_text.tint = 0x000000;
  this.display_text.anchor.set(1,0.5);
  this.display_text.position.set(this.width - 25, this.height - 90);
  this.display_ui.addChild(this.display_text);

  this.display_ui.visible = false;

  this.map_border = new PIXI.Sprite(PIXI.Texture.from("Art/map_border.png"));
  this.map_border.anchor.set(0,0);
  this.map_border.position.set(0,0);
  this.map_border.width = this.width;
  this.map_border.height = this.height;
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

  this.animal_count_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 60, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.animal_count_text.anchor.set(1,0.5);
  this.animal_count_text.position.set(this.width - 110, 65);
  this.animal_count_text.alpha = 0.0;
  this.animal_count_text.visible = false;
  this.animal_count_text.tint = 0x000000;
  screen.addChild(this.animal_count_text);

  this.dollar_bucks_text = new PIXI.Text("0", {fontFamily: default_font, fontSize: 60, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.dollar_bucks_text.anchor.set(1,0.5);
  this.dollar_bucks_text.position.set(this.width - 110, 150);
  this.dollar_bucks_text.alpha = 0.0;
  this.dollar_bucks_text.visible = false;
  this.dollar_bucks_text.tint = 0x000000;
  screen.addChild(this.dollar_bucks_text);

  this.dollar_bucks_glyph = new PIXI.Text("$", {fontFamily: default_font, fontSize: 60, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.dollar_bucks_glyph.anchor.set(1,0.5);
  this.dollar_bucks_glyph.position.set(this.width - 50, 150);
  this.dollar_bucks_glyph.alpha = 0.0;
  this.dollar_bucks_glyph.visible = false;
  screen.addChild(this.dollar_bucks_glyph);

  this.escape_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/close_button.png"));
  this.escape_glyph.anchor.set(1,1);
  this.escape_glyph.position.set(this.width - 20, this.height - 20);
  this.escape_glyph.scale.set(0.6, 0.6)
  this.escape_glyph.tint = 0x000000;
  this.escape_glyph.alpha = 0.6;
  this.escape_glyph.visible = false;
  screen.addChild(this.escape_glyph);

  this.escape_text = new PIXI.Text("Enter | Escape | Space", {fontFamily: default_font, fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
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
  this.sound_slider_left = 689;
  this.music_slider_left = 324;
  this.menu_selection_number = 0;

  this.main_menu_background = new PIXI.Sprite(PIXI.Texture.from("Art/main_menu_background.png"));
  this.main_menu_background.anchor.set(0,0);
  this.main_menu_background.position.set(0, 0);
  this.menu_layer.addChild(this.main_menu_background);

  this.menu_selections[0] = new PIXI.Text("MUSIC", {fontFamily: default_font, fontSize: 56, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.menu_selections[0].tint = 0x000000;
  this.menu_selections[0].anchor.set(0,0);
  this.menu_selections[0].position.set(169, 141);
  this.menu_layer.addChild(this.menu_selections[0]);

  this.music_slider = new PIXI.Sprite(PIXI.Texture.from("Art/slider.png"));
  this.music_slider.anchor.set(0,0.5);
  this.music_slider.position.set(this.music_slider_left,164);
  this.menu_layer.addChild(this.music_slider);

  this.music_slider_bar = new PIXI.Sprite(PIXI.Texture.from("Art/slider_bar.png"));
  this.music_slider_bar.anchor.set(0,0.5);
  this.music_slider_bar.position.set(this.music_slider_left + 150 * music_volume, 164);
  this.menu_layer.addChild(this.music_slider_bar);
  
  this.menu_selections[1] = new PIXI.Text("SOUND", {fontFamily: default_font, fontSize: 56, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.menu_selections[1].tint = 0x000000;
  this.menu_selections[1].anchor.set(0,0);
  this.menu_selections[1].position.set(528, 250);
  this.menu_layer.addChild(this.menu_selections[1]);

  this.sound_slider_left = 689;

  this.sound_slider = new PIXI.Sprite(PIXI.Texture.from("Art/slider.png"));
  this.sound_slider.anchor.set(0,0.5);
  this.sound_slider.position.set(this.sound_slider_left, 273);
  this.menu_layer.addChild(this.sound_slider);

  this.sound_slider_bar = new PIXI.Sprite(PIXI.Texture.from("Art/slider_bar.png"));
  this.sound_slider_bar.anchor.set(0,0.5);
  this.sound_slider_bar.position.set(this.sound_slider_left + 150 * sound_volume, 273);
  this.menu_layer.addChild(this.sound_slider_bar);

  this.menu_selections[2] = new PIXI.Text("NEW SMALL ZOO", {fontFamily: default_font, fontSize: 56, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.menu_selections[2].tint = 0x000000;
  this.menu_selections[2].anchor.set(0,0);
  this.menu_selections[2].position.set(152, 396);
  this.menu_layer.addChild(this.menu_selections[2]);

  this.menu_selections[3] = new PIXI.Text("NEW LARGE ZOO", {fontFamily: default_font, fontSize: 56, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.menu_selections[3].tint = 0x000000;
  this.menu_selections[3].anchor.set(0,0);
  this.menu_selections[3].position.set(477, 539);
  this.menu_layer.addChild(this.menu_selections[3]);

  this.menu_selections[4] = new PIXI.Text("WINDOWED", {fontFamily: default_font, fontSize: 36, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.menu_selections[4].tint = 0x000000;
  this.menu_selections[4].anchor.set(0,0);
  this.menu_selections[4].position.set(117, 709);
  this.menu_layer.addChild(this.menu_selections[4]);

  let wfs_bar = new PIXI.Text("|", {fontFamily: default_font, fontSize: 36, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  wfs_bar.tint = 0x000000;
  wfs_bar.anchor.set(0,0);
  wfs_bar.position.set(277, 707);
  this.menu_layer.addChild(wfs_bar);

  this.wfs_alt = new PIXI.Text("FULL SCREEN", {fontFamily: default_font, fontSize: 36, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.wfs_alt.tint = 0x000000;
  this.wfs_alt.anchor.set(0,0);
  this.wfs_alt.position.set(309, 709);
  this.menu_layer.addChild(this.wfs_alt);

  this.changeMenuSelection(0);


  // 295,90
  // 654,199
  // 272,349
  // 601,495
  // 237,658 + 410 + 435

  this.menu_escape_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/close_button.png"));
  this.menu_escape_glyph.anchor.set(0,1);
  this.menu_escape_glyph.position.set(20, this.height - 20);
  this.menu_escape_glyph.scale.set(0.6, 0.6)
  this.menu_escape_glyph.tint = 0x000000;
  this.menu_escape_glyph.alpha = 0.6;
  this.menu_layer.addChild(this.menu_escape_glyph);

  this.menu_escape_text = new PIXI.Text("Escape", {fontFamily: default_font, fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.menu_escape_text.anchor.set(0,1);
  this.menu_escape_text.position.set(100, this.height - 32);
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

  this.dollar_bucks = 6;

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
        this.music_slider_bar.position.set(this.music_slider_left + 150 * music_volume, 164);
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
        this.music_slider_bar.position.set(this.music_slider_left + 150 * music_volume, 164);
      }
    }

    if (this.menu_selection_number == 1 && key == "ArrowLeft") {
      if (sound_volume >= 0.1) {
        sound_volume -= 0.1;
        if (sound_volume < 0.001) sound_volume = 0;
        sound_volume = Math.round(sound_volume * 10) / 10;
        localStorage.setItem("sound_volume", sound_volume);
        this.soundEffect("pop");
        this.sound_slider_bar.position.set(this.sound_slider_left + 150 * sound_volume, 273);
      }
    }

    if (this.menu_selection_number == 1 && key == "ArrowRight") {
      if (sound_volume <= 0.9) {
        sound_volume += 0.1;
        if (sound_volume > 0.999) sound_volume = 1;
        sound_volume = Math.round(sound_volume * 10) / 10;
        localStorage.setItem("sound_volume", sound_volume);
        this.soundEffect("pop");
        this.sound_slider_bar.position.set(this.sound_slider_left + 150 * sound_volume, 273);
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

  if (this.zoo_mode == "ferris_wheel" && this.ferris_wheel.moving == true) {

    if (key === "Escape") {
      this.ferris_wheel.ride_number += 1;
      this.ferris_wheel.stopMoving();
      this.fadeToBlack(1000);

      delay(function() {
        self.ferris_wheel.reset();
        self.ghost.visible = true;
        self.updateGhost();
      }, 900)

      delay(function() {
          for (let i = 0; i < self.player.stuffies.length; i++) {
            self.decorations.push(self.player.stuffies[i]);
          }
          self.decorations.push(self.player);
          self.sortLayer(self.map.decoration_layer, self.decorations);

          self.fadeFromBlack(1000);

          self.zoo_mode = "active";

          self.checkPenProximity(self.player.x, self.player.y, self.player.direction);
      }, 2400);
    }

    if (this.display_typing_allowed && this.display_ui.visible) {
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
        self.dollar_bucks += 2;
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
      this.typing_text.text = this.typing_text.text.slice(0,-1);
    }
    let l = this.typing_text.text.slice(-1,this.typing_text.text.length);
    let t = new PIXI.Text(l, {fontFamily: default_font, fontSize: 140, fill: 0x000000, letterSpacing: 3, align: "left"});
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

  if (this.action_typing_text[this.action_default_slot].text.length  == 0) {
    // only perform this prefix check if you're not using the existing field.
    for (let i = 0; i < this.action_list.length; i++) {
      let word = this.action_typing_text[i].text + letter;
      if (this.action_list[i].indexOf(word) == 0) {
        prefix = true;
        this.action_default_slot = i;
      }
    }
  }

  let text_box = this.action_typing_text[this.action_default_slot];
  let grey_text_box = this.action_grey_text[this.action_default_slot];

  if (prefix) {
    for (let i = 0; i < this.action_list.length; i++) {
      if (i == this.action_default_slot) {
        if (text_box.text.length < grey_text_box.text.length) {
          if (grey_text_box.text[text_box.text.length] == " ") {
            text_box.text += " ";
          }

          text_box.text += letter;
        }
      } else {
        this.action_typing_text[i].text = "";
      }
    }
  } else {
    if (text_box.text.length < grey_text_box.text.length) {
      if (grey_text_box.text[text_box.text.length] == " ") {
        text_box.text += " ";
      }

      text_box.text += letter;
    }
  }


  if (text_box.text == grey_text_box.text) {
    if (text_box.text == "RIDE") {
      this.rideFerrisWheel();
    } else if (text_box.text == "FEED") {
      this.feedAnimal();
    } else if (text_box.text == "POOP") {
      this.poopAnimal();
    } else if (text_box.text == "MAP") {
      this.activateMap();
    } else if (text_box.text == "LET GO") {
      this.soundEffect("success");
    
      this.display_typing_allowed = false;

      delay(function() {
        self.action_typing_text[self.action_default_slot].text = "";
        self.display_typing_allowed = true;
        self.changeDisplayText("FERRIS_WHEEL_OPTIONS", null);
      }, 300);

      flicker(text_box, 300, 0x000000, 0xFFFFFF);


      this.ferris_wheel.releaseBalloon();
    } else if (text_box.text == "THROW") {
      this.throwHotDog();
    } else if (text_box.text == "COLOR") {

      this.soundEffect("success");
    
      this.display_typing_allowed = false;

      delay(function() {
        self.action_typing_text[self.action_default_slot].text = "";
        self.display_typing_allowed = true;
      }, 300);

      flicker(text_box, 300, 0x000000, 0xFFFFFF);

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

  if (text_box.text[text_box.text.length - 1] === " ") {
    text_box.text = text_box.text.slice(0, -1);
  }

  let l = text_box.text.slice(-1, text_box.text.length);
  let t = new PIXI.Text(l, {fontFamily: default_font, fontSize: 80, fill: 0x000000, letterSpacing: 3, align: "left"});
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
  } else if (this.thing_to_type == "GIFT_SHOP") {
    this.typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/icon.png"));
  } else if (!(this.thing_to_type in animated_animals) && !(animals[this.thing_to_type].movement == "arboreal")) {
    let thing = this.thing_to_type.toLowerCase();
    if (animals[this.thing_to_type].variations > 1) thing += "_1";
    this.typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/" + thing + ".png"));
  } else {
    let thing = this.thing_to_type.toLowerCase();
    if (animals[this.thing_to_type].variations > 1) thing += "_1";
    var sheet = PIXI.Loader.shared.resources["Art/Animals/" + thing + ".json"].spritesheet;
    this.typing_picture = new PIXI.AnimatedSprite(sheet.animations[thing]);
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
  this.display_backing.position.set(this.width - (measure.width + 50), this.height - 30)
  this.display_text.text = this.thing_to_display.replace("_", " ");

  if (word_list.length == 0) {
    if (this.thing_to_display == "MAP") {
      word_list = ["MAP"];
    } else if (this.thing_to_display == "FERRIS_WHEEL") {
      word_list = ["COLOR", "RIDE"];
    } else if (this.thing_to_display == "CAFE") {
      word_list = [];
    } else if (this.thing_to_display == "GIFT SHOP") {
      word_list = [];
    } else if (this.thing_to_display == "FERRIS_WHEEL_OPTIONS") {
      if (this.ferris_wheel.balloons.length > 0) {
        word_list = ["LET GO", "THROW"];
      } else {
        word_list = ["THROW"];
      }
      
    } else {
      word_list = ["POOP", "FEED", "MAP"];
    }
  }

  //if (word_list.length > 1 || word_list[0] != "MAP") {
  if (this.thing_to_display != "MAP" && this.thing_to_display != "FERRIS_WHEEL_OPTIONS") {
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
    this.action_glyphs[word_list[i]].y = this.height - 55 - 90 * i;
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
      //if (j > 0) pen.animal_objects[j].visible = false;
      if (j > 0) pen.animal_objects[j].hide();
    }
  }
  for (let j = 0; j < pen.decoration_objects.length; j++) {
    if (pen.decoration_objects[j].hide == null) {
      pen.decoration_objects[j].visible = false;
    } else {
      pen.decoration_objects[j].hide();
    }
  }
  if (pen.special == "FERRIS_WHEEL") {
    for (let j = 0; j < pen.special_object.all_objects.length; j++) {
      pen.special_object.all_objects[j].tint = pen.special_object.all_objects[j].grey_color;
    }
  }
  if (pen.special == "CAFE" || pen.special == "GIFT_SHOP") {
    pen.special_object.grey();
  }
  if (pen.special != "RIVER" && pen.land_object != null) {
    // for (let j = 0; j < pen.land_object.children.length; j++) {
    //   let land = pen.land_object.children[j];
    //   land.visible = false;
    // }
    pen.land_object.hide();
  }

  if (pen.mini_sprite != null) pen.mini_sprite.alpha = 0.5;
}


Game.prototype.ungrey = function(pen) {

  pen.land_object.filters = [];

  pen.state = "ungrey";
  if (pen.animal_objects != null) {
    for (let j = 0; j < pen.animal_objects.length; j++) {
      pen.animal_objects[j].alpha  = 1;
      //pen.animal_objects[j].visible = true;
      pen.animal_objects[j].show();
    }
  }
  for (let j = 0; j < pen.decoration_objects.length; j++) {
    if (pen.decoration_objects[j].hide == null) {
      pen.decoration_objects[j].visible = true;
    } else {
      pen.decoration_objects[j].show();
    }
  }
  if (pen.special == "FERRIS_WHEEL") {
    for (let j = 0; j < pen.special_object.all_objects.length; j++) {
      pen.special_object.all_objects[j].tint = pen.special_object.all_objects[j].true_color;
    }
  }
  if (pen.special == "CAFE" || pen.special == "GIFT_SHOP") {
    pen.special_object.ungrey();
  }
  if (pen.special != "RIVER" && pen.land_object != null) {
    // for (let j = 0; j < pen.land_object.children.length; j++) {
    //   let land = pen.land_object.children[j];
    //   land.visible = true;
    // }
    pen.land_object.show();
  }

  if (pen.mini_sprite != null) pen.mini_sprite.alpha = 1.0;
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
        // if (j > 0) pen.animal_objects[j].visible = false;
        if (j > 0) pen.animal_objects[j].hide();
        pen.animal_objects[j].scale.set(3,3);
      }
    }
    for (let j = 0; j < pen.decoration_objects.length; j++) {
      if (pen.decoration_objects[j].hide == null) {
        pen.decoration_objects[j].visible = false;
      } else {
        pen.decoration_objects[j].hide();
      }
    }
    // if (pen.land_object != null) {
    //   pen.land_object.visible = false;
    // }
    if (pen.land_object != null) {
      // pen.land_object.visible = true;
      //pen.land_object.hide();
    }
  }
  for (let i = 0; i < this.npcs.length; i++) {
    this.npcs[i].visible = false;
  }
  for (let i = 0; i < this.decorations.length; i++) {
    if (this.decorations[i].type == "tree" || this.decorations[i].type == "fence") {
      if (this.decorations[i].hide == null) {
        this.decorations[i].visible = false;
      } else {
        this.decorations[i].hide();
      }
    }
  }
  this.player.scale.set(3 * 0.72,3 * 0.72);
  this.ghost.visible = false;
  this.player.red_circle.visible = true;
  this.map_border.visible = true;

  // gonna have to change this when map is typed
  if (this.typing_allowed) this.hideTypingText();
  this.hideDisplayText();

  this.escape_glyph.visible = true;
  this.escape_text.visible = true;

  this.map.minimap_layer.visible = true;

  this.map_visible = true;

  this.updateEnts();
  this.doCulling();

  this.map.scale.set(0.2, 0.2);
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
          // pen.animal_objects[j].visible = true;
          pen.animal_objects[j].show();
        }
        pen.animal_objects[j].scale.set(1,1);
      }
    }
    if (pen.state == "ungrey") {
      for (let j = 0; j < pen.decoration_objects.length; j++) {
        if (pen.decoration_objects[j].hide == null) {
          pen.decoration_objects[j].visible = true;
        } else {
          pen.decoration_objects[j].show();
        }
      }
    }
    if (pen.land_object != null) {
      // pen.land_object.visible = true;
      //pen.land_object.show();
    }
  }
  for (let i = 0; i < this.npcs.length; i++) {
    this.npcs[i].visible = true;
  }
  for (let i = 0; i < this.decorations.length; i++) {
    if (this.decorations[i].type == "tree" || this.decorations[i].type == "fence") {
      if (this.decorations[i].hide == null) {
        this.decorations[i].visible = true;
      } else {
        this.decorations[i].show();
      }
    }
  }
  this.player.scale.set(0.72,0.72);
  this.ghost.visible = true;
  this.player.red_circle.visible = false;
  this.map_border.visible = false;

  this.map.scale.set(1, 1);

  this.map.minimap_layer.visible = false;

  this.map_visible = false;

  this.escape_glyph.visible = false;
  this.escape_text.visible = false;

  this.doCulling();
  this.updateEnts();

  if (this.map_visible == false) {
    this.checkPenProximity(this.player.x, this.player.y, this.player.direction);
  }
}


Game.prototype.throwHotDog = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.soundEffect("throw");
    
  this.display_typing_allowed = false;

  flicker(this.action_typing_text[this.action_default_slot], 300, 0x000000, 0xFFFFFF);

  delay(function() {
    self.action_typing_text[self.action_default_slot].text = "";
    self.display_typing_allowed = true;
  }, 300);

  delay(function() {
    

    let food = new PIXI.Sprite(PIXI.Texture.from("Art/throw_icon.png"));
    food.scale.set(1,1);
    food.position.set(self.player.x, self.player.y - 40);
    food.anchor.set(0.5,0.75)
    
    food.vx = (self.player.direction == "left" ? -1 : 1) * (30 + 20 * Math.random());
    food.vy = -7 - 10 * Math.random();
    food.floor = food.y + 1500;
    self.ferris_wheel.cart_layer.addChild(food);
    self.freefalling.push(food);
  }, 50);
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
      if (self.decorations[i].character_name != "brown_bear"
        && (self.decorations[i].character_name == null || !self.decorations[i].character_name.includes("stuffed"))) {
        new_decorations.push(self.decorations[i]);
      }
    }
    self.decorations = new_decorations;
    self.sortLayer(self.map.decoration_layer, self.decorations);

    self.ferris_wheel.addPlayer(self.player);
    self.ghost.visible = false;
  }, 1400)

  delay(function() {
    self.fadeFromBlack(1000);
  }, 1800);

  delay(function() {
    self.ferris_wheel.startMoving();
  }, 2800);

  delay(function() {
    // self.ferris_wheel.startMoving();
    self.changeDisplayText("FERRIS_WHEEL_OPTIONS", null);
  }, 3300);

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
      self.ghost.visible = true;
      self.updateGhost();
    }
  }, 64200)

  delay(function() {
    if (self.ferris_wheel.ride_number == ride_number) {
      for (let i = 0; i < self.player.stuffies.length; i++) {
        self.decorations.push(self.player.stuffies[i]);
      }
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
  this.dollar_bucks_text.visible = true;
  new TWEEN.Tween(this.animal_count_text)
    .to({alpha: 0.6})
    .duration(1000)
    .start()
    .onUpdate(function() {
    }); 
  new TWEEN.Tween(this.dollar_bucks_text)
    .to({alpha: 0.6})
    .duration(1000)
    .start()
    .onUpdate(function() {
    }); 


  this.animal_count_glyph.alpha = 0.01;
  this.animal_count_glyph.visible = true;
  this.dollar_bucks_glyph.visible = true;
  new TWEEN.Tween(this.animal_count_glyph)
    .to({alpha: 0.6})
    .duration(1000)
    .start()
    .onUpdate(function() {
    });
  new TWEEN.Tween(this.dollar_bucks_glyph)
    .to({alpha: 0.6})
    .duration(1000)
    .start()
    .onUpdate(function() {
    });
}


Game.prototype.updateAnimalCount = function() {
  let old_animal_count_text = this.animal_count_text.text;
  this.animal_count_text.text = this.animals_obtained + " / " + this.animals_available;
  if (old_animal_count_text != this.animal_count_text.text) flicker(this.animal_count_text, 300, 0x000000, 0xFFFFFF);

  let old_dollar_bucks_text = this.dollar_bucks_text.text;
  this.dollar_bucks_text.text = this.dollar_bucks;
  if (old_dollar_bucks_text != this.dollar_bucks_text.text) flicker(this.dollar_bucks_text, 300, 0x000000, 0xFFFFFF);
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
    // if (layer_object_list[i].character_name != null && layer_object_list[i].character_name == "brown_bear") console.log("uep");
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


Game.prototype.balloonsRise = function(fractional) {
  var self = this;
  var screen = this.screens[this.current_screen];

  for (let i = 0; i < this.free_balloons.length; i++) {
    let balloon = this.free_balloons[i];

    balloon.update();

    balloon.reposition(balloon.x + (1.8 + 0.4 * Math.random()) * fractional, balloon.y - (2.2 + 0.4 * Math.random()) * fractional);
    if (distance(balloon.top_x, balloon.top_y, 0, 0) < 200) {
      balloon.top_x += 0.25 * fractional;
      balloon.original_x += 0.25 * fractional;
      balloon.top_y -= 0.35 * fractional;
      balloon.original_y -= 0.35 * fractional;
    }
    
    if (balloon.ceiling != null && balloon.position.y < balloon.ceiling) {
      if (balloon.parent != null) {
        balloon.parent.removeChild(balloon);
      }
      balloon.status = "dead";
    }
  }

  let new_free_balloons = [];
  for (let i = 0; i < this.free_balloons.length; i++) {
    let balloon = this.free_balloons[i];
    if (balloon.status != "dead") {
      new_free_balloons.push(balloon);
    }
  }
  this.free_balloons = new_free_balloons;
}


Game.prototype.updateGhost = function() {
  if (this.player.direction != null) {
    this.ghost.direction = this.player.direction;
    this.ghost.updateDirection();
    this.ghost.character_sprite[this.ghost.direction].gotoAndStop(
      this.player.character_sprite[this.player.direction].currentFrame
    );
  }
}


Game.prototype.updatePlayer = function() {
  var self = this;
  var keymap = this.keymap;
  var player = this.player;

  player.updateBalloons();

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

    if (player.direction != null) {
      player.move();
      this.updateGhost();

      this.updateEnts();

      if (player.direction != null && this.map_visible == false) {
        this.checkPenProximity(player.x, player.y, player.direction);
      }

      if (this.cafe != null) {
        if (Math.abs(player.x - this.cafe.x) <= 80 && player.y < this.cafe.y && player.y > this.cafe.y - 50) {
          this.player.visible = false;
          this.ghost.visible = false;
          this.zoo_mode = "fading";
          // this.initializeScreen("cafe");

          this.fadeScreens("zoo", "cafe", true);
        }
      }

      if (this.gift_shop != null) {
        if (Math.abs(player.x - this.gift_shop.x) <= 80 && player.y < this.gift_shop.y && player.y > this.gift_shop.y - 50) {
          this.player.visible = false;
          this.player.history = [];
          this.ghost.visible = false;
          this.zoo_mode = "fading";
          this.gift_shop_mode = "active";
          this.gift_shop_dollar_bucks_text.text = this.dollar_bucks;
          this.updatePriceTags();
          this.fadeScreens("zoo", "gift_shop", true);
        }
      }
    }
  } else if (player.direction != null) {
    player.updateDirection();
    this.updateGhost();
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
    if (this.zoo_pens[i].special != "RIVER" && pointInsidePolygon([tx, ty], this.zoo_pens[i].polygon)) {
      return false;
    }
  }

  // check for path crossings 

  if (this.river_polygon != null && pointInsidePolygon([tx, ty], this.river_polygon)) {
    crossing = false;
    for (let k = 0; k < this.river_tiles.length; k++) {
      let cell = this.zoo_squares[this.river_tiles[k][0]][this.river_tiles[k][1]];
      // let w_line = this.river_tiles[k][0] * square_width;
      let w_line = this.river_tiles[k][0] * square_width;
      if (cell.w_edge == true && tx > w_line - 100 && tx <= w_line + 100) {
        crossing = true; 
      }
    }

    if (crossing == false) return crossing;
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
        this.changeTypingText(found_pen.animal, found_pen);
        if (this.display_ui.visible == true) {
          this.hideDisplayText();
        }
      } else if (found_pen.animal != this.thing_to_display && found_pen.state == "ungrey") {
        this.changeDisplayText(found_pen.animal, found_pen);
        if (this.typing_ui.visible == true) {
          this.hideTypingText();
        }
      }
    } else if (found_pen.special_object != null) {
      if (found_pen.special != this.thing_to_type && found_pen.state == "grey") {
        this.changeTypingText(found_pen.special, found_pen);
        if (this.display_ui.visible == true) {
          this.hideDisplayText();
        }
      } else if (found_pen.special != this.thing_to_display && found_pen.state == "ungrey") {
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


ent_count = 0;
Game.prototype.updateEnts = function() {
  if (this.ents.length == 0) return;
  if (this.player == null) return;
  for (let k = 0; k < total_ents; k++) {
    this.ents[k].visible = false;
  }
  if (this.map_visible == false) {
    ent_count = 0;
    for (let e = 0; e < this.ent_positions.length; e++) {
      let pos = this.ent_positions[e];

      if(Math.abs(this.player.x - pos[0]) < 900 && Math.abs(this.player.y - pos[1]) < 700) {
        if (ent_count < total_ents) {
          this.ents[ent_count].visible = true;
          this.ents[ent_count].position.set(pos[0], pos[1]);
          this.ents[ent_count].tree.gotoAndStop(pos[2] - 1);
          ent_count += 1;
        }
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

let do_culling = true;
Game.prototype.doCulling = function() {
  if (do_culling) {
    let x = this.player.x;
    let y = this.player.y;

    if (this.zoo_mode == "ferris_wheel" && this.ferris_wheel.player != null) {
      x = this.ferris_wheel.x + this.ferris_wheel.player.x;
      y = this.ferris_wheel.y + this.ferris_wheel.player.y;
    }

    for (let i = 0; i < this.decorations.length; i++) {
      if (this.decorations[i].computeCulling != null) {
        this.decorations[i].computeCulling(x,y);
      }
    }

    for (let i = 0; i < this.zoo_pens.length; i++) {
      let pen = this.zoo_pens[i];
      
      if (pen.land_object != null) {
        // then go back and fix land culling to be on the centers
        // then go back and fix hidemap / showmap to hide and show the right stuff
        // then go back and fix culling to use the map toggle as part of calculation
        if (pen.land_object.computeCulling != null) {
          pen.land_object.computeCulling(x,y);
        }
      }
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

  if (this.zoo_mode == "active" || this.zoo_mode == "fading" || this.zoo_mode == "loading") {
    this.map.position.set(this.width/2 - this.player.x * this.map.scale.x, this.height/2 - this.player.y * this.map.scale.y);
    this.ghost.position.set(this.width/2, this.height/2);
  } else if (this.zoo_mode == "pre_ferris_wheel") {
    this.map.position.set(this.width/2 - this.player.x * this.map.scale.x, this.height/2 - this.player.y * this.map.scale.y);
  } else if (this.zoo_mode == "ferris_wheel") {
    let x = this.ferris_wheel.x + this.player.x;
    let y = this.ferris_wheel.y + this.player.y;
    this.map.position.set(this.width/2 - x * this.map.scale.x, this.height/2 - y * this.map.scale.y);
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

  this.doCulling();

  let new_decorations = [];
  for (let i = 0; i < this.decorations.length; i++) {
    if (!(this.decorations[i].status == "dead")) {
      new_decorations.push(this.decorations[i])
    } else {
      // console.log("dead");
    }
  }
  this.decorations = new_decorations;
  this.sortLayer(this.map.decoration_layer, this.decorations);

  this.shakeThings();
  this.freeeeeFreeeeeFalling(fractional);
  this.balloonsRise(fractional);
  this.poopsAndFoods(fractional);

}