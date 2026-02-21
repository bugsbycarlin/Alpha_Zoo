
//
// screen_character_select.js runs the character selection scene.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let playable_characters = [
  { name: "BLACK BEAR", key: "black_bear" },
  { name: "BROWN BEAR", key: "brown_bear" },
  { name: "LIGHT CAT", key: "light_cat" },
  { name: "ORANGE CAT", key: "orange_cat" },
  { name: "POLAR BEAR", key: "polar_bear" },
  { name: "RABBIT BLUESHIRT", key: "rabbit_blueshirt" },
  { name: "RABBIT REDSHIRT", key: "rabbit_redshirt" },
  { name: "YELLOW CAT", key: "yellow_cat" }
];

Game.prototype.initializeCharacterSelect = function() {
  var self = this;
  var screen = this.screens["character_select"];
  this.clearScreen(screen);
  console.log("initializing " + screen.name);

  this.character_select_typing_allowed = true;
  this.character_select_last_prefix = "";
  this.character_select_last_edit = null;
  this.selected_character_index = -1;

  // Background - grass green
  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x7EC850;
  screen.addChild(background);

  // Title
  let title = new PIXI.Text("Choose Your Character", {
    fontFamily: default_font,
    fontSize: 80,
    fill: 0x333333,
    align: "center"
  });
  title.anchor.set(0.5, 0.5);
  title.position.set(this.width / 2, 100);
  screen.addChild(title);

  // Create character preview containers
  this.character_previews = [];
  this.character_name_grey_texts = [];
  this.character_name_typing_texts = [];

  // Layout: 4 characters per row, 2 rows
  let characters_per_row = 4;
  let char_spacing_x = 280;
  let char_spacing_y = 320;
  let start_x = this.width / 2 - (characters_per_row - 1) * char_spacing_x / 2;
  let start_y = 300;

  playable_characters.forEach((char_data, index) => {
    let row = Math.floor(index / characters_per_row);
    let col = index % characters_per_row;
    let x = start_x + col * char_spacing_x;
    let y = start_y + row * char_spacing_y;

    // Container for this character option
    let char_container = new PIXI.Container();
    char_container.position.set(x, y);

    // Background circle
    let circle = new PIXI.Graphics();
    circle.beginFill(0xFFFFFF);
    circle.drawCircle(0, 0, 80);
    circle.endFill();
    circle.alpha = 0.5;
    char_container.addChild(circle);

    // Character sprite
    let character = this.makeCharacter(char_data.key);
    character.position.set(0, 45);
    character.scale.set(1.2, 1.2);

    // Set to south-facing idle animation
    if (character.sprites && character.sprites.south) {
      character.sprites.south.animationSpeed = 0.1;
      character.sprites.south.play();
    }

    char_container.addChild(character);

    // Character name label - grey text (shows full name)
    let grey_text = new PIXI.Text(char_data.name, {
      fontFamily: default_font,
      fontSize: 36,
      fill: 0xDDDDDD,
      letterSpacing: 2,
      align: "left"
    });
    grey_text.anchor.set(0, 0);

    // Calculate centered position for left-anchored text
    let text_width = grey_text.width;
    grey_text.position.set(-text_width / 2, 100);
    char_container.addChild(grey_text);
    this.character_name_grey_texts.push(grey_text);

    // Character name label - typing text (fills in as you type)
    let typing_text = new PIXI.Text("", {
      fontFamily: default_font,
      fontSize: 36,
      fill: 0xFFFFFF,
      letterSpacing: 2,
      align: "left"
    });
    typing_text.tint = 0x000000;
    typing_text.anchor.set(0, 0);
    typing_text.position.set(-text_width / 2, 100);
    typing_text.target = char_data.name;
    char_container.addChild(typing_text);
    this.character_name_typing_texts.push(typing_text);

    screen.addChild(char_container);
    this.character_previews.push({
      container: char_container,
      circle: circle,
      data: char_data,
      index: index
    });
  });

  this.character_select_last_edit = this.character_name_typing_texts[0];
  this.character_select_initialized = true;
}


Game.prototype.updateCharacterSelect = function(diff) {
  // Don't update if screen not initialized yet
  if (!this.character_select_initialized) return;

  let fractional = diff / (1000/30.0);

  // Update character highlighting based on typing text
  let found_match = false;
  for (let i = 0; i < this.character_previews.length; i++) {
    if (this.character_name_typing_texts[i].text.length > 0) {
      // Highlight this character
      this.character_previews[i].circle.alpha = 1.0;
      this.character_previews[i].circle.tint = 0xFFFF88;
      found_match = true;
      this.selected_character_index = i;
    } else {
      // Dim this character
      this.character_previews[i].circle.alpha = 0.5;
      this.character_previews[i].circle.tint = 0xFFFFFF;
    }
  }

  if (!found_match) {
    this.selected_character_index = -1;
  }

  // Update falling letters physics
  this.freeeeeFreeeeeFalling(fractional);
}


