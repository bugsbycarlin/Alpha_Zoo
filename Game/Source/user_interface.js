
//
// This is a partially outdated collection of user interface helper methods.
// This is where we store things like popup window makers, special effect makers,
// scene transition machinery, and so forth. It's outdated because most of the
// methods in here are built for other games. But not all of them!
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//


Game.prototype.shakeThings = function() {
  var self = this;
  var screen = this.screens[this.current_screen];

  for (let item of this.shakers) {
    if (item.shake != null) {
      if (item.permanent_x == null) item.permanent_x = item.position.x;
      if (item.permanent_y == null) item.permanent_y = item.position.y;
      item.position.set(item.permanent_x - 3 + Math.random() * 6, item.permanent_y - 3 + Math.random() * 6)
      if (this.timeSince(item.shake) >= 150) {
        item.shake = null;
        item.position.set(item.permanent_x, item.permanent_y);
        item.permanent_x = null;
        item.permanent_y = null;
      }
    }
  }
}


Game.prototype.freeeeeFreeeeeFalling = function(fractional) {
  var self = this;
  var screen = this.screens[this.current_screen];

  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    item.position.x += item.vx * fractional;
    item.position.y += item.vy * fractional;
    if (item.gravity != null) {
      item.vy += item.gravity * fractional;
    } else {
      item.vy += this.gravity * fractional;
    }
    
    if (item.floor != null && item.position.y > item.floor) {
      if (item.parent != null) {
        item.parent.removeChild(item);
      }
      item.status = "dead";
    }
  }

  let new_freefalling = [];
  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    if (item.status != "dead") {
      new_freefalling.push(item);
    }
  }
  this.freefalling = new_freefalling;
}


Game.prototype.makeSmoke = function(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/smoke.json"].spritesheet;
  let smoke_sprite = new PIXI.AnimatedSprite(sheet.animations["smoke"]);
  smoke_sprite.anchor.set(0.5,0.5);
  smoke_sprite.position.set(x, y);
  // smoke_sprite.angle = Math.random() * 360;
  parent.addChild(smoke_sprite);
  smoke_sprite.animationSpeed = 0.4; 
  smoke_sprite.scale.set(xScale, yScale);

  // smoke_sprite.onLoop = function() {
  //   this.angle = Math.random() * 360;
  // }
  // console.log("But abba tho");
  parent.addChild(smoke_sprite);
  smoke_sprite.loop = false;
  smoke_sprite.onComplete = function() {
    smoke_sprite.state = "dead";
    parent.removeChild(smoke_sprite);
  }
  smoke_sprite.play();
  return smoke_sprite;
}


Game.prototype.makePuff = function(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/puff.json"].spritesheet;
  let puff_sprite = new PIXI.AnimatedSprite(sheet.animations["puff"]);
  puff_sprite.anchor.set(0.5,0.5);
  puff_sprite.position.set(x, y);
  parent.addChild(puff_sprite);
  puff_sprite.animationSpeed = 0.17; 
  puff_sprite.scale.set(xScale, yScale);
  parent.addChild(puff_sprite);
  puff_sprite.loop = false;
  puff_sprite.gotoAndStop(1);
  puff_sprite.onComplete = function() {
    puff_sprite.status = "dead";
    parent.removeChild(puff_sprite);
  }
  puff_sprite.play();
  return puff_sprite;
}


Game.prototype.makeSteam = function(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/steam.json"].spritesheet;
  let steam_sprite = new PIXI.AnimatedSprite(sheet.animations["steam"]);
  steam_sprite.anchor.set(0.5,0.5);
  steam_sprite.position.set(x, y);
  parent.addChild(steam_sprite);
  steam_sprite.animationSpeed = 0.25; 
  steam_sprite.scale.set(xScale, yScale);
  parent.addChild(steam_sprite);
  steam_sprite.loop = false;
  steam_sprite.onComplete = function() {
    steam_sprite.status = "dead";
    parent.removeChild(steam_sprite);
  }
  steam_sprite.play();
  return steam_sprite;
}


