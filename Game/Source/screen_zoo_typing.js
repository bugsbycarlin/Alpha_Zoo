

// screen_zoo_typing.js contains typing and display text systems.
//
//
// screen_zoo.js contains basically the entire core game scene.
// This is where we create the zoo and also where we manage everything
// about the core zoo game: walking around, building enclosures,
// interacting with existing enclosures, and updating all the living things.
//

Game.prototype.addType = function(letter) {
  var self = this;
  var screen = this.screens["typing"];

  if (use_voice) {
    soundEffect(letter.toLowerCase());
  }

  if (this.typing_text.text.length < this.thing_to_type.length) {
    if (this.thing_to_type[this.typing_text.text.length] == "_") {
      this.typing_text.text += " ";
    }
    this.typing_text.text += letter;
  }

  if (this.typing_text.text == this.thing_to_type.replace("_", " ")) {
    soundEffect("success");
    flicker(this.typing_text, 300, 0x000000, 0xFFFFFF);
    this.typing_allowed = false;

    let thing_to_type = this.thing_to_type;
    let pen_to_fix = this.pen_to_fix;

    if (use_voice) {
      delay(function() {
        soundEffect("spoken_" + thing_to_type.toLowerCase())
      }, 600)
    }

    delay(function() {
      if (pen_to_fix.special != "TRAIN") {
        self.ungrey(pen_to_fix);
        pen_to_fix.land_object.shake = self.markTime();
      } else {
        self.stations["north"].ungrey();
        self.stations["south"].ungrey();
        self.stations["east"].ungrey();
        self.stations["west"].ungrey();
        for (let i = 0; i < self.trains.length; i++) {
          self.trains[i].recolor();
        }
      }
      
      soundEffect("build");
      if (pen_to_fix.animal != null) {
        self.dollar_bucks += 2;
      }
      self.updateAnimalCount();
      self.saveZooState();

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
    soundEffect("swipe");
  }
}


Game.prototype.addDisplayType = function(letter) {
  var self = this;
  var screen = this.screens["zoo"];

  let prefix = false;

  if (use_voice) {
    soundEffect(letter.toLowerCase());
  }

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
    } if (text_box.text == "GO") {
      this.rideTrain();
    } else if (text_box.text == "FEED") {
      this.feedAnimal();
    } else if (text_box.text == "POOP") {
      this.poopAnimal();
    } else if (text_box.text == "MAP") {
      this.activateMap();
    } else if (text_box.text == "PLAY") {
      this.activateMarimba();
    } else if (text_box.text == "LET GO") {
      soundEffect("success");

      this.display_typing_allowed = false;

      delay(function() {
        self.action_typing_text[self.action_default_slot].text = "";
        self.display_typing_allowed = true;
        // Only update display text if on ferris wheel
        if (self.thing_to_display == "FERRIS_WHEEL_OPTIONS") {
          self.changeDisplayText("FERRIS_WHEEL_OPTIONS", null);
        }
      }, 300);

      flicker(text_box, 300, 0x000000, 0xFFFFFF);

      // Release balloon from ferris wheel or player depending on context
      if (this.thing_to_display == "FERRIS_WHEEL_OPTIONS") {
        this.ferris_wheel.releaseBalloon();
      } else {
        this.player.releaseBalloon();
        this.saveZooState();
      }
    } else if (text_box.text == "THROW") {
      this.throwHotDog();
    } else if (text_box.text == "COLOR") {

      soundEffect("success");
    
      this.display_typing_allowed = false;

      delay(function() {
        self.action_typing_text[self.action_default_slot].text = "";
        self.display_typing_allowed = true;
      }, 300);

      flicker(text_box, 300, 0x000000, 0xFFFFFF);

      if (this.thing_to_display == "FERRIS_WHEEL") {
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
      } else if (this.thing_to_display == "TRAIN") {
        for (let i = 0; i < this.trains.length; i++) {
          this.trains[i].recolor();
        }
      }

      
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
  soundEffect("swipe");
}


Game.prototype.changeTypingText = function(new_word, found_pen) {
  var self = this;
  var screen = this.screens["zoo"];

  // Guard against null/undefined new_word
  if (new_word == null) {
    return;
  }

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
  } else if (this.thing_to_type == "TRAIN") {
    this.typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/icon.png"));
  } else if (this.thing_to_type == "MARIMBA") {
    this.typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Marimba/marimba_icon.png"));
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
      if (this.player.balloons.length > 0) {
        word_list = ["MAP", "LET GO"];
      } else {
        word_list = ["MAP"];
      }
    } else if (this.thing_to_display == "FERRIS_WHEEL") {
      word_list = ["COLOR", "RIDE"];
    } else if (this.thing_to_display == "TRAIN") {
      word_list = ["COLOR", "GO"];
    } else if (this.thing_to_display == "CAFE") {
      word_list = [];
    } else if (this.thing_to_display == "GIFT_SHOP") {
      word_list = [];
    } else if (this.thing_to_display == "MARIMBA") {
      word_list = ["PLAY"];
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

