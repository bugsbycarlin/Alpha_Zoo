

// screen_zoo_update.js contains zoo screen update loop, interactions, and gameplay logic.
//
//
// screen_zoo.js contains basically the entire core game scene.
// This is where we create the zoo and also where we manage everything
// about the core zoo game: walking around, building enclosures,
// interacting with existing enclosures, and updating all the living things.
//

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
  if (pen.special == "CAFE" || pen.special == "GIFT_SHOP" || pen.special == "MARIMBA") {
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
  if (pen.special == "CAFE" || pen.special == "GIFT_SHOP" || pen.special == "MARIMBA") {
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

// Apply saved grey/ungrey state to visual elements when loading from save
Game.prototype.applyLoadedPenStates = function() {
  for (let i = 0; i < this.zoo_pens.length; i++) {
    let pen = this.zoo_pens[i];
    if (pen.animal != null || pen.special != null) {
      if (pen.state == "grey") {
        this.grey(pen);
      } else if (pen.state == "ungrey") {
        this.ungrey(pen);
      }
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

  this.magicTrainWarp();

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

  this.magicTrainWarp();

  this.doCulling();
  this.updateEnts();

  if (this.map_visible == false) {
    this.checkPenProximity(this.player.x, this.player.y, this.player.direction);
  }
}


Game.prototype.throwHotDog = function() {
  var self = this;
  var screen = this.screens["zoo"];

  soundEffect("throw");
    
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


Game.prototype.rideTrain = function() {
  var self = this;
  var screen = this.screens["zoo"];

  soundEffect("success");
    
  this.display_typing_allowed = false;

  this.zoo_mode = "pre_train_ride";

  flicker(this.action_typing_text[this.action_default_slot], 300, 0x000000, 0xFFFFFF);

  delay(function() {
    self.action_typing_text[self.action_default_slot].text = "";
    self.display_typing_allowed = true;
  }, 300);

  delay(function() {
    self.hideDisplayText();
    self.hideTypingText();
    self.fadeToBlack(1000);
  });

  delay(function() {
    self.fadeFromBlack(1000);
    self.rollTrains();
  }, 1800);

  
}


Game.prototype.rideFerrisWheel = function() {
  var self = this;
  var screen = this.screens["zoo"];

  soundEffect("success");
    
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
      if (self.decorations[i].character_name != self.player.character_name
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

  soundEffect("success");
    
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

  soundEffect("success");
    
  this.display_typing_allowed = false;

  delay(function() {
    self.action_typing_text[self.action_default_slot].text = "";
    self.display_typing_allowed = true;
  }, 300);

  flicker(this.action_typing_text[this.action_default_slot], 300, 0x000000, 0xFFFFFF);

  let current_animal = pick(this.pen_to_display.animal_objects);
  soundEffect("poop_" + Math.ceil(Math.random() * 3));
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

  soundEffect("success");
    
  this.display_typing_allowed = false;

  delay(function() {
    self.action_typing_text[self.action_default_slot].text = "";
    self.display_typing_allowed = true;
    self.displayMap();
  }, 300);

  flicker(this.action_typing_text[this.action_default_slot], 300, 0x000000, 0xFFFFFF);
}


Game.prototype.activateMarimba = function() {
  var self = this;
  var screen = this.screens["zoo"];

  soundEffect("success");
    
  stopMusic();

  this.marimba_layer.visible = true;

  this.display_typing_allowed = false;

  delay(function() {
    self.action_typing_text[self.action_default_slot].text = "";
    self.display_typing_allowed = true;
    self.zoo_mode = "marimba";
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
  this.animal_count_text.text = this.getAnimalsObtained() + " / " + this.getAnimalsAvailable();
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
          // Save map state before entering any special building
          this.entered_from_map = this.map_visible;
          // this.initializeScreen("cafe");

          // Sync cafe player purchases with zoo player before entering
          if (this.cafe_player && this.player) {
            // Sync balloons
            if (this.cafe_player.balloons) {
              while (this.cafe_player.balloons.length > 0) {
                let oldBalloon = this.cafe_player.balloons.pop();
                if (oldBalloon.parent) {
                  oldBalloon.parent.removeChild(oldBalloon);
                }
                oldBalloon.destroy();
              }
              if (this.player.balloons) {
                for (let i = 0; i < this.player.balloons.length; i++) {
                  this.cafe_player.addBalloon(this.player.balloons[i].color);
                }
              }
            }

            // Sync shirt, hat, glasses (scooter not needed in cafe)
            if (this.player.shirt_color) {
              this.cafe_player.addShirt(this.player.shirt_color);
            }
            if (this.player.hat_type) {
              this.cafe_player.addHat(this.player.hat_type);
            }
            if (this.player.glasses_type) {
              this.cafe_player.addGlasses(this.player.glasses_type);
            }
          }

          this.fadeScreens("zoo", "cafe", true);
        }
      }

      if (this.gift_shop != null) {
        if (Math.abs(player.x - this.gift_shop.x) <= 80 && player.y < this.gift_shop.y && player.y > this.gift_shop.y - 50) {
          this.player.visible = false;
          this.player.history = [];
          this.ghost.visible = false;
          this.zoo_mode = "fading";
          // Save map state before entering any special building
          this.entered_from_map = this.map_visible;
          this.gift_shop_mode = "active";
          this.gift_shop_dollar_bucks_text.text = this.dollar_bucks;
          this.updatePriceTags();

          // Sync gift shop player purchases with zoo player before entering
          if (this.gift_shop_player && this.player) {
            // Sync balloons
            if (this.gift_shop_player.balloons) {
              while (this.gift_shop_player.balloons.length > 0) {
                let oldBalloon = this.gift_shop_player.balloons.pop();
                if (oldBalloon.parent) {
                  oldBalloon.parent.removeChild(oldBalloon);
                }
                oldBalloon.destroy();
              }
              if (this.player.balloons) {
                for (let i = 0; i < this.player.balloons.length; i++) {
                  this.gift_shop_player.addBalloon(this.player.balloons[i].color);
                }
              }
            }

            // Sync shirt, hat, glasses, scooter
            if (this.player.shirt_color) {
              this.gift_shop_player.addShirt(this.player.shirt_color);
            }
            if (this.player.hat_type) {
              this.gift_shop_player.addHat(this.player.hat_type);
            }
            if (this.player.glasses_type) {
              this.gift_shop_player.addGlasses(this.player.glasses_type);
            }
            if (this.player.scooter_type) {
              this.gift_shop_player.addScooter(this.player.scooter_type, "gift_shop");
            }

            // Sync stuffies
            if (this.player.stuffies && this.player.stuffies.length > 0) {
              // Clear old stuffies
              while (this.gift_shop_player.stuffies.length > 0) {
                let oldStuffie = this.gift_shop_player.stuffies.pop();
                if (oldStuffie.parent) {
                  oldStuffie.parent.removeChild(oldStuffie);
                }
                oldStuffie.destroy();
              }
              // Add current stuffies
              for (let stuffie of this.player.stuffies) {
                this.gift_shop_player.addStuffie(stuffie.character_name, this.gift_shop_objects);
              }
            }
          }

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
    if (this.zoo_pens[i].polygon && this.zoo_pens[i].special != "RIVER" && pointInsidePolygon([tx, ty], this.zoo_pens[i].polygon)) {
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
  
  // check for train stations
  for (const [key, station] of Object.entries(this.stations)) {
    // console.log(station.polygon);
    if (station.polygon && pointInsidePolygon([tx, ty], station.polygon)) {
      return false;
    }
  }
  

  return true;
}


Game.prototype.pointInPen = function(x, y, find_closest=false) {
  let min_distance = 100000;
  let closest_pen = null;

  for (const [key, station] of Object.entries(this.stations)) {
    if (station.polygon && pointInsidePolygon([x, y], station.polygon)) {
      return station;
    }
  } 

  for (let i = 0; i < this.zoo_pens.length; i++) {
    if ((this.zoo_pens[i].animal_objects != null || this.zoo_pens[i].special_object != null) && this.zoo_pens[i].polygon) {
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
    if (found_pen.animal_objects != null && found_pen.animal != null) {
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
    } else if (found_pen.special_object != null && found_pen.special != null) {
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
  let x = this.player.x;
  let y = this.player.y;
  if (this.zoo_mode == "train_ride" || this.zoo_mode == "train_control" || this.zoo_mode == "train_fade") {
    x = this.trains[1].x;
    y = this.trains[1].y - 150;
  }


  if (this.ents.length == 0) return;
  if (this.player == null) return;
  for (let k = 0; k < total_ents; k++) {
    this.ents[k].visible = false;
  }
  if (this.map_visible == false) {
    ent_count = 0;
    for (let e = 0; e < this.ent_positions.length; e++) {
      let pos = this.ent_positions[e];

      if(Math.abs(x - pos[0]) < 900 && Math.abs(y - pos[1]) < 700) {
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

Game.prototype.magicTrainWarp = function() {
  let min_dist = 30000;
  for (const [key, station] of Object.entries(this.stations)) {
    // console.log(station.polygon);
    let d = distance(this.player.x, this.player.y, station.x, station.y);
    if (d < min_dist) {
      min_dist = d;
      let track_position = station.stop;
      for (let i = 0; i < this.trains.length; i++) {
        this.trains[i].track_position = track_position - 256 * i;
        this.trains[i].updatePosition();
      }
    }
  } 
}

Game.prototype.trainControlBlink = function() {
  if (this.timeSince(this.train_control_blink) > 500) {
    this.train_control_blink = this.markTime();
    if (this.train_control["north"].next.visible == true) {
      this.train_control["north"].next.visible = false;
      this.train_control["north"].out.visible = false;
      this.train_control["south"].next.visible = false;
      this.train_control["south"].out.visible = false;
      this.train_control["east"].next.visible = false;
      this.train_control["east"].out.visible = false;
      this.train_control["west"].next.visible = false;
      this.train_control["west"].out.visible = false;
    } else {
      this.train_control["north"].next.visible = true;
      this.train_control["north"].out.visible = true;
      this.train_control["south"].next.visible = true;
      this.train_control["south"].out.visible = true;
      this.train_control["east"].next.visible = true;
      this.train_control["east"].out.visible = true;
      this.train_control["west"].next.visible = true;
      this.train_control["west"].out.visible = true;
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

    if (this.zoo_mode == "train_ride" || this.zoo_mode == "train_control" || this.zoo_mode == "train_fade") {
      x = this.trains[1].x;
      y = this.trains[1].y - 150;
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

  // Auto-save every 60 seconds
  if (this.last_auto_save == null) {
    this.last_auto_save = this.markTime();
  }
  if (this.timeSince(this.last_auto_save) > 60000) {
    this.saveZooState();
    this.last_auto_save = this.markTime();
  }

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
  } else if (this.zoo_mode == "train_ride" || this.zoo_mode == "train_control" || this.zoo_mode == "train_fade") {
    this.map.position.set(this.width/2 - this.trains[1].x * this.map.scale.x, this.height/2 - (this.trains[1].y - 150) * this.map.scale.y);
  } 

  
  if (this.ferris_wheel != null) {
    if ((this.zoo_mode == "active" || this.zoo_mode == "fading" || this.zoo_mode == "train_ride" || this.zoo_mode == "train_control" || this.zoo_mode == "train_fade") && this.player.y + 150 < this.ferris_wheel.y && this.map_visible == false) {
      this.ferris_wheel.alpha = Math.max(1 - (this.ferris_wheel.y - this.player.y - 150) / 800, 0.0);
    } else {
      this.ferris_wheel.alpha = 1;
    }
  }

  if (this.zoo_mode == "train_ride" || this.zoo_mode == "train_control" || this.zoo_mode == "train_fade") {
    // always moving, update ents
    this.updateEnts();
  }

  for (let i = 0; i < this.animals.length; i++) {
    if (this.animals[i].pen.state == "ungrey") {
      this.animals[i].update();
    }
  }

  // Only update NPCs when zoo is active (not during loading)
  if (this.zoo_mode != "loading") {
    for (let i = 0; i < this.npcs.length; i++) {
      this.updateNPC(this.npcs[i]);
    }
  }

  // Only update trains when zoo is active (not during loading)
  if (this.zoo_mode != "loading" && this.trains) {
    for (let i = 0; i < this.trains.length; i++) {
      this.trains[i].update();
    }
  }

  if (this.zoo_mode == "active" && this.map_visible == false) {
    let min_dist = 30000;
    for (let i = 0; i < this.trains.length; i++) {
      min_dist = Math.min(min_dist, distance(this.player.x, this.player.y, this.trains[i].x, this.trains[i].y));
    }
    if (min_dist > 1200) {
      this.magicTrainWarp();
    }
  }

  this.trainControlBlink();

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