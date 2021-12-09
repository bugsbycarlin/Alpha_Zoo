
//
// screen_gift_shop.js runs the gift shop scene.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let gift_shop_table_locations = [
  [405, 487],
  [1045, 493],
  [316, 743],
  [1120, 751],
]

let table_polygons = [];
for (let i = 0; i < gift_shop_table_locations.length; i++) {
  let p = gift_shop_table_locations[i];
  table_polygons.push([
    [p[0] - 200, p[1]],
    [p[0] - 200, p[1] - 100],
    [p[0] + 200, p[1] - 100],
    [p[0] + 200, p[1]],
  ]);
}

let container_polygon = [
  [185, 342],
  [1278, 342],
  [1440, 468],
  [1440, 900],
  [0, 900],
  [0, 468],
];

let prices = {
  stuffed_bear: 30,
  stuffed_koala: 25,
  stuffed_giraffe: 5,
}

let price_text_color = 0xb49864;
let price_red_color = 0xd24f4f;

Game.prototype.initializeGiftShop = function() {
  var self = this;
  var screen = this.screens["gift_shop"];
  this.clearScreen(screen);
  console.log("initializing " + screen.name);

  // VERY TEMPORARY STUFF. HIDE, BUT KEEP, FOR FUTURE DEBUGGING.
  // this.dollar_bucks = 40;
  // this.dropshadow_filter = new PIXI.filters.DropShadowFilter();
  // this.dropshadow_filter.blur  = 2;
  // this.dropshadow_filter.quality = 3;
  // this.dropshadow_filter.alpha = 0.55;
  // this.dropshadow_filter.distance = 8;
  // this.dropshadow_filter.rotation = 45;
  ////////////////////

  this.initializeGiftShopUI();
  this.initializeGiftShopObjects();

  this.gift_shop_mode = "active";
}


