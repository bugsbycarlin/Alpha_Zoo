

// screen_zoo_core.js contains core zoo screen initialization, UI, and menu systems.
//
//
// screen_zoo.js contains basically the entire core game scene.
// This is where we create the zoo and also where we manage everything
// about the core zoo game: walking around, building enclosures,
// interacting with existing enclosures, and updating all the living things.
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

let music_slider_top = 153;
let music_slider_left = 265;
let sound_slider_left = 486;
let sound_slider_top = 256;
let voice_switch_left = 138;
let voice_switch_top = 357;

Game.prototype.resetZooScreen = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.zoo_mode = "loading"; // loading, active, ferris_wheel, fading, menu

  // Make the map. These methods are in land.js.

  // Check if map persistence is enabled and if save exists
  let has_save = window.hasZooSave();  // This checks both the setting and file existence

  if (has_save) {
    console.log("Loading saved zoo (persistMap enabled)");
    let save_data = window.loadZoo();

    // Validate save data has all required fields
    let is_valid = save_data &&
                   save_data.version === 1 &&
                   save_data.zoo &&
                   save_data.zoo.pens &&
                   save_data.zoo.squares &&
                   save_data.zoo.vertices;

    if (is_valid) {
      // Initialize map container
      this.initializeMap();

      // Restore from save instead of generating
      this.deserializeZooState(save_data);
    } else {
      // Save file corrupted or invalid version, fall back to generation
      console.log("Save file invalid, generating new zoo");
      let valid = false;
      for (let i = 0; i < 30; i++) {
        if (!valid) {
          console.log("rolling a map");
          this.initializeMap();
          this.makeMapGroups();
          this.makeMapPath();
          this.makeMapPens();
          valid = this.checkMapValidity();
        }
      }
      this.loaded_from_save = false;
    }
  } else {
    // Either persistMap is disabled or no save exists - generate new
    console.log("Generating new zoo (persistMap disabled or no save)");
    // Original procedural generation
    let valid = false;
    for (let i = 0; i < 30; i++) {
      if (!valid) {
        console.log("rolling a map");
        this.initializeMap();
        this.makeMapGroups();
        this.makeMapPath();
        this.makeMapPens();
        valid = this.checkMapValidity();
      }
    }
    this.loaded_from_save = false;
  }
  

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

  let selected_character = localStorage.getItem("selected_character") || "brown_bear";
  this.ghost = this.player = this.makeCharacter(`${selected_character}_ghost`);
  // localStorage.getItem("selected_character")
  screen.addChild(this.ghost);
  this.ghost.position.set(this.width / 2, this.height / 2);

  // this.makeLoadingScreen();
  this.black.alpha = 1;
  this.black.visible = true;
  pixi.stage.addChild(this.black);

  // Make the ui layer
  this.makeUI();
  this.makeMenu();
  this.makeMarimbaScreen();

  // Populate the map with things. These methods are in land.js.
  // Skip pen designation/swapping if loaded from save (animals/buildings already assigned)
  if (!this.loaded_from_save) {
    this.designatePens();
    this.swapPens();
  }
  this.prepPondsAndTerraces();
  this.drawMap();
  this.playerAndBoundaries();
  // populate zoo
  this.addAnimalsAndDecorations();
  this.addTrains();
  
  this.sortLayer(this.map.decoration_layer, this.decorations);

  // Check if we should persist pen states across sessions
  let persist_pen_states = window.getPersistPenStates();

  // Only grey all pens if generating new map OR if persistPenStates is disabled
  if (!this.loaded_from_save || !persist_pen_states) {
    this.greyAllActivePens();
  } else {
    // Apply the saved grey/ungrey state to visual elements (only if persistPenStates is enabled)
    this.applyLoadedPenStates();
  }
  // this.ungreyAll();

  this.initializeScreen("gift_shop");
  this.initializeScreen("cafe");
  this.initializeScreen("marimba");

  this.start_time = this.markTime();
  this.first_move = false;

  setMusic("background_music");

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

  this.action_glyphs["GO"] = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/icon.png"));
  this.action_glyphs["GO"].anchor.set(0.5,0.67);
  this.action_glyphs["GO"].position.set(70, this.height);
  this.action_glyphs["GO"].scale.set(0.5, 0.5);
  this.action_glyphs["GO"].visible = false;
  this.display_ui.addChild(this.action_glyphs["GO"]);
  this.action_glyphs["GO"].visible = false;

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

  this.action_glyphs["PLAY"] = new PIXI.Sprite(PIXI.Texture.from("Art/Marimba/marimba_icon.png"));
  this.action_glyphs["PLAY"].anchor.set(0.5,0.75);
  this.action_glyphs["PLAY"].position.set(70, this.height - 50);
  this.action_glyphs["PLAY"].scale.set(0.75, 0.75);
  this.action_glyphs["PLAY"].visible = false;
  this.display_ui.addChild(this.action_glyphs["PLAY"]);
  this.action_glyphs["PLAY"].visible = false;

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

  this.animal_count_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/brown_bear_glyph.png"));
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

  this.train_control = {};

  this.train_control["north"] = new PIXI.Container();
  this.train_control["north"].next = new PIXI.Sprite(PIXI.Texture.from("Art/arrow_left.png"));
  this.train_control["north"].next.anchor.set(0.5,0.5);
  this.train_control["north"].next.position.set(this.width / 2 - 200, this.height / 2);
  this.train_control["north"].addChild(this.train_control["north"].next)
  this.train_control["north"].out = new PIXI.Sprite(PIXI.Texture.from("Art/arrow_down.png"));
  this.train_control["north"].out.anchor.set(0.5,0.5);
  this.train_control["north"].out.position.set(this.width / 2, this.height / 2 + 200);
  this.train_control["north"].addChild(this.train_control["north"].out)
  screen.addChild(this.train_control["north"]);
  this.train_control["north"].visible = false;

  this.train_control["south"] = new PIXI.Container();
  this.train_control["south"].next = new PIXI.Sprite(PIXI.Texture.from("Art/arrow_right.png"));
  this.train_control["south"].next.anchor.set(0.5,0.5);
  this.train_control["south"].next.position.set(this.width / 2 + 200, this.height / 2);
  this.train_control["south"].addChild(this.train_control["south"].next)
  this.train_control["south"].out = new PIXI.Sprite(PIXI.Texture.from("Art/arrow_up.png"));
  this.train_control["south"].out.anchor.set(0.5,0.5);
  this.train_control["south"].out.position.set(this.width / 2, this.height / 2 - 200);
  this.train_control["south"].addChild(this.train_control["south"].out)
  screen.addChild(this.train_control["south"]);
  this.train_control["south"].visible = false;

  this.train_control["west"] = new PIXI.Container();
  this.train_control["west"].next = new PIXI.Sprite(PIXI.Texture.from("Art/arrow_down.png"));
  this.train_control["west"].next.anchor.set(0.5,0.5);
  this.train_control["west"].next.position.set(this.width / 2, this.height / 2 + 200);
  this.train_control["west"].addChild(this.train_control["west"].next)
  this.train_control["west"].out = new PIXI.Sprite(PIXI.Texture.from("Art/arrow_right.png"));
  this.train_control["west"].out.anchor.set(0.5,0.5);
  this.train_control["west"].out.position.set(this.width / 2 + 200, this.height / 2);
  this.train_control["west"].addChild(this.train_control["west"].out)
  screen.addChild(this.train_control["west"]);
  this.train_control["west"].visible = false;

  this.train_control["east"] = new PIXI.Container();
  this.train_control["east"].next = new PIXI.Sprite(PIXI.Texture.from("Art/arrow_up.png"));
  this.train_control["east"].next.anchor.set(0.5,0.5);
  this.train_control["east"].next.position.set(this.width / 2, this.height / 2 - 200);
  this.train_control["east"].addChild(this.train_control["east"].next)
  this.train_control["east"].out = new PIXI.Sprite(PIXI.Texture.from("Art/arrow_left.png"));
  this.train_control["east"].out.anchor.set(0.5,0.5);
  this.train_control["east"].out.position.set(this.width / 2 - 200, this.height / 2);
  this.train_control["east"].addChild(this.train_control["east"].out)
  screen.addChild(this.train_control["east"]);
  this.train_control["east"].visible = false;

  this.train_control_blink = this.markTime();
}