Game.prototype.characterSelectKeyDown = function(ev) {
  var self = this;
  let key = ev.key;

  if (!this.character_select_typing_allowed) return;

  // Handle letter typing
  for (let i in lower_array) {
    if (key === lower_array[i] || key === letter_array[i]) {
      this.addCharacterSelectType(letter_array[i]);
      return;
    }
  }


  // Handle backspace
  if (key === "Backspace" || key === "Delete") {
    this.deleteCharacterSelectType();
    return;
  }
}


Game.prototype.addCharacterSelectType = function(letter) {
  var self = this;

  let new_text = this.character_select_last_prefix + letter;
  let one_text_is_filled = false;

  if (use_voice && letter !== " ") {
    soundEffect(letter.toLowerCase());
  }

  // Check all typing texts to see if any match the new prefix
  for (let i = 0; i < this.character_name_typing_texts.length; i++) {
    let typing_text = this.character_name_typing_texts[i];
    if (typing_text.target.indexOf(new_text) == 0) {
      one_text_is_filled = true;
      if (new_text.length <= typing_text.target.length) {
        typing_text.text = new_text;
        this.character_select_last_prefix = new_text;
        this.character_select_last_edit = typing_text;
        // Auto-add space if the target has a space at this position
        if (typing_text.text.length < typing_text.target.length &&
          typing_text.target[new_text.length] == " ") {
          typing_text.text += " ";
          this.character_select_last_prefix += " ";
        }
      }
    } else {
      typing_text.text = "";
    }
  }

  // If no text matches, continue filling the last edited text (forgiving typing)
  if (!one_text_is_filled) {
    if (new_text.length <= this.character_select_last_edit.target.length) {
      this.character_select_last_edit.text = new_text;
      this.character_select_last_prefix = new_text;
      // Auto-add space if the target has a space at this position
      if (this.character_select_last_edit.text.length < this.character_select_last_edit.target.length &&
        this.character_select_last_edit.target[new_text.length] == " ") {
        this.character_select_last_edit.text += " ";
        this.character_select_last_prefix += " ";
      }
    } else {
      this.character_select_last_edit.text = this.character_select_last_prefix;
    }
  }

  // Check for exact match
  for (let i = 0; i < this.character_name_typing_texts.length; i++) {
    let typing_text = this.character_name_typing_texts[i];
    if (typing_text.text == typing_text.target) {
      this.selectCharacter(playable_characters[i].key, i);
      return;
    }
  }
}


Game.prototype.deleteCharacterSelectType = function() {
  var self = this;
  var screen = this.screens["character_select"];

  let deleting = false;
  for (let i = 0; i < this.character_name_typing_texts.length; i++) {
    let typing_text = this.character_name_typing_texts[i];

    if (typing_text.text.length > 0) {
      deleting = true;

      // Skip spaces when deleting
      if (typing_text.text[typing_text.text.length - 1] === " ") {
        typing_text.text = typing_text.text.slice(0,-1);
        this.character_select_last_prefix = this.character_select_last_prefix.slice(0,-1);
      }

      // Create falling letter animation
      let l = typing_text.text.slice(-1, typing_text.text.length);
      let t = new PIXI.Text(l, {fontFamily: default_font, fontSize: 36, fill: 0x000000, letterSpacing: 2, align: "left"});
      t.anchor.set(0, 0.5);
      t.position.set(
        typing_text.parent.position.x + typing_text.position.x + 23 * (typing_text.text.length - 1),
        typing_text.parent.position.y + typing_text.position.y
      );
      t.vx = -20 + 40 * Math.random();
      t.vy = -5 + -20 * Math.random();
      t.floor = 1200;
      screen.addChild(t);
      this.freefalling.push(t);

      typing_text.text = typing_text.text.slice(0, -1);
    }
  }
  if (deleting) {
    this.character_select_last_prefix = this.character_select_last_prefix.slice(0, -1);
    soundEffect("swipe");
  }
}


Game.prototype.selectCharacter = function(character_key, index) {
  var self = this;

  console.log("Selected character: " + character_key);

  this.character_select_typing_allowed = false;

  soundEffect("success");
  flicker(this.character_name_typing_texts[index], 300, 0x000000, 0xFFFFFF);
  flicker(this.character_name_grey_texts[index], 300, 0x000000, 0xFFFFFF);

  if (use_voice) {
    delay(function() {
      // Map character keys to their spoken sound names
      let spoken_name = character_key;
      if (character_key.includes("cat")) {
        spoken_name = "cat";
      } else if (character_key.includes("rabbit")) {
        spoken_name = "rabbit";
      }
      soundEffect("spoken_" + spoken_name);
    }, 600);
  }

  // Save selection to localStorage
  localStorage.setItem("selected_character", character_key);

  // Transition to zoo screen
  delay(function() {
    self.initializeScreen("zoo");
    self.current_screen = "zoo";
    self.fadeScreens("character_select", "zoo", true);
  }, 800);
}


Game.prototype.clearCharacterSelect = function() {
  var screen = this.screens["character_select"];
  this.clearScreen(screen);
  this.character_previews = [];
  this.character_name_grey_texts = [];
  this.character_name_typing_texts = [];
  this.character_select_initialized = false;
  this.character_select_last_prefix = "";
  this.character_select_last_edit = null;
  this.character_select_typing_allowed = true;
}