Game.prototype.makePop = function(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/pop.json"].spritesheet;
  let pop_sprite = new PIXI.AnimatedSprite(sheet.animations["pop"]);
  pop_sprite.anchor.set(0.5,0.5);
  pop_sprite.position.set(x, y);
  // pop_sprite.angle = Math.random() * 360;
  parent.addChild(pop_sprite);
  pop_sprite.animationSpeed = 0.4;
  pop_sprite.scale.set(xScale, yScale);

  // pop_sprite.onLoop = function() {
  //   this.angle = Math.random() * 360;
  // }
  // console.log("But abba tho");
  parent.addChild(pop_sprite);
  pop_sprite.loop = false;
  pop_sprite.onComplete = function() {
    parent.removeChild(pop_sprite);
  }
  pop_sprite.play();
  return pop_sprite;
}


Game.prototype.makePixelatedLetterTile = function(parent, text, color) {
  var tile = new PIXI.Sprite(PIXI.Texture.from("Art/PixelatedKeys/pixelated_" + color + "_" + text + ".png"));
  parent.addChild(tile);
  tile.anchor.set(0.5,0.5);
  tile.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  return tile;
}


Game.prototype.makeLetterBuilding = function(parent, x, y, letter, team) {
  let letter_building = new PIXI.Container();
  parent.addChild(letter_building);
  letter_building.position.set(x, y);

  letter_building.text = letter;

  let building_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/" + team + "_building_draft_2.png"));
  building_sprite.anchor.set(0.5, 0.5);
  building_sprite.position.set(0, 0);
  letter_building.addChild(building_sprite);
  

  let letter_image = this.makePixelatedLetterTile(letter_building, letter, "white");
  letter_image.anchor.set(0.5, 0.5);
  letter_image.position.set(0, -6);
  if (team == "soviet") { 
    letter_image.tint = 0x000000;
  }

  return letter_building;
}


Game.prototype.makeRocketWithScaffolding = function(parent, x, y) {
  let container = new PIXI.Container();
  parent.addChild(container);
  container.position.set(x, y);

  container.scaffolding = new PIXI.Sprite(PIXI.Texture.from("Art/rocket_scaffolding.png"));
  container.scaffolding.anchor.set(0.5, 0.5);
  container.scaffolding.position.set(0,-8);
  container.addChild(container.scaffolding);

  container.rocket = new PIXI.Sprite(PIXI.Texture.from("Art/rocket_neutral.png"));
  container.rocket.anchor.set(0.5, 0.5);
  container.addChild(container.rocket);

  return container;
}


//
//
// Keyboard UI tools
//
//