Game.prototype.makeMarimbaScreen = function() {
  var self = this;
  var screen = this.screens["zoo"];
  
  this.marimba_layer = new PIXI.Container();
  screen.addChild(this.marimba_layer);
  this.marimba_layer.visible = false;

  this.marimba_background = new PIXI.Sprite(PIXI.Texture.from("Art/Marimba/marimba_background.png"));
  this.marimba_background.anchor.set(0,0);
  this.marimba_background.position.set(0, 0);
  this.marimba_layer.addChild(this.marimba_background);

  this.left_mallet = new PIXI.Sprite(PIXI.Texture.from("Art/Marimba/marimba_mallet.png"));
  this.left_mallet.anchor.set(0.5,0.166);
  this.left_mallet.angle = 10;
  this.left_mallet.position.set(550, 600);
  this.left_mallet.scale.set(1, 1)
  this.marimba_layer.addChild(this.left_mallet);

  this.right_mallet = new PIXI.Sprite(PIXI.Texture.from("Art/Marimba/marimba_mallet.png"));
  this.right_mallet.anchor.set(0.5,0.166);
  this.right_mallet.angle = -10;
  this.right_mallet.position.set(650, 600);
  this.right_mallet.scale.set(1, 1)
  this.marimba_layer.addChild(this.right_mallet);

  this.last_mallet = this.left_mallet;
  this.last_marimba_note = "";

  this.marimba_positions = {
    "c4":[390,455],
    "d4":[436,449],
    "e4":[490,441],
    "f4":[542,435],
    "g4":[594,429],
    "a4":[645,424],
    "b4":[698,418],
    "c5":[748,411],
    "d5":[800,407],
    "e5":[852,398],
    "f5":[904,393],
    "g5":[957,384],
    "a5":[1009,380],
    "b5":[1060,374]
  };


  this.marimba_escape_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/close_button.png"));
  this.marimba_escape_glyph.anchor.set(0,1);
  this.marimba_escape_glyph.position.set(20, this.height - 20);
  this.marimba_escape_glyph.scale.set(0.6, 0.6)
  this.marimba_escape_glyph.tint = 0x000000;
  this.marimba_escape_glyph.alpha = 0.6;
  this.marimba_layer.addChild(this.marimba_escape_glyph);

  this.marimba_escape_text = new PIXI.Text("Escape", {fontFamily: default_font, fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.marimba_escape_text.anchor.set(0,1);
  this.marimba_escape_text.position.set(100, this.height - 32);
  this.marimba_escape_text.alpha = 0.6;
  this.marimba_layer.addChild(this.marimba_escape_text);
}


Game.prototype.makeMenu = function() {
  var self = this;
  var screen = this.screens["zoo"];
  
  this.menu_layer = new PIXI.Container();
  screen.addChild(this.menu_layer);
  this.menu_layer.visible = false;

  this.menu_selections = [];
  this.menu_selection_number = 0;

  this.main_menu_background = new PIXI.Sprite(PIXI.Texture.from("Art/main_menu_background.png"));
  this.main_menu_background.anchor.set(0,0);
  this.main_menu_background.position.set(0, 0);
  this.menu_layer.addChild(this.main_menu_background);

  this.menu_selections[0] = new PIXI.Text("MUSIC", {fontFamily: default_font, fontSize: 56, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.menu_selections[0].tint = 0x000000;
  this.menu_selections[0].anchor.set(0,0);
  this.menu_selections[0].position.set(110, 130); // previously 169, 141
  this.menu_layer.addChild(this.menu_selections[0]);

  this.music_slider = new PIXI.Sprite(PIXI.Texture.from("Art/slider.png"));
  this.music_slider.anchor.set(0,0.5);
  this.music_slider.position.set(music_slider_left,music_slider_top);
  this.menu_layer.addChild(this.music_slider);

  this.music_slider_bar = new PIXI.Sprite(PIXI.Texture.from("Art/slider_bar.png"));
  this.music_slider_bar.anchor.set(0,0.5);
  this.music_slider_bar.position.set(music_slider_left + 150 * music_volume, music_slider_top);
  this.menu_layer.addChild(this.music_slider_bar);
  
  this.menu_selections[1] = new PIXI.Text("SOUND", {fontFamily: default_font, fontSize: 56, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.menu_selections[1].tint = 0x000000;
  this.menu_selections[1].anchor.set(0,0);
  this.menu_selections[1].position.set(325, 233); // previously 528, 250
  this.menu_layer.addChild(this.menu_selections[1]);

  this.sound_slider = new PIXI.Sprite(PIXI.Texture.from("Art/slider.png"));
  this.sound_slider.anchor.set(0,0.5);
  this.sound_slider.position.set(sound_slider_left, sound_slider_top);
  this.menu_layer.addChild(this.sound_slider);

  this.sound_slider_bar = new PIXI.Sprite(PIXI.Texture.from("Art/slider_bar.png"));
  this.sound_slider_bar.anchor.set(0,0.5);
  this.sound_slider_bar.position.set(sound_slider_left + 150 * sound_volume, sound_slider_top);
  this.menu_layer.addChild(this.sound_slider_bar);

  this.menu_selections[2] = new PIXI.Text("VOICE", {fontFamily: default_font, fontSize: 40, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.menu_selections[2].tint = 0x000000;
  this.menu_selections[2].anchor.set(0,0);
  this.menu_selections[2].position.set(voice_switch_left, voice_switch_top); // previously 528, 250
  this.menu_layer.addChild(this.menu_selections[2]);

  let voice_bar = new PIXI.Text("|", {fontFamily: default_font, fontSize: 40, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  voice_bar.tint = 0x000000;
  voice_bar.anchor.set(0,0);
  voice_bar.position.set(voice_switch_left + 110, voice_switch_top - 2);
  this.menu_layer.addChild(voice_bar);

  this.voice_alt = new PIXI.Text("NO VOICE", {fontFamily: default_font, fontSize: 40, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.voice_alt.tint = 0x000000;
  this.voice_alt.anchor.set(0,0);
  this.voice_alt.position.set(voice_switch_left + 110 + 36, voice_switch_top);
  this.menu_layer.addChild(this.voice_alt);

  this.menu_selections[3] = new PIXI.Text("NEW SMALL ZOO", {fontFamily: default_font, fontSize: 56, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.menu_selections[3].tint = 0x000000;
  this.menu_selections[3].anchor.set(0,0);
  this.menu_selections[3].position.set(302, 551);
  this.menu_layer.addChild(this.menu_selections[3]);

  this.menu_selections[4] = new PIXI.Text("NEW LARGE ZOO", {fontFamily: default_font, fontSize: 56, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.menu_selections[4].tint = 0x000000;
  this.menu_selections[4].anchor.set(0,0);
  this.menu_selections[4].position.set(109, 654);
  this.menu_layer.addChild(this.menu_selections[4]);

  this.menu_selections[5] = new PIXI.Text("WINDOWED", {fontFamily: default_font, fontSize: 32, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.menu_selections[5].tint = 0x000000;
  this.menu_selections[5].anchor.set(0,0);
  this.menu_selections[5].position.set(313, 775);
  this.menu_layer.addChild(this.menu_selections[5]);

  let wfs_bar = new PIXI.Text("|", {fontFamily: default_font, fontSize: 32, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  wfs_bar.tint = 0x000000;
  wfs_bar.anchor.set(0,0);
  wfs_bar.position.set(464, 773);
  this.menu_layer.addChild(wfs_bar);

  this.wfs_alt = new PIXI.Text("FULL SCREEN", {fontFamily: default_font, fontSize: 32, fill: 0xFFFFFF, letterSpacing: 4, align: "left"});
  this.wfs_alt.tint = 0x000000;
  this.wfs_alt.anchor.set(0,0);
  this.wfs_alt.position.set(492, 775);
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

  for (let i = 0; i < this.menu_selections.length; i++) {
    this.menu_selections[i].tint = 0x000000;
    if (i == this.menu_selection_number) this.menu_selections[i].tint = menu_selection_color;
  }

  this.voice_alt.tint = 0x000000;
  if (this.menu_selection_number == (2) && use_voice == false) {
    this.menu_selections[(2)].tint = 0x000000;
    this.voice_alt.tint = menu_selection_color;
  }

  this.wfs_alt.tint = 0x000000;
  if (this.menu_selection_number == (5) && game_fullscreen == true) {
    this.menu_selections[(5)].tint = 0x000000;
    this.wfs_alt.tint = menu_selection_color;
  }
}


Game.prototype.playerAndBoundaries = function() {
  
  this.upper_bound = 0;
  this.lower_bound = 0;
  this.left_bound = 0;
  this.right_bound = 0;


  this.upper_bound = -0.5 * square_width + 250;
  this.lower_bound = square_width * (this.zoo_size + 0.5) - 220;
  this.left_bound = -0.5 * square_width + 240;
  this.right_bound = square_width * (this.zoo_size + 0.5) - 240;

  min_location = [-square_width,-square_width];

  for (let i = 0; i <= this.zoo_size; i++) {
    for (let j = 0; j <= this.zoo_size; j++) {
      if (this.zoo_vertices[i][j].n_path == true 
        && square_width * j + square_width / 2 > min_location[1]
        && (i != this.south_station ||  j != this.zoo_size)) {
        min_location = [square_width * i, square_width * j];
      }
    }
  }

  let selected_character = localStorage.getItem("selected_character") || "brown_bear";
  this.player = this.makeCharacter(selected_character);
  this.player.position.set(min_location[0], min_location[1]);
  this.decorations.push(this.player);

  // Only initialize dollar_bucks if not loaded from save
  if (!this.loaded_from_save) {
    this.dollar_bucks = 6;
  }

  // Restore saved purchases if persistPurchases is enabled
  let persist_purchases = window.getPersistPurchases();
  if (persist_purchases) {
    // Restore balloons
    if (this.saved_balloons && this.saved_balloons.length > 0) {
      for (let balloon_color of this.saved_balloons) {
        this.player.addBalloon(balloon_color);
      }
      this.saved_balloons = [];
    }

    // Restore shirt
    if (this.saved_shirt_color) {
      this.player.addShirt(this.saved_shirt_color);
      this.saved_shirt_color = null;
    }

    // Restore hat
    if (this.saved_hat_type) {
      this.player.addHat(this.saved_hat_type);
      this.saved_hat_type = null;
    }

    // Restore glasses
    if (this.saved_glasses_type) {
      this.player.addGlasses(this.saved_glasses_type);
      this.saved_glasses_type = null;
    }

    // Restore scooter
    if (this.saved_scooter_type) {
      this.player.addScooter(this.saved_scooter_type, "zoo");
      this.saved_scooter_type = null;
    }

    // Restore stuffies
    if (this.saved_stuffies && this.saved_stuffies.length > 0) {
      for (let stuffie_name of this.saved_stuffies) {
        this.player.addStuffie(stuffie_name, this.decorations);
      }
      this.saved_stuffies = [];
    }
  }

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
  } else if (this.zoo_mode == "marimba") {
    if (key === "Escape") {
      this.zoo_mode = "active";
      this.marimba_layer.visible = false;
      if (current_music == null && music_volume > 0) setMusic("background_music");
    }


    if (key === "c" || key === "C") {
      this.playMarimba("c4");
    } else if (key === "d" || key === "D") {
      this.playMarimba("d4");
    } else if (key === "e" || key === "E") {
      this.playMarimba("e4");
    } else if (key === "f" || key === "F") {
      this.playMarimba("f4");
    } else if (key === "g" || key === "G") {
      this.playMarimba("g4");
    } else if (key === "a" || key === "A") {
      this.playMarimba("a4");
    } else if (key === "b" || key === "B") {
      this.playMarimba("b4");
    } else if (key === "1") {
      this.playMarimba("c5");
    } else if (key === "2") {
      this.playMarimba("d5");
    } else if (key === "3") {
      this.playMarimba("e5");
    } else if (key === "4") {
      this.playMarimba("f5");
    } else if (key === "5") {
      this.playMarimba("g5");
    } else if (key === "6") {
      this.playMarimba("a5");
    } else if (key === "7") {
      this.playMarimba("b5");
    }
  }

  if (this.zoo_mode == "train_control") {
    if (this.train_stop == "north") {
      if (key === "ArrowLeft") {
        this.rollTrains();
      } else if (key === "ArrowDown") {
        this.disembarkTrain();
      }
    } else if (this.train_stop == "south") {
      if (key === "ArrowRight") {
        this.rollTrains();
      } else if (key === "ArrowUp") {
        this.disembarkTrain();
      }
    } else if (this.train_stop == "east") {
      if (key === "ArrowUp") {
        this.rollTrains();
      } else if (key === "ArrowLeft") {
        this.disembarkTrain();
      }
    } else if (this.train_stop == "west") {
      if (key === "ArrowDown") {
        this.rollTrains();
      } else if (key === "ArrowRight") {
        this.disembarkTrain();
      }
    }
  }

  if (this.zoo_mode == "menu") {
    if (key === "ArrowUp") {
      soundEffect("pop");
      this.changeMenuSelection(-1);
    } else if (key === "ArrowDown") {
      soundEffect("pop");
      this.changeMenuSelection(1);
    }


    if (this.menu_selection_number == 0 && key == "ArrowLeft") {
      console.log("setting music volume down");
      if (music_volume >= 0.1) {
        music_volume -= 0.1;
        if (music_volume < 0.001) music_volume = 0;
        music_volume = Math.round(music_volume * 10) / 10;
        localStorage.setItem("music_volume", music_volume);
        if (current_music != null) current_music.volume(music_volume);
        if (current_music == null && music_volume > 0) setMusic("background_music");
        this.music_slider_bar.position.set(music_slider_left + 150 * music_volume, music_slider_top);
      }
    }

    if (this.menu_selection_number == 0 && key == "ArrowRight") {
      console.log("setting music volume up");
      if (music_volume <= 0.9) {
        music_volume += 0.1;
        if (music_volume > 0.999) music_volume = 1;
        music_volume = Math.round(music_volume * 10) / 10;
        localStorage.setItem("music_volume", music_volume);
        if (current_music != null) current_music.volume(music_volume);
        if (current_music == null && music_volume > 0) setMusic("background_music");
        this.music_slider_bar.position.set(music_slider_left + 150 * music_volume, music_slider_top);
      }
    }

    if (this.menu_selection_number == 1 && key == "ArrowLeft") {
      if (sound_volume >= 0.1) {
        sound_volume -= 0.1;
        if (sound_volume < 0.001) sound_volume = 0;
        sound_volume = Math.round(sound_volume * 10) / 10;
        localStorage.setItem("sound_volume", sound_volume);
        soundEffect("pop");
        this.sound_slider_bar.position.set(sound_slider_left + 150 * sound_volume, sound_slider_top);
      }
    }

    if (this.menu_selection_number == 1 && key == "ArrowRight") {
      if (sound_volume <= 0.9) {
        sound_volume += 0.1;
        if (sound_volume > 0.999) sound_volume = 1;
        sound_volume = Math.round(sound_volume * 10) / 10;
        localStorage.setItem("sound_volume", sound_volume);
        soundEffect("pop");
        this.sound_slider_bar.position.set(sound_slider_left + 150 * sound_volume, sound_slider_top);
      }
    }


    if (this.menu_selection_number == 2 && (key == "ArrowLeft" || key == "ArrowRight")) {
      use_voice = !use_voice;
      localStorage.setItem("use_voice", use_voice);
      if (use_voice) {
        soundEffect(pick(lower_array));
      }
      this.keymap = {};
      this.changeMenuSelection(0);
    }


    if (this.menu_selection_number == 3 && key == "Enter") {
      this.zoo_mode = "fading";
      this.fadeToBlack(1000);
      delay(function() {
        // Delete existing map save so new zoo size generates fresh map
        window.deleteZooSave();
        localStorage.setItem("zoo_size", 6);
        self.zoo_size = localStorage.getItem("zoo_size");
        self.initializeZoo();
      }, 1000);
    }

    if (this.menu_selection_number == 4 && key == "Enter") {
      this.zoo_mode = "fading";
      this.fadeToBlack(1000);
      delay(function() {
        // Delete existing map save so new zoo size generates fresh map
        window.deleteZooSave();
        localStorage.setItem("zoo_size", 8);
        self.zoo_size = localStorage.getItem("zoo_size");
        self.initializeZoo();
      }, 1000);
    }

    if (this.menu_selection_number == 5 && (key == "ArrowLeft" || key == "ArrowRight" || key == "Enter")) {
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


Game.prototype.playMarimba = function(note) {
  let location = this.marimba_positions[note];

  console.log("play");

  soundEffect(note);

  if (this.last_marimba_note != note) {
    this.last_mallet = this.last_mallet === this.right_mallet ? this.left_mallet : this.right_mallet;
  }

  this.last_marimba_note = note;

  this.last_mallet.position.set(location[0], location[1])
  let old_y = this.last_mallet.y;
  new TWEEN.Tween(this.last_mallet)
    .to({y: old_y + 50})
    .duration(50)
    .start()
    .easing(TWEEN.Easing.Quadratic.In)
    .onComplete(function() {
    });
  new TWEEN.Tween(this.last_mallet)
    .to({y: old_y - 100})
    .duration(150)
    .start()
    .easing(TWEEN.Easing.Quadratic.Out)
    .onComplete(function() {
    });
}