Game.prototype.initializeGiftShopUI = function() {
  var self = this;
  var screen = this.screens["gift_shop"];

  this.gift_shop_background = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/gift_shop_background.png"));
  this.gift_shop_background.anchor.set(0, 0);
  this.gift_shop_background.scale.set(1, 1);
  this.gift_shop_background.position.set(0, 0);
  screen.addChild(this.gift_shop_background);

  this.gift_shop_object_layer = new PIXI.Container();
  screen.addChild(this.gift_shop_object_layer);

  this.gift_shop_escape_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/close_button.png"));
  this.gift_shop_escape_glyph.anchor.set(0,1);
  this.gift_shop_escape_glyph.position.set(20, this.height - 20);
  this.gift_shop_escape_glyph.scale.set(0.6, 0.6)
  this.gift_shop_escape_glyph.tint = 0x000000;
  this.gift_shop_escape_glyph.alpha = 0.6;
  this.gift_shop_escape_glyph.visible = true;
  screen.addChild(this.gift_shop_escape_glyph);

  this.gift_shop_escape_text = new PIXI.Text("Escape", {fontFamily: default_font, fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.gift_shop_escape_text.anchor.set(0,1);
  this.gift_shop_escape_text.position.set(100, this.height - 32);
  this.gift_shop_escape_text.alpha = 0.6;
  this.gift_shop_escape_text.visible = true;
  screen.addChild(this.gift_shop_escape_text);

  this.gift_shop_typing_ui = new PIXI.Container();
  screen.addChild(this.gift_shop_typing_ui);

  this.gift_shop_grey_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 140, fill: 0xDDDDDD, letterSpacing: 8, align: "left"});
  this.gift_shop_grey_text.anchor.set(0,0.5);
  this.gift_shop_grey_text.position.set(25, 93);
  this.gift_shop_typing_ui.addChild(this.gift_shop_grey_text);

  this.gift_shop_typing_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 140, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  this.gift_shop_typing_text.tint = 0x000000;
  this.gift_shop_typing_text.anchor.set(0,0.5);
  this.gift_shop_typing_text.position.set(25, 93);
  this.gift_shop_typing_ui.addChild(this.gift_shop_typing_text);

  this.gift_shop_typing_backing = null;
  this.gift_shop_typing_ui.visible = false;

  this.gift_shop_typing_allowed = false;
  this.gift_shop_typing_slot = null;

  this.gift_shop_dollar_bucks_text = new PIXI.Text("0", {fontFamily: default_font, fontSize: 60, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.gift_shop_dollar_bucks_text.tint = 0x000000;
  this.gift_shop_dollar_bucks_text.anchor.set(1,0.5);
  this.gift_shop_dollar_bucks_text.position.set(this.width - 110, 65);
  this.gift_shop_dollar_bucks_text.alpha = 0.6;
  screen.addChild(this.gift_shop_dollar_bucks_text);

  this.gift_shop_dollar_bucks_glyph = new PIXI.Text("$", {fontFamily: default_font, fontSize: 60, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.gift_shop_dollar_bucks_glyph.anchor.set(1,0.5);
  this.gift_shop_dollar_bucks_glyph.position.set(this.width - 50, 65);
  this.gift_shop_dollar_bucks_glyph.alpha = 0.6;
  screen.addChild(this.gift_shop_dollar_bucks_glyph);
}


Game.prototype.initializeGiftShopObjects = function() {
  var self = this;
  var screen = this.screens["gift_shop"];

  this.gift_shop_table_slots = [];

  this.gift_shop_objects = [];

  this.gift_shop_player = this.makeCharacter("brown_bear"); //brown_bear
  this.gift_shop_player.position.set(this.width / 2, this.height / 2);
  this.gift_shop_player.scale.set(1,1);
  this.gift_shop_object_layer.addChild(this.gift_shop_player);
  this.gift_shop_objects.push(this.gift_shop_player);

  for (let i = 0; i < gift_shop_table_locations.length; i++) {
    let p = gift_shop_table_locations[i];
    let gift_shop_table = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/gift_shop_table.png"));
    gift_shop_table.position.set(p[0], p[1] - 72);
    gift_shop_table.anchor.set(0.5, 0.375);
    this.gift_shop_object_layer.addChild(gift_shop_table);
    this.gift_shop_objects.push(gift_shop_table);

    for (let j = 0; j < 4; j++) {
      this.gift_shop_table_slots.push({
        x: p[0] - 150 + 100 * j,
        y: p[1] - 50,
        name: null,
        type: null,
        item: null,
        price: 0,
      })
    }
  }

  this.giftShopAddStuffie(0, "stuffed_bear");
  this.giftShopAddStuffie(1, "stuffed_giraffe");
  this.giftShopAddStuffie(2, "stuffed_bear");
  this.giftShopAddStuffie(3, "stuffed_bear");
  this.giftShopAddStuffie(8, "stuffed_koala");
}


Game.prototype.giftShopAddStuffie = function(slot_number, stuffie_name) {
  let slot = this.gift_shop_table_slots[slot_number];
  slot.price = prices[stuffie_name];
  slot.name = stuffie_name;
  slot.type = "stuffie";

  let item_container = new PIXI.Container();
  item_container.position.set(slot.x, slot.y - slot_number % 4);
  
  let stuffie = new PIXI.Sprite(PIXI.Texture.from("Art/Stuffed_Animals/" + stuffie_name + ".png"));
  stuffie.anchor.set(0.5,0.75);
  stuffie.position.set(0, 0);
  stuffie.scale.set(1,1);
  item_container.stuffie = stuffie;
  item_container.addChild(stuffie);

  let price_tag = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/price_tag.png"));
  price_tag.anchor.set(0.5, 0.5);
  let y_adjust = slot_number % 2 == 0 ? -20 : 0;
  price_tag.position.set(40, 10 + y_adjust);
  item_container.price_tag = price_tag;
  item_container.addChild(price_tag);

  let price_text = new PIXI.Text("$" + slot.price, {fontFamily: default_font, fontSize: 28, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  price_text.anchor.set(0.5, 0.5);
  price_text.position.set(price_tag.x + 12, price_tag.y + 1);
  price_text.tint = price_text_color;
  item_container.price_text = price_text;
  item_container.addChild(price_text);

  if (this.dollar_bucks < slot.price) {
    console.log("here");
    price_text.tint = 0x000000;
    price_tag.tint = price_red_color;
  }

  slot.item = item_container;
  this.shakers.push(slot.item);
  
  this.gift_shop_object_layer.addChild(item_container);
  this.gift_shop_objects.push(item_container);
}


Game.prototype.updatePriceTags = function() {
  for (let i = 0; i < this.gift_shop_table_slots.length; i++) {
    let slot = this.gift_shop_table_slots[i];
    if (slot.item != null) {
      if (this.dollar_bucks < slot.price) {
        slot.item.price_text.tint = 0x000000;
        slot.item.price_tag.tint = price_red_color;
      } else {
        slot.item.price_text.tint = price_text_color;
        slot.item.price_tag.tint = 0xFFFFFF;
      }
    }
  }
}


Game.prototype.giftShopKeyDown = function(ev) {
  var self = this;
  var screen = this.screens["gift_shop"];

  let key = ev.key;

  if (key === "Escape" && this.gift_shop_mode != "exit") {
    this.gift_shop_mode = "exit";
    this.player.visible = true;
    this.ghost.visible = true;
    this.player.y += 150;
    this.map.position.set(this.width/2 - this.player.x * this.map.scale.x, (this.height / 2) - this.player.y * this.map.scale.y);
    this.ghost.position.set(this.width/2, this.height/2);
    this.zoo_mode = "active";
    this.player.direction = "right";
    this.player.updateDirection();
    this.updateGhost();
    this.checkPenProximity(this.player.x, this.player.y, this.player.direction);
    this.dollar_bucks_text.text = this.dollar_bucks;
    this.fadeScreens("gift_shop", "zoo", true);
    return;
  }

  // if (key === " " && this.gift_shop_player.stuffies.length == 0) {
  //   this.gift_shop_player.addStuffie("stuffed_bear", this.gift_shop_objects);
  // }

  if (this.gift_shop_mode == "active") {
    if (this.gift_shop_typing_allowed && this.gift_shop_typing_ui.visible) {
      for (i in lower_array) {
        if (key === lower_array[i] || key === letter_array[i]) {
          this.giftShopAddType(letter_array[i]);
        }
      }

      if (key === "Backspace" || key === "Delete") {
        this.giftShopDeleteType();
      }
    } 
  }
}


Game.prototype.giftShopAddType = function(letter) {
  var self = this;
  let screen = this.screens["gift_shop"];

  if (this.gift_shop_typing_text.text.length < this.gift_shop_typing_slot.name.length) {
    if (this.gift_shop_typing_slot.name[this.gift_shop_typing_text.text.length] == "_") {
      this.gift_shop_typing_text.text += " ";
    }
    this.gift_shop_typing_text.text += letter;
  }

  console.log(this.gift_shop_typing_text.text.toLowerCase());
  console.log(this.gift_shop_typing_slot.name.replace("_", " "));
  if (this.gift_shop_typing_text.text.toLowerCase() == this.gift_shop_typing_slot.name.replace("_", " ")) {
    this.soundEffect("success");
    flicker(this.gift_shop_typing_text, 300, 0x000000, 0xFFFFFF);
    this.gift_shop_typing_allowed = false;

    let slot = this.gift_shop_typing_slot;
    slot.item.shake = self.markTime();

    delay(function() {
      self.soundEffect("coin");
      self.dollar_bucks -= slot.price;
      self.gift_shop_dollar_bucks_text.text = self.dollar_bucks;
      flicker(self.gift_shop_dollar_bucks_text, 300, 0x000000, 0xFFFFFF);

      if (slot.type == "stuffie") {
        self.gift_shop_player.addStuffie(slot.name, self.gift_shop_objects);
        if (self.player != null) self.player.addStuffie(slot.name, self.decorations);
      }

      self.gift_shop_object_layer.removeChild(slot.item);
      let index = self.gift_shop_objects.indexOf(slot.item);
      if (index > -1) {
        self.gift_shop_objects.splice(index, 1);
      }
      slot.item = null;

      self.makeSmoke(screen, slot.x, slot.y - 50, 1.8, 1.8);

      self.giftShopHideTypingText();
    }, 200);


    delay(function() {
      self.giftShopHideTypingText();
    }, 300);
  }
}


Game.prototype.giftShopDeleteType = function() {
  
}


Game.prototype.giftShopTestMove = function(x, y, direction) {
  let tx = x;
  let ty = y;

  if (direction == "right") {
    tx += 40;
    ty -= 5;
  }
  if (direction == "left") {
    tx -= 40;
    ty -= 5;
  }
  if (direction == "up") ty -= 30;
  if (direction == "down") ty += 0;
  if (direction == "downright") {
    tx += 40;
    ty += 0;
  }
  if (direction == "downleft") {
    tx -= 40;
    ty += 0;
  }
  if (direction == "upright") {
    tx += 40;
    ty -= 30;
  }
  if (direction == "upleft") {
    tx -= 40;
    ty -= 30;
  }

  if (!pointInsidePolygon([tx, ty], container_polygon)) {
    return false;
  }

  for (let i = 0; i < table_polygons.length; i++) {
    if (pointInsidePolygon([tx, ty], table_polygons[i])) {
      return false;
    }
  }

  return true;
}


Game.prototype.updateGiftShopPlayer = function() {
  var self = this;
  var keymap = this.keymap;
  var player = this.gift_shop_player;

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

  if (this.giftShopTestMove(player.x, player.y, player.direction) && player.direction != null) {
    player.move();

    let closest_slot = null;

    for (let i = 0; i < this.gift_shop_table_slots.length; i++) {
      let slot = this.gift_shop_table_slots[i];
      if (slot.item != null) {
        let d = distance(slot.x, slot.y, this.gift_shop_player.x, this.gift_shop_player.y);
        if (d < 110) {
          if (closest_slot == null || d < distance(closest_slot.x, closest_slot.y, this.gift_shop_player.x, this.gift_shop_player.y)) {
            closest_slot = slot;
          }
        }
      }
    }

    if (closest_slot != null && 
      closest_slot != this.gift_shop_typing_slot && closest_slot.price <= this.dollar_bucks) {
      this.giftShopRevealTypingText(closest_slot);
    } else if (closest_slot == null) {
      this.giftShopHideTypingText();
    }
  }
}


Game.prototype.giftShopRevealTypingText = function(slot) {
  var self = this;

  this.gift_shop_typing_slot = slot;

  if (this.gift_shop_typing_backing != null) {
    this.gift_shop_typing_ui.removeChild(this.gift_shop_typing_backing);
    this.gift_shop_typing_backing.destroy();
  }

  if (this.gift_shop_typing_picture != null) {
    this.gift_shop_typing_ui.removeChild(this.gift_shop_typing_picture);
    this.gift_shop_typing_picture.destroy();
  }

  let measure = new PIXI.TextMetrics.measureText(slot.name, this.gift_shop_typing_text.style);

  // make the icon
  if (slot.type == "stuffie") {
    this.gift_shop_typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Stuffed_Animals/" + slot.name + ".png"));
    this.gift_shop_typing_picture.scale.set(1, 1);
  }

  this.gift_shop_typing_picture.anchor.set(0.5, 0.77);
  this.gift_shop_typing_picture.position.set(110 + measure.width, 133);

  this.gift_shop_typing_backing = new PIXI.Graphics();
  this.gift_shop_typing_backing.beginFill(0xFFFFFF, 1);
  this.gift_shop_typing_backing.drawRoundedRect(-20, -20, measure.width + 180, 120, 20);
  for (let i = 0; i < measure.width + 200; i += 40 + Math.floor(Math.random() * 20)) {
    this.gift_shop_typing_backing.drawCircle(i, 120 + 40 * Math.random() - 40 * (i / (measure.width + 200)), 50 + 30 * Math.random());
  }
  this.gift_shop_typing_backing.drawCircle(measure.width + 200, 10 + 30 * Math.random(), 50 + 30 * Math.random());
  this.gift_shop_typing_backing.endFill();
  this.gift_shop_typing_backing.filters = [this.dropshadow_filter];

  this.gift_shop_grey_text.text = slot.name.replace("_", " ");
  this.gift_shop_typing_text.text = "";

  console.log("bobs");


  this.gift_shop_typing_ui.addChild(this.gift_shop_typing_backing);
  this.gift_shop_typing_ui.addChild(this.gift_shop_typing_picture);
  this.gift_shop_typing_ui.addChild(this.gift_shop_grey_text);
  this.gift_shop_typing_ui.addChild(this.gift_shop_typing_text);

  if (!this.gift_shop_typing_ui.visible) {
    this.gift_shop_typing_ui.visible = true;
    this.gift_shop_typing_ui.position.set(0, -300);
  }
  new TWEEN.Tween(this.gift_shop_typing_ui)
    .to({y: 0})
    .duration(250)
    .start()
    .onUpdate(function() {
      self.gift_shop_typing_ui.visible = true;
    })
    .onComplete(function() {
      self.gift_shop_typing_allowed = true;
      self.gift_shop_typing_ui.visible = true;
    });

  console.log("donezo");
}


Game.prototype.giftShopHideTypingText = function() {
  var self = this;

  this.gift_shop_typing_allowed = false;
  this.gift_shop_typing_slot = null;
  new TWEEN.Tween(this.gift_shop_typing_ui)
    .to({y: -300})
    .duration(250)
    .start()
    .onComplete(function() {
      self.gift_shop_typing_ui.visible = false;
    });
}


Game.prototype.updateGiftShop = function(diff) {
  var self = this;
  var screen = this.screens["gift_shop"];

  let fractional = diff / (1000/30.0);

  if (this.gift_shop_mode == "active") this.updateGiftShopPlayer();

  this.sortLayer(this.gift_shop_object_layer, this.gift_shop_objects);

  this.shakeThings();
  this.freeeeeFreeeeeFalling(fractional);
}