Game.prototype.makeKeyboard = function(options) {
  let self = this;

  let parent = options.parent;
  let x = options.x == null ? 0 : options.x;
  let y = options.y == null ? 0 : options.y;
  let defense = options.defense == null ? [] : options.defense;
  let action = options.action == null ? function(){} : options.action;
  let player = options.player;

  let keyboard = new PIXI.Container();
  parent.addChild(keyboard);
  keyboard.position.set(x, y);
  keyboard.scale.set(0.625, 0.625);
  keyboard.letters = {};
  keyboard.keys = {};
  keyboard.error = 0;

  let keys = [];
  if (this.keyboard_mode == "QWERTY") {
    keys[0] = ["Escape_1_esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-_1_minus", "=_1_equals", "Backspace_2_backspace"];
    keys[1] = ["Tab_1.5_tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[_1_leftbracket", "]_1_rightbracket", "\\_1.5_backslash"];
    keys[2] = ["CapsLock_2_capslock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";_1_semicolon", "'_1_quote", "Enter_2_enter"];
    keys[3] = ["LShift_2.5_shift", "Z", "X", "C", "V", "B", "N", "M", ",_1_comma", "._1_period", "/_1_forwardslash", "RShift_2.5_shift"];
    keys[4] = ["Control_1.5_ctrl", "Alt_1_alt", "Meta_1.5_cmd", " _6_spacebar", "Fn_1_fn", "ArrowLeft_1_left", "ArrowUp_1_up", "ArrowDown_1_down", "ArrowRight_1_right"];
  } else if (this.keyboard_mode == "DVORAK") {
    keys[0] = ["Escape_1_esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "[_1_leftbracket", "]_1_rightbracket", "Backspace_2_backspace"];
    keys[1] = ["Tab_1.5_tab", "'_1_quote", ",_1_comma", "._1_period", "P", "Y", "F", "G", "C", "R", "L", "/_1_forwardslash", "=_1_equals", "\\_1.5_backslash"];
    keys[2] = ["CapsLock_2_capslock", "A", "O", "E", "U", "I", "D", "H", "T", "N", "S", "-_1_minus", "Enter_2_enter"];
    keys[3] = ["LShift_2.5_shift", ";_1_semicolon", "Q", "J", "K", "X", "B", "M", "W", "V", "Z", "RShift_2.5_shift"];
    keys[4] = ["Control_1.5_ctrl", "Alt_1_alt", "Meta_1.5_cmd", " _6_spacebar", "Fn_1_fn", "ArrowLeft_1_left", "ArrowUp_1_up", "ArrowDown_1_down", "ArrowRight_1_right"];
  }

  let background = new PIXI.Sprite(PIXI.Texture.from("Art/Keyboard/keyboard_background.png"));
  background.anchor.set(0.5, 0.5);
  keyboard.addChild(background);
  keyboard.background = background;

  for (var h = 0; h < keys.length; h++) {
    var k_x = -610 + 10;
    var k_y = -230 + 50 + 82 * h;
    for (var i = 0; i < keys[h].length; i++) {
      let info = keys[h][i];
      
      let letter = info;
      let size = 1;
      let filename = "key_" + letter;
      if (info.includes("_")) {
        let s = info.split("_");
        letter = s[0];
        size = parseFloat(s[1]);
        filename = "key_" + s[2];
      }

      if (defense.includes(letter)) filename = "blue_" + filename;

      let button = this.makeKey(
        keyboard,
        k_x + size * 40, k_y, filename, size, function() { 
          if (player == 1) {
            self.pressKey(keyboard, letter);
            action(letter);
          }
        },
      );

      k_x += 80 * size;

      keyboard.keys[letter] = button;
      if (letter_array.includes(letter)) {
        keyboard.keys[letter.toLowerCase()] = button;
        keyboard.letters[letter] = button;
      }
    }
  }

  keyboard.setBombs = function (number){
    console.log("Setting " + number + " bombs");
    let spacekey = this.keys[" "];

    if(spacekey.bombs != null) {
      for (let i = 0; i < spacekey.bombs.length; i++) {
        let bomb = spacekey.bombs[i];
        let x = spacekey.removeChild(bomb);
        x.destroy();
      }
    }
    spacekey.bombs = [];
    for (let i = 0; i < number; i++) {
      let bomb = self.makeBomb(spacekey, 54 * i - 27 * (number - 1), 0, 0.8, 0.8);
      bomb.alpha = 0.6;
      spacekey.bombs.push(bomb);
    }
  }

  return keyboard;
}


Game.prototype.makeKey = function(parent, x, y, filename, size, action) {
  var self = this;
  var key_button = new PIXI.Container();
  var key_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/Keyboard/" + filename + ".png"));
  key_sprite.anchor.set(0.5, 0.5);
  key_button.position.set(x, y);
  parent.addChild(key_button);
  key_button.addChild(key_sprite);

  key_button.playable = true;
  key_button.interactive = true;
  key_button.buttonMode = true;
  key_button.on("pointerdown", action);

  key_button.action = action;

  key_button.disable = function() {
    this.interactive = false;
    this.disable_time = self.markTime();
    console.log(this.disable_time);
  }

  key_button.enable = function() {
    this.interactive = true;
  }

  return key_button;
}


Game.prototype.swearing = function() {
  var self = this;
  var screen = this.screens[this.current_screen];

  if (this.opponent_image == null) return;

  let word = "";
  for (let i = 0; i < 5; i++) {
    let num = Math.floor(Math.random() * 5);
    word += "#$%&*".slice(num, num+1);
  }
  word += "!";
  let bub = this.comicBubble(screen, word, 1100 - 150 + 300 * Math.random(), 100 - 50 + 100 * Math.random(), 24);
  delay(function() {
    screen.removeChild(bub);
  }, 500 + Math.random(500));
  if (this.shakers != null) this.shakers.push(bub);
  bub.shake = this.markTime();
  this.opponent_image.shake = this.markTime();
}


Game.prototype.updateEnemyScreenTexture = function() {
  var self = this;
  var screen = this.screens[this.current_screen];

  let texture = PIXI.RenderTexture.create({width: 800, height: 600});

  this.renderer.render(this.player_area, texture);

  if (this.enemy_area.sprite == null) {
    let sprite = PIXI.Sprite.from(texture);
    sprite.position.set(-240,-520);
    sprite.anchor.set(0, 0);
    this.enemy_area.removeChild[0];
    this.enemy_area.addChild(sprite);
    this.enemy_area.sprite = sprite;
  } else {
    this.enemy_area.sprite.texture = texture;
  }
}


//
//
// Meta UI tools
//
//

Game.prototype.initializeScreens = function() {
  var self = this;
  this.screens = [];

  this.makeScreen("character_select");
  this.makeScreen("zoo");
  this.makeScreen("cafe");
  this.makeScreen("gift_shop");
  this.makeScreen("animal_pop");

  this.black = PIXI.Sprite.from(PIXI.Texture.WHITE);
  this.black.width = this.width;
  this.black.height = this.height;
  this.black.tint = 0x000000;

  this.screens[first_screen].position.x = 0;
  this.current_screen = first_screen;

  this.alertMask = new PIXI.Container();
  pixi.stage.addChild(this.alertMask);
  this.alertBox = new PIXI.Container();
  pixi.stage.addChild(this.alertBox);
  this.initializeAlertBox();
}


Game.prototype.makeScreen = function(name) {
  this.screens[name] = new PIXI.Container();
  this.screens[name].name = name;
  this.screens[name].position.x = this.width;
  pixi.stage.addChild(this.screens[name]);
}


Game.prototype.clearScreen = function(screen) {
  console.log("clearing " + screen.name)
  while(screen.children[0]) {
    let x = screen.removeChild(screen.children[0]);
    x.destroy();
  }
}


Game.prototype.switchScreens = function(old_screen, new_screen) {
  var self = this;

  var direction = -1;
  if (new_screen == "title") direction = 1;
  this.screens[new_screen].position.x = direction * -1 * this.width;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen || this.screens[i] == old_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
      this.clearScreen(this.screens[i]);
    }
  }
  var tween_1 = new TWEEN.Tween(this.screens[old_screen].position)
    .to({x: direction * this.width})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(function() {self.clearScreen(self.screens[old_screen]);})
    .start();
  var tween_2 = new TWEEN.Tween(this.screens[new_screen].position)
    .to({x: 0})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .start();
  this.current_screen = new_screen;
}


