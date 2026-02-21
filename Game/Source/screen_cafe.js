
//
// screen_cafe.js runs the cafe scene.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let cafe_diner_locations = [[1333, 415+36], [1299,604+36], [738, 837+36], [1098, 757+36], [324, 829+36],];
let cafe_table_locations = [[1303, 508], [1262,700], [699, 932], [1059, 852], [355, 923]];
let cafe_food_locations = [[1315, 449], [1276, 647], [712, 874], [1072, 794], [352, 870]];

let menu_layout = [
  ["PIZZA", 60, 50],
  ["SALAD", 60, 120],
  ["BURGER", 60, 190],
  ["HOT DOG", 60, 260],

  ["MILK", 465, 50],
  ["SODA", 465, 120],
  ["JUICE", 465, 190],
  ["WATER", 465, 260],

  ["APPLE", 798, 50],
  ["KIWI", 798, 120],
  ["PLUM", 798, 190],
  ["PEAR", 798, 260],
  ["PEACH", 798, 330],
  ["BANANA", 798, 400],
  ["ORANGE", 798, 470],

  ["CANDY", 60, 493],
  ["DONUT", 60, 563],
  ["COOKIE", 60, 633],
  ["ICE CREAM", 60, 703],

  ["CELERY", 465, 493],
  ["CARROTS", 465, 563],
  ["TOMATOES", 465, 633],
  ["CUCUMBERS", 465, 703],
]


Game.prototype.initializeCafe = function() {
  var self = this;
  var screen = this.screens["cafe"];
  this.clearScreen(screen);
  console.log("initializing " + screen.name);

  this.cafe_typing_allowed = true;
  this.cafe_exit_sequence = false;
  this.cafe_last_prefix = "";
  this.cafe_last_edit = null;

  this.cafe_background = new PIXI.Sprite(PIXI.Texture.from("Art/Cafe/cafe_background.png"));
  this.cafe_background.anchor.set(0, 0);
  this.cafe_background.scale.set(1, 1);
  this.cafe_background.position.set(0, 0);
  screen.addChild(this.cafe_background);

  this.cafe_menu_background = new PIXI.Sprite(PIXI.Texture.from("Art/Cafe/menu_background.png"));
  this.cafe_menu_background.anchor.set(0, 0);
  this.cafe_menu_background.scale.set(1, 1);
  this.cafe_menu_background.position.set(0, 0);
  screen.addChild(this.cafe_menu_background);

  this.cafe_escape_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/close_button.png"));
  this.cafe_escape_glyph.anchor.set(0,1);
  this.cafe_escape_glyph.position.set(20, this.height - 20);
  this.cafe_escape_glyph.scale.set(0.6, 0.6)
  this.cafe_escape_glyph.tint = 0x000000;
  this.cafe_escape_glyph.alpha = 0.6;
  this.cafe_escape_glyph.visible = true;
  screen.addChild(this.cafe_escape_glyph);

  this.cafe_escape_text = new PIXI.Text("Escape", {fontFamily: default_font, fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.cafe_escape_text.anchor.set(0,1);
  this.cafe_escape_text.position.set(100, this.height - 32);
  this.cafe_escape_text.alpha = 0.6;
  this.cafe_escape_text.visible = true;
  screen.addChild(this.cafe_escape_text);

  // make four diners.
  // diner zero is the player.
  this.cafe_diners = [];
  this.cafe_meals = [null, null, null, null];
  
  for (let i = 0; i < 5; i++) {
    let name = localStorage.getItem("selected_character") || "brown_bear"
    if (i > 0) name = pick(npc_list);
    let diner = this.makeCharacter(name);
    diner.scale.set(1,1); // reset to larger scale
    diner.position.set(cafe_diner_locations[i][0],cafe_diner_locations[i][1]);
    diner.direction = "downleft";
    if (i == 4) diner.direction = "downright";
    if (i > 0) {
      diner.food_time = this.markTime();
      diner.food_delay = 5000 + 8000 * Math.random();
    }
    diner.updateDirection();
    screen.addChild(diner);
    this.shakers.push(diner);
    this.cafe_diners.push(diner);
    if (i == 0) {
      this.cafe_player = diner;

      // Clear any old balloons from cafe player (in case of re-entry)
      if (this.cafe_player.balloons && this.cafe_player.balloons.length > 0) {
        while (this.cafe_player.balloons.length > 0) {
          let oldBalloon = this.cafe_player.balloons.pop();
          if (oldBalloon.parent) {
            oldBalloon.parent.removeChild(oldBalloon);
          }
          oldBalloon.destroy();
        }
      }

      // Sync balloons from zoo player - this is the single source of truth
      if (this.player && this.player.balloons) {
        for (let i = 0; i < this.player.balloons.length; i++) {
          this.cafe_player.addBalloon(this.player.balloons[i].color);
        }
      }
    }
  }

  // make four tables.
  // table zero is the player's table.
  this.cafe_tables = [];
  
  for (let i = 0; i < 5; i++) {
    let table = new PIXI.Sprite(PIXI.Texture.from("Art/Cafe/table.png"));
    table.anchor.set(0.5, 0.7);
    table.scale.set(1, 1);
    table.position.set(cafe_table_locations[i][0],cafe_table_locations[i][1]);
    screen.addChild(table);
    this.cafe_tables.push(table);
  }

  this.cafe_typing_texts = [];

  for (let i = 0; i < menu_layout.length; i++) {
    let layout = menu_layout[i];
    let food_name = layout[0].toLowerCase().replace(" ", "_");
    if (!("Art/Cafe/Food/" + food_name + ".json" in PIXI.Loader.shared.resources)) {
      food_name = "pizza";
    }
    let sheet = PIXI.Loader.shared.resources["Art/Cafe/Food/" + food_name + ".json"].spritesheet
    let glyph = new PIXI.AnimatedSprite(sheet.animations[food_name]);
    // let glyph = new PIXI.Sprite(PIXI.Texture.from("Art/Cafe/Food/steak_placeholder.png"));
    glyph.anchor.set(0.5, 0.5);
    glyph.position.set(layout[1], layout[2]);
    screen.addChild(glyph);

    let white_text = new PIXI.Text(layout[0], {fontFamily: default_font, fontSize: 66, fill: 0xFFFFFF, letterSpacing: 5, align: "left"});
    white_text.anchor.set(0,0.43);
    white_text.position.set(layout[1] + 64, layout[2]);
    screen.addChild(white_text);

    let typing_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 66, fill: 0xFFFFFF, letterSpacing: 5, align: "left"});
    typing_text.tint = 0x000000;
    typing_text.anchor.set(0,0.43);
    typing_text.position.set(layout[1] + 64, layout[2]);
    typing_text.target = layout[0];
    screen.addChild(typing_text);
    this.cafe_typing_texts.push(typing_text);
  }

  this.cafe_last_edit = this.cafe_typing_texts[0];
}