Game.prototype.makeLoadingScreen = function() {
  this.black.alpha = 1;
  this.black.visible = true;
  pixi.stage.addChild(this.black);

  this.loading_text = new PIXI.Text("LOADING...", {fontFamily: default_font, fontSize: 72, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  this.loading_text.anchor.set(0.5,0.5);
  this.loading_text.position.set(this.width / 2, this.height / 2);
  pixi.stage.addChild(this.loading_text);
}


Game.prototype.fadeToBlack = function(time_to_fade) {
  pixi.stage.addChild(this.black);
  this.black.alpha = 0.01;
  var tween = new TWEEN.Tween(this.black)
    .to({alpha: 1})
    .duration(time_to_fade)
    .onComplete(function() {
    })
    .start();
}


Game.prototype.fadeFromBlack = function(time_to_fade) {
  var tween = new TWEEN.Tween(this.black)
    .to({alpha: 0})
    .duration(time_to_fade)
    .onComplete(function() {
      pixi.stage.removeChild(this.black);
    })
    .start();
}


Game.prototype.fadeScreens = function(old_screen, new_screen, double_fade = false) {
  var self = this;
  console.log("switching from " + old_screen + " to " + new_screen);
  pixi.stage.removeChild(this.screens[old_screen]);
  pixi.stage.removeChild(this.screens[new_screen]);
  pixi.stage.addChild(this.screens[new_screen]);
  if (double_fade) {  
    pixi.stage.addChild(this.black);
    this.black.alpha = 1;
  }
  pixi.stage.addChild(this.screens[old_screen]);
  this.screens[old_screen].position.x = 0;
  this.screens[new_screen].position.x = 0;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen || this.screens[i] == old_screen) {
      this.screens[i].visible = true;
      this.screens[i].alpha = 1;
    } else {
      this.screens[i].visible = false;
      // this.clearScreen(this.screens[i]);
    }
  }

  var tween = new TWEEN.Tween(this.screens[old_screen])
    .to({alpha: 0})
    .duration(1000)
    // .easing(TWEEN.Easing.Linear)
    .onComplete(function() {
      self.screens[new_screen].alpha = 1;
      self.screens[new_screen].visible = true;
      if (!double_fade) {
        self.clearScreen(self.screens[old_screen]);
      } else {
        var tween2 = new TWEEN.Tween(self.black)
        .to({alpha: 0})
        .duration(1000)
        .onComplete(function() {
          // self.clearScreen(self.screens[old_screen]);
          self.screens[old_screen].position.x = 1290;
          self.screens[old_screen].alpha = 1;
          self.screens[old_screen].visible = false;
          self.current_screen = new_screen;
          pixi.stage.removeChild(self.black);
        })
        .start();
      }
    })
    .start();
  
}


Game.prototype.popScreens = function(old_screen, new_screen) {
  var self = this;
  console.log("switching from " + old_screen + " to " + new_screen);
  pixi.stage.removeChild(this.screens[old_screen]);
  pixi.stage.removeChild(this.screens[new_screen]);
  pixi.stage.addChild(this.screens[old_screen]);
  pixi.stage.addChild(this.screens[new_screen]);
  this.screens[old_screen].position.x = 1290;
  this.screens[new_screen].position.x = 0;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
      // this.clearScreen(this.screens[i]);
    }
  }
  // this.clearScreen(this.screens[old_screen]);
  this.current_screen = new_screen;
}


Game.prototype.initializeAlertBox = function() {
  this.alertBox.position.set(this.width / 2, this.height / 2);
  this.alertBox.visible = false;

  this.alertMask.position.set(this.width / 2, this.height / 2);
  this.alertMask.visible = false;
  this.alertMask.interactive = true;
  this.alertMask.buttonMode = true;
  this.alertMask.on("pointertap", function() {
  });


  var mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  mask.width = this.width;
  mask.height = this.height;
  mask.anchor.set(0.5, 0.5);
  mask.alpha = 0.2;
  mask.tint = 0x000000;
  this.alertMask.addChild(mask);

  var outline = PIXI.Sprite.from(PIXI.Texture.WHITE);
  outline.width = this.width * 2/5;
  outline.height = this.height * 2/5;
  outline.anchor.set(0.5, 0.5);
  outline.position.set(-1, -1);
  outline.tint = 0xDDDDDD;
  this.alertBox.addChild(outline);

  for (var i = 0; i < 4; i++) {
    var backingGrey = PIXI.Sprite.from(PIXI.Texture.WHITE);
    backingGrey.width = this.width * 2/5;
    backingGrey.height = this.height * 2/5;
    backingGrey.anchor.set(0.5, 0.5);
    backingGrey.position.set(4 - i, 4 - i);
    backingGrey.tint = PIXI.utils.rgb2hex([0.8 - 0.1*i, 0.8 - 0.1*i, 0.8 - 0.1*i]);
    this.alertBox.addChild(backingGrey);
  }

  var backingWhite = PIXI.Sprite.from(PIXI.Texture.WHITE);
  backingWhite.width = this.width * 2/5;
  backingWhite.height = this.height * 2/5;
  backingWhite.anchor.set(0.5, 0.5);
  backingWhite.position.set(0,0);
  backingWhite.tint = 0xFFFFFF;
  this.alertBox.addChild(backingWhite);

  this.alertBox.alertText = new PIXI.Text("EH. OKAY.", {fontFamily: default_font, fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.alertBox.alertText.anchor.set(0.5,0.5);
  this.alertBox.alertText.position.set(0, 0);
  this.alertBox.addChild(this.alertBox.alertText);

  this.alertBox.interactive = true;
  this.alertBox.buttonMode = true;
}


Game.prototype.gameOverScreen = function(delay_time, force_exit = false) {
  let self = this;

  delay(function() {
    if (!force_exit && self.game_type_selection == 0 
      && (self.difficulty_level == "EASY" || self.difficulty_level == "MEDIUM"
          || (self.difficulty_level == "HARD" && self.continues > 0))) {
      if (self.difficulty_level == "HARD") {
        self.continues -= 1;
      }
      self.initializeGameOver();
      self.switchScreens(self.current_screen, "game_over");
    } else {
      let low_high = self.local_high_scores[self.getModeName()][self.difficulty_level.toLowerCase()][9];
      if (low_high == null || low_high.score < self.score) {
        self.initializeHighScore(self.score);
        self.switchScreens(self.current_screen, "high_score");
      } else {
        self.initialize1pLobby();
        self.switchScreens(self.current_screen, "1p_lobby");
      }
    }

    
  }, delay_time);

}


Game.prototype.showAlert = function(text, action) {
  var self = this;
  pixi.stage.addChild(this.alertMask);
  pixi.stage.addChild(this.alertBox);
  this.alert_last_screen = this.current_screen;
  this.current_screen = "alert";
  this.alertBox.alertText.text = text;
  this.alertBox.removeAllListeners();
  this.alertBox.on("pointertap", function() {
    action();
    self.alertBox.visible = false
    self.alertMask.visible = false
    self.current_screen = self.alert_last_screen
  });
  this.alertBox.visible = true;
  this.alertMask.visible = true;
  new TWEEN.Tween(this.alertBox)
    .to({rotation: Math.PI / 60.0})
    .duration(70)
    .yoyo(true)
    .repeat(3)
    .start()
}


Game.prototype.comicBubble = function(parent, text, x, y, size=36, font_family="Bangers") {
  let comic_container = new PIXI.Container();
  comic_container.position.set(x, y);
  parent.addChild(comic_container);

  let comic_text = new PIXI.Text(" " + text + " ", {fontFamily: font_family, fontSize: size, fill: 0x000000, letterSpacing: 6, align: "center"});
  comic_text.anchor.set(0.5,0.53);

  let black_fill = PIXI.Sprite.from(PIXI.Texture.WHITE);
  black_fill.width = comic_text.width + 16;
  black_fill.height = comic_text.height + 16;
  black_fill.anchor.set(0.5, 0.5);
  black_fill.tint = 0x000000;
  
  let white_fill = PIXI.Sprite.from(PIXI.Texture.WHITE);
  white_fill.width = comic_text.width + 10;
  white_fill.height = comic_text.height + 10;
  white_fill.anchor.set(0.5, 0.5);
  white_fill.tint = 0xFFFFFF;

  comic_container.addChild(black_fill); 
  comic_container.addChild(white_fill);
  comic_container.addChild(comic_text);

  comic_container.is_comic_bubble = true;

  comic_container.cacheAsBitmap = true;

  return comic_container;
}