Game.prototype.cafeKeyDown = function(ev) {
  var self = this;
  var screen = this.screens["cafe"];

  let key = ev.key;

  if (key === "Escape" && !this.cafe_exit_sequence) {
    this.cafe_exit_sequence = true;
    this.player.visible = true;
    // Only show ghost if we didn't enter from map mode
    this.ghost.visible = !this.entered_from_map;
    this.player.y += 150;
    this.map.position.set(this.width/2 - this.player.x * this.map.scale.x, (this.height / 2) - this.player.y * this.map.scale.y);
    this.ghost.position.set(this.width/2, this.height/2);
    this.zoo_mode = "active";
    this.player.direction = "right";
    this.player.updateDirection();
    this.updateGhost();
    this.checkPenProximity(this.player.x, this.player.y, this.player.direction);
    this.fadeScreens("cafe", "zoo", true);
    delay(function() {
      self.cafe_exit_sequence = false;
    }, 2000);
    return;
  }

  

  if (this.cafe_typing_allowed) {
    for (i in lower_array) {
      if (key === lower_array[i] || key === letter_array[i]) {
        this.addCafeType(letter_array[i]);
      }
    }

    if (key === "Backspace" || key === "Delete") {
      this.deleteCafeType();
    }
  }
}


Game.prototype.addCafeType = function(letter) {
  var self = this;
  var screen = this.screens["cafe"];

  let prefix = false;
  let new_text = this.cafe_last_prefix + letter;
  let one_text_is_filled = false;

  if (use_voice) {
    soundEffect(letter.toLowerCase());
  }

  for (let i = 0; i < this.cafe_typing_texts.length; i++) {
    let typing_text = this.cafe_typing_texts[i];
    if (typing_text.target.indexOf(new_text) == 0) {
      one_text_is_filled = true;
      if (new_text.length <= typing_text.target.length) {
        typing_text.text = new_text;
        this.cafe_last_prefix = new_text;
        this.cafe_last_edit = typing_text;
        if (typing_text.text.length < typing_text.target.length && 
          typing_text.target[new_text.length] == " ") {
          typing_text.text += " ";
          this.cafe_last_prefix += " ";
        }
      }
    } else {
      typing_text.text = "";
    }
  }
  if (!one_text_is_filled) {
    if (new_text.length <= this.cafe_last_edit.target.length) {
      this.cafe_last_edit.text = new_text;
      this.cafe_last_prefix = new_text;
      if (this.cafe_last_edit.text.length < this.cafe_last_edit.target.length && 
        this.cafe_last_edit.target[new_text.length] == " ") {
        this.cafe_last_edit.text += " ";
        this.cafe_last_prefix += " ";
      }
    } else {
      this.cafe_last_edit.text = this.cafe_last_prefix;
    }
  }

  let got_food = false;
  let typing_choice = null;
  for (let i = 0; i < this.cafe_typing_texts.length; i++) {
    let typing_text = this.cafe_typing_texts[i];
    if (typing_text.text == typing_text.target) {
      got_food = true;
      typing_choice = typing_text;
    }
  }

  if (got_food) {
    let food = this.makeFood(typing_choice.target, 0, typing_choice);
  }
}


Game.prototype.deleteCafeType = function() {
  var self = this;
  var screen = this.screens["cafe"];

  let deleting = false;
  for (let i = 0; i < this.cafe_typing_texts.length; i++) {
    let typing_text = this.cafe_typing_texts[i];

    if (typing_text.text.length > 0) {
      deleting = true;

      if (typing_text.text[typing_text.text.length - 1] === " ") { 
        typing_text.text = typing_text.text.slice(0,-1);
        this.cafe_last_prefix = this.cafe_last_prefix.slice(0,-1);
      }

      let l = typing_text.text.slice(-1,typing_text.text.length);
      let t = new PIXI.Text(l, {fontFamily: default_font, fontSize: 66, fill: 0x000000, letterSpacing: 3, align: "left"});
      t.anchor.set(0,0.5);
      t.position.set(typing_text.position.x + 23 * (typing_text.text.length - 1), typing_text.position.y);
      t.vx = -20 + 40 * Math.random();
      t.vy = -5 + -20 * Math.random();
      t.floor = 1200;
      screen.addChild(t);
      this.freefalling.push(t);

      typing_text.text = typing_text.text.slice(0,-1);
    }
  }
  if (deleting) {
    this.cafe_last_prefix = this.cafe_last_prefix.slice(0,-1);
    soundEffect("swipe");
  }
}


isLiquid = function(food_name) {
  return (food_name == "milk" || food_name == "water" || food_name == "juice" || food_name == "soda");
}


Game.prototype.makeFood = function(food, table_number, typing_choice = null) {
  var self = this;
  var screen = this.screens["cafe"];

  let food_name = food.toLowerCase().replace(" ", "_");
  if (!("Art/Cafe/Food/" + food_name + ".json" in PIXI.Loader.shared.resources)) {
    food_name = "pizza";
  }

  self.makePop(screen, cafe_food_locations[table_number][0], cafe_food_locations[table_number][1], 1, 1);
  let sheet = PIXI.Loader.shared.resources["Art/Cafe/Food/" + food_name + ".json"].spritesheet
  let food_sprite = new PIXI.AnimatedSprite(sheet.animations[food_name]);
  food_sprite.anchor.set(0.5, 0.5);
  food_sprite.position.set(cafe_food_locations[table_number][0], cafe_food_locations[table_number][1]);
  if (table_number == 3) food_sprite.scale.set(-1,1);
  screen.addChild(food_sprite);

  if (table_number == 0) {
    soundEffect("pop");
    this.cafe_typing_allowed = false;

    delay(function() {
      typing_choice.text = "";
      self.cafe_last_prefix = "";
    }, 300);

    flicker(typing_choice, 300, 0x000000, 0xFFFFFF);
  }

  // Add extra delay for player (table 0) so they don't miss the eating animation
  let eating_delay = (table_number == 0) ? 1200 : 0;

  delay(function() {
    if (table_number == 0) {
      if (!isLiquid(food_name)) soundEffect("chomp_" + Math.ceil(Math.random() * 2));
      if (isLiquid(food_name)) soundEffect("slurp");
      self.cafe_diners[table_number].shake = self.markTime();
    }
    food_sprite.gotoAndStop(1);

  }, eating_delay + 500 * (table_number/2 + 1));

  delay(function() {
    if (table_number == 0) {
      if (!isLiquid(food_name)) soundEffect("chomp_" + Math.ceil(Math.random() * 2));
      self.cafe_diners[table_number].shake = self.markTime();
    }
    food_sprite.gotoAndStop(2);

  }, eating_delay + 1000 * (table_number/2 + 1));

  delay(function() {
    food_sprite.visible = false;
    screen.removeChild(food_sprite);
    if (table_number == 0) {
      if (!isLiquid(food_name)) soundEffect("chomp_" + Math.ceil(Math.random() * 2));
      self.cafe_typing_allowed = true;
      self.cafe_diners[table_number].shake = self.markTime();
    }
  }, eating_delay + 1500 * (table_number/2 + 1));
}


Game.prototype.updateCafe = function(diff) {
  var self = this;
  var screen = this.screens["cafe"];

  let fractional = diff / (1000/30.0);

  if (this.cafe_player) {
    this.cafe_player.updateBalloons();
  }

  if (this.cafe_diners != null) {
    for (let i = 1; i < this.cafe_diners.length; i++) {
      let diner = this.cafe_diners[i];
      if (this.timeSince(diner.food_time) > diner.food_delay) {
        food = pick(menu_layout);
        this.makeFood(food[0], i)
        diner.food_time = this.markTime();
        diner.food_delay = 5000 + 8000 * Math.random();
      }
    }
  }

  this.shakeThings();
  this.freeeeeFreeeeeFalling(fractional);
}
