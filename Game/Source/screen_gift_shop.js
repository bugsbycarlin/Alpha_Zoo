
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

// There are twelve gift shop slots in every game.

// First we pick two stuffies, one hat, one shirt, two balloons, and the scooter. That's seven slots
// taken. Then we shuffle the rest and pick five more things.

let fills = {
  red: 0xec4e4e,
  pink: 0xe170d0,
  purple: 0x7f3db1,
  blue: 0x576cd5,
  yellow: 0xedd639,
  green: 0x44af3c,
  black: 0x525252,
  orange: 0xfe8300,
  white: 0xFFFFFF,
}

let shirt_reference = {
  0xec4e4e: "red_shirt",
  0xe170d0: "pink_shirt",
  0x7f3db1: "purple_shirt",
  0x576cd5: "blue_shirt",
  0xedd639: "yellow_shirt",
  0x44af3c: "green_shirt",
  0x525252: "black_shirt",
  0xfe8300: "orange_shirt",
  0xFFFFFF: "white_shirt",
}

let stuffies = [
  "stuffed_bear",
  "stuffed_giraffe",
  "stuffed_koala",
  "stuffed_frog",
  "stuffed_chimp",
  "stuffed_wolf",
]

let shirts = [
  "red_shirt",
  "pink_shirt",
  "purple_shirt",
  //"blue_shirt", // you start with this. no need to sell it unless it's a repurchase.
  "yellow_shirt",
  "green_shirt",
  "black_shirt",
  "orange_shirt",
  "white_shirt",
]

let hats = [
  "safari_hat",
  "witch_hat",
  "top_hat",
  "ball_cap",
  "beanie",
]

let glasses = [
  "glasses",
  "sun_glasses",
]

let balloons = [
  "red_balloon",
  "blue_balloon",
  "pink_balloon",
  "purple_balloon",
  "green_balloon",
  "yellow_balloon",
  "orange_balloon",
]

let prices = {
  stuffed_bear: 20,
  stuffed_koala: 15,
  stuffed_giraffe: 20,
  stuffed_frog: 10,
  stuffed_chimp: 15,
  stuffed_wolf: 10,

  red_shirt: 8,
  pink_shirt: 8,
  purple_shirt: 8,
  blue_shirt: 8,
  yellow_shirt: 8,
  green_shirt: 8,
  black_shirt: 8,
  orange_shirt: 8,
  white_shirt: 8,


  ball_cap: 6,
  safari_hat: 6,
  top_hat: 6,
  witch_hat: 6,
  beanie: 6,

  scooter: 25,
  glasses: 3,
  sun_glasses: 3,

  no_hat: 0,
  no_glasses: 0,

  red_balloon: 1,
  blue_balloon: 1,
  pink_balloon: 1,
  purple_balloon: 1,
  green_balloon: 1,
  yellow_balloon: 1,
  orange_balloon: 1,
}

let price_text_color = 0xb49864;
let price_red_color = 0xd24f4f;



Game.prototype.initializeGiftShop = function() {
  var self = this;
  var screen = this.screens["gift_shop"];
  this.clearScreen(screen);
  console.log("initializing " + screen.name);

  // This triggers when debugging the store as the first screen.
  if (first_screen == "gift_shop") {
    this.dollar_bucks = 40;
    this.dropshadow_filter = new PIXI.filters.DropShadowFilter();
    this.dropshadow_filter.blur  = 2;
    this.dropshadow_filter.quality = 3;
    this.dropshadow_filter.alpha = 0.55;
    this.dropshadow_filter.distance = 8;
    this.dropshadow_filter.rotation = 45;
  }
  //////////////////

  this.chooseItemList();

  this.initializeGiftShopUI();
  this.initializeGiftShopObjects();

  this.gift_shop_mode = "active";
}


Game.prototype.chooseItemList = function() {
  shuffleArray(stuffies);
  shuffleArray(shirts);
  shuffleArray(hats);
  shuffleArray(balloons);
  shuffleArray(glasses);

  this.gift_shop_item_list = [stuffies[0], stuffies[1], hats[0], shirts[0], balloons[0], balloons[1], glasses[0], "scooter"];
  let remaining = [];
  for (let i = 2; i < stuffies.length; i++) {
    remaining.push(stuffies[i]);
  }
  for (let i = 1; i < hats.length; i++) {
    remaining.push(hats[i]);
  }
  for (let i = 1; i < shirts.length; i++) {
    remaining.push(shirts[i]);
  }
  for (let i = 2; i < balloons.length; i++) {
    remaining.push(balloons[i]);
  }
  for (let i = 1; i < glasses.length; i++) {
    remaining.push(glasses[i]);
  }
  shuffleArray(remaining);
  for (let i = 0; i < 4; i++) {
    this.gift_shop_item_list.push(remaining[i]);
  }
  shuffleArray(this.gift_shop_item_list);
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

  this.gift_shop_dollar_bucks_text = new PIXI.Text(this.dollar_bucks, {fontFamily: default_font, fontSize: 60, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
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

  let character_name = localStorage.getItem("selected_character") || "brown_bear"
  this.gift_shop_player = this.makeCharacter(character_name);
  this.gift_shop_player.position.set(this.width / 2, this.height / 2);
  this.gift_shop_player.scale.set(1,1);
  this.gift_shop_object_layer.addChild(this.gift_shop_player);
  this.gift_shop_objects.push(this.gift_shop_player);

  // Clear any old balloons from gift shop player (in case of re-entry)
  if (this.gift_shop_player.balloons && this.gift_shop_player.balloons.length > 0) {
    while (this.gift_shop_player.balloons.length > 0) {
      let oldBalloon = this.gift_shop_player.balloons.pop();
      if (oldBalloon.parent) {
        oldBalloon.parent.removeChild(oldBalloon);
      }
      oldBalloon.destroy();
    }
  }

  // Sync balloons from zoo player - this is the single source of truth
  if (this.player && this.player.balloons) {
    for (let i = 0; i < this.player.balloons.length; i++) {
      this.gift_shop_player.addBalloon(this.player.balloons[i].color);
    }
  }

  for (let i = 0; i < gift_shop_table_locations.length; i++) {
    let p = gift_shop_table_locations[i];
    let gift_shop_table = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/gift_shop_table.png"));
    gift_shop_table.position.set(p[0], p[1] - 72);
    gift_shop_table.anchor.set(0.5, 0.375);
    this.gift_shop_object_layer.addChild(gift_shop_table);
    this.gift_shop_objects.push(gift_shop_table);

    for (let j = 0; j < 3; j++) {
      this.gift_shop_table_slots.push({
        x: p[0] - 150 + 150 * j,
        y: p[1] - 50,
        name: null,
        type: null,
        item: null,
        price: 0,
      })
    }
  }

  for (let i = 0; i < this.gift_shop_table_slots.length; i++) {
    let item_name = this.gift_shop_item_list[i];
    
    if (item_name.includes("stuffed") 
      || item_name.includes("shirt")
      || item_name.includes("glasses")
      || item_name.includes("hat")
      || item_name.includes("cap")
      || item_name.includes("beanie")
      || item_name.includes("balloon")
      || item_name.includes("scooter")) this.giftShopAddItem(i, item_name);
    
  }

  // this.balloon_points = [];
  // for (let i = 0; i < 20; i++) {
  //    this.balloon_points.push(new PIXI.Point(640 - Math.random() * 20, 800 - 50 * i));
  // };
  // this.balloon_rope = new PIXI.SimpleRope(PIXI.Texture.from("Art/rope_texture.png"), this.balloon_points);
  // screen.addChild(this.balloon_rope);
}


Game.prototype.giftShopAddItem = function(slot_number, item_name) {
  let slot = this.gift_shop_table_slots[slot_number];
  slot.price = prices[item_name];
  slot.name = item_name;
  slot.number = slot_number;
  
  let item_container = new PIXI.Container();
  item_container.position.set(slot.x, slot.y - slot_number % 3);

  if (item_name.includes("stuffed")) {
    slot.type = "stuffie";
    this.giftShopAddStuffie(item_name, item_container);
  } else if (item_name.includes("shirt")) {
    slot.type = "shirt";
    let shirt_color = fills[item_name.replace("_shirt", "")];
    slot.color = shirt_color;
    this.giftShopAddShirt(shirt_color, item_container);
  } else if (item_name.includes("glasses")) {
    slot.type = "glasses";
    this.giftShopAddGlasses(item_name, item_container);
  } else if (item_name.includes("hat") || item_name.includes("cap") || item_name.includes("beanie")) {
    slot.type = "hat";
    this.giftShopAddHat(item_name, item_container);
  } else if (item_name.includes("balloon")) {
    slot.type = "balloon";
    let balloon_color = fills[item_name.replace("_balloon", "")];
    slot.color = balloon_color;
    this.giftShopAddBalloon(balloon_color, item_container);
  } else if (item_name.includes("scooter")) {
    slot.type = "scooter";
    this.giftShopAddScooter(item_container);
  }

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
    price_text.tint = 0x000000;
    price_tag.tint = price_red_color;
  }

  slot.item = item_container;
  this.shakers.push(slot.item);
  
  this.gift_shop_object_layer.addChild(item_container);
  this.gift_shop_objects.push(item_container);
}


Game.prototype.giftShopAddShirt = function(shirt_color, item_container) {
  let hanger = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/hanger.png"));
  hanger.anchor.set(0.5,0.75);
  hanger.position.set(0, 0);
  item_container.addChild(hanger);

  let shirt = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/shirt.png"));
  shirt.anchor.set(0.5,0.75);
  shirt.position.set(0, 0);
  shirt.tint = shirt_color;
  item_container.shirt = shirt;
  item_container.addChild(shirt);
}


Game.prototype.giftShopAddGlasses = function(item_name, item_container) {
  let hanger = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/hanger.png"));
  hanger.anchor.set(0.5,0.75);
  hanger.position.set(0, 0);
  item_container.addChild(hanger);

  let glasses = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/" + item_name + ".png"));
  glasses.anchor.set(0.5,0.75);
  glasses.position.set(0, 0);
  item_container.glasses = glasses;
  item_container.addChild(glasses);
}


Game.prototype.giftShopAddHat = function(item_name, item_container) {
  let hanger = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/hanger.png"));
  hanger.anchor.set(0.5,0.75);
  hanger.position.set(0, 0);
  item_container.addChild(hanger);

  let hat = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/" + item_name + ".png"));
  hat.anchor.set(0.5,0.75);
  hat.position.set(0, 0);
  item_container.hat = hat;
  item_container.addChild(hat);
}


Game.prototype.giftShopAddBalloon = function(balloon_color, item_container) {
  let hanger = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/balloon_hanger.png"));
  hanger.anchor.set(0.5,0.75);
  hanger.position.set(0, 0);
  item_container.addChild(hanger);

  item_container.balloon = this.makeBalloon(item_container, balloon_color, -5, -45, 45, -105);

  // let balloon = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/balloon.png"));
  // balloon.anchor.set(0.5,0.75);
  // balloon.position.set(0, -60);
  // balloon.tint = balloon_color;
  // item_container.balloon = balloon;
  // item_container.addChild(balloon);
}


Game.prototype.giftShopAddScooter = function(item_container) {
  let hanger = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/mini_hanger.png"));
  hanger.anchor.set(0.5,0.75);
  hanger.position.set(0, 0);
  item_container.addChild(hanger);

  let scooter = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/scooter.png"));
  scooter.anchor.set(0.5,0.75);
  scooter.position.set(0, 0);
  item_container.scooter = scooter;
  item_container.addChild(scooter);
}


Game.prototype.giftShopAddStuffie = function(stuffie_name, item_container) {
  let stuffie = new PIXI.Sprite(PIXI.Texture.from("Art/Stuffed_Animals/" + stuffie_name + ".png"));
  stuffie.anchor.set(0.5,0.75);
  stuffie.position.set(0, 0);
  stuffie.scale.set(1,1);
  //item_container.stuffie = stuffie;
  item_container.addChild(stuffie);
}


Game.prototype.updatePriceTags = function() {
  for (let i = 0; i < this.gift_shop_table_slots.length; i++) {
    let slot = this.gift_shop_table_slots[i];
    if (slot.item != null) {
      slot.item.price_text.text = slot.price;
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
    // Only show ghost if we didn't enter from map mode
    this.ghost.visible = !this.entered_from_map;
    this.player.y += 150;
    for (let i = 0; i < this.player.stuffies.length; i++) {
      this.player.stuffies[i].position.set(this.player.x + (i+1) * 50, this.player.y);
    }
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

  if (use_voice) {
    soundEffect(letter.toLowerCase());
  }

  if (this.gift_shop_typing_text.text.length < this.gift_shop_typing_slot.name.length) {
    if (this.gift_shop_typing_slot.name[this.gift_shop_typing_text.text.length] == "_") {
      this.gift_shop_typing_text.text += " ";
    }
    this.gift_shop_typing_text.text += letter;
  }

  console.log(this.gift_shop_typing_text.text.toLowerCase());
  console.log(this.gift_shop_typing_slot.name.replace("_", " "));
  if (this.gift_shop_typing_text.text.toLowerCase() == replaceAll(this.gift_shop_typing_slot.name, "_", " ")) {
    soundEffect("success");
    flicker(this.gift_shop_typing_text, 300, 0x000000, 0xFFFFFF);
    this.gift_shop_typing_allowed = false;

    let slot = this.gift_shop_typing_slot;
    slot.item.shake = self.markTime();

    delay(function() {
      soundEffect("coin");
      self.dollar_bucks -= slot.price;
      self.gift_shop_dollar_bucks_text.text = self.dollar_bucks;
      flicker(self.gift_shop_dollar_bucks_text, 300, 0x000000, 0xFFFFFF);


      if (slot.type == "stuffie") {
        if (slot.name.includes("no_")) {
          slot.name = replaceAll(slot.name, "no_", "");
          
          self.gift_shop_player.removeStuffie(slot.name, self.gift_shop_objects);
          if (self.player != null) self.player.removeStuffie(slot.name, self.decorations);
          
          slot.item.alpha = 1;
        } else {
          self.gift_shop_player.addStuffie(slot.name, self.gift_shop_objects);
          if (self.player != null) self.player.addStuffie(slot.name, self.decorations);

          slot.name = "no_" + slot.name;
          slot.price = 0;
          slot.item.alpha = 0.4;
        }

        

        // self.gift_shop_object_layer.removeChild(slot.item);
        // let index = self.gift_shop_objects.indexOf(slot.item);
        // if (index > -1) {
        //   self.gift_shop_objects.splice(index, 1);
        // }
        // slot.item = null;

      } else if (slot.type == "shirt") {
        let old_color = self.gift_shop_player.shirt_color;
        if (old_color == null) old_color = fills["blue"];

        self.gift_shop_player.addShirt(slot.color);
        if (self.player != null) self.player.addShirt(slot.color);
        if (self.cafe_player != null) self.cafe_player.addShirt(slot.color);

        slot.name = shirt_reference[old_color];
        slot.item.shirt.tint = old_color;
        slot.color = old_color;
        slot.price = 0;
      } else if (slot.type == "glasses") {
        let old_glasses = self.gift_shop_player.glasses_type;
        self.gift_shop_player.addGlasses(slot.name);
        if (self.player != null) self.player.addGlasses(slot.name);
        if (self.cafe_player != null) self.cafe_player.addGlasses(slot.name);

        self.gift_shop_object_layer.removeChild(slot.item);
        let index = self.gift_shop_objects.indexOf(slot.item);
        if (index > -1) {
          self.gift_shop_objects.splice(index, 1);
        }

        if (old_glasses == null || old_glasses == "no_glasses") {
          self.giftShopAddItem(slot.number, "no_glasses");
        } else {
          console.log(old_glasses);
          self.giftShopAddItem(slot.number, old_glasses);
        }
        slot.price = 0;
      } else if (slot.type == "hat") {
        let old_hat = self.gift_shop_player.hat_type;
        self.gift_shop_player.addHat(slot.name);
        if (self.player != null) self.player.addHat(slot.name);
        if (self.cafe_player != null) self.cafe_player.addHat(slot.name);

        self.gift_shop_object_layer.removeChild(slot.item);
        let index = self.gift_shop_objects.indexOf(slot.item);
        if (index > -1) {
          self.gift_shop_objects.splice(index, 1);
        }

        if (old_hat == null || old_hat == "no_hat") {
          self.giftShopAddItem(slot.number, "no_hat");
        } else {
          self.giftShopAddItem(slot.number, old_hat);
        }
        slot.price = 0;
      } else if (slot.type == "balloon") {
        // Add to both gift shop player (for immediate visibility) and zoo player (source of truth)
        self.gift_shop_player.addBalloon(slot.color);
        if (self.player != null) self.player.addBalloon(slot.color);
        if (self.cafe_player != null) self.cafe_player.addBalloon(slot.color);


        slot.name = pick(balloons);
        slot.item.balloon.color = fills[slot.name.replace("_balloon", "")]
        slot.item.balloon.sprite.tint = slot.item.balloon.color;
        slot.color = slot.item.balloon.color;

        // self.gift_shop_object_layer.removeChild(slot.item);
        // let index = self.gift_shop_objects.indexOf(slot.item);
        // if (index > -1) {
        //   self.gift_shop_objects.splice(index, 1);
        // }
        // slot.item = null;
      } else if (slot.type == "scooter") {
        if (slot.name == "scooter") {
          self.gift_shop_player.addScooter("scooter", "gift_shop");
          if (self.player != null) self.player.addScooter("scooter", "zoo");
          slot.item.alpha = 0.4;
          slot.name = "no_scooter";
          slot.price = 0;
        } else if (slot.name == "no_scooter") {
          self.gift_shop_player.addScooter("no_scooter", "gift_shop");
          if (self.player != null) self.player.addScooter("no_scooter", "zoo");
          slot.item.alpha = 1;
          slot.name = "scooter";
          slot.price = 0;
        }
      }

      self.updatePriceTags();

      self.makeSmoke(screen, slot.x, slot.y - 50, 1.8, 1.8);

      // Save zoo state after all purchases are processed
      self.saveZooState();

      self.giftShopHideTypingText();
    }, 200);


    delay(function() {
      self.giftShopHideTypingText();
    }, 300);
  }
}


Game.prototype.giftShopDeleteType = function() {
  var self = this;
  var screen = this.screens["gift_shop"];

  if (this.gift_shop_typing_text.text.length > 0) {
    if (this.gift_shop_typing_text.text[this.gift_shop_typing_text.text.length - 1] === " ") { 
      this.gift_shop_typing_text.text = this.gift_shop_typing_text.text.slice(0,-1);
    }
    let l = this.gift_shop_typing_text.text.slice(-1,this.gift_shop_typing_text.text.length);
    let t = new PIXI.Text(l, {fontFamily: default_font, fontSize: 140, fill: 0x000000, letterSpacing: 3, align: "left"});
    t.anchor.set(0,0.5);
    t.position.set(25 + 50 * (this.gift_shop_typing_text.text.length - 1), 93);
    t.vx = -20 + 40 * Math.random();
    t.vy = -5 + -20 * Math.random();
    t.floor = 1200;
    screen.addChild(t);
    this.freefalling.push(t);

    this.gift_shop_typing_text.text = this.gift_shop_typing_text.text.slice(0,-1);
    soundEffect("swipe");
  }
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

  player.updateBalloons();

  let last_direction = player.direction;

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
  } else if (player.diretion == null) {
    player.direction = last_direction;
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
    this.gift_shop_typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Stuffed_Animals/" + replaceAll(slot.name,"no_","") + ".png"));
    this.gift_shop_typing_picture.scale.set(1, 1);
  } else if (slot.type == "shirt") {
    this.gift_shop_typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/shirt.png"));
    this.gift_shop_typing_picture.tint = slot.color;
  } else if (slot.type == "glasses") {
    this.gift_shop_typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/" + slot.name + ".png"));
  } else if (slot.type == "hat") {
    this.gift_shop_typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/" + slot.name + ".png"));
  } else if (slot.type == "balloon") {
    this.gift_shop_typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/balloon.png"));
    this.gift_shop_typing_picture.tint = slot.color;
  } else if (slot.type == "scooter") {
    this.gift_shop_typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/Merchandise/scooter.png"));
  } 

  this.gift_shop_typing_picture.anchor.set(0.5, 0.77);
  this.gift_shop_typing_picture.position.set(110 + measure.width, 133);
  if (slot.type == "hat" || slot.type == "glasses") {
    this.gift_shop_typing_picture.position.set(110 + measure.width, 155);
  } else if (slot.type == "shirt") {
    this.gift_shop_typing_picture.position.set(110 + measure.width, 145);
  } else if (slot.type == "scooter") {
    this.gift_shop_typing_picture.position.set(125 + measure.width, 155);
  } else if (slot.type == "balloon") {
    this.gift_shop_typing_picture.position.set(100 + measure.width, 133);
  }

  this.gift_shop_typing_backing = new PIXI.Graphics();
  this.gift_shop_typing_backing.beginFill(0xFFFFFF, 1);
  this.gift_shop_typing_backing.drawRoundedRect(-20, -20, measure.width + 180, 120, 20);
  for (let i = 0; i < measure.width + 200; i += 40 + Math.floor(Math.random() * 20)) {
    this.gift_shop_typing_backing.drawCircle(i, 120 + 40 * Math.random() - 40 * (i / (measure.width + 200)), 50 + 30 * Math.random());
  }
  this.gift_shop_typing_backing.drawCircle(measure.width + 200, 10 + 30 * Math.random(), 50 + 30 * Math.random());
  this.gift_shop_typing_backing.endFill();
  this.gift_shop_typing_backing.filters = [this.dropshadow_filter];

  this.gift_shop_grey_text.text = replaceAll(slot.name, "_", " ");
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

  if (this.gift_shop_mode == "active") {
    this.updateGiftShopPlayer();
  
    for (let i = 0; i < this.gift_shop_table_slots.length; i++) {
      let slot = this.gift_shop_table_slots[i];
      if (slot.item != null && slot.type == "balloon") {
        slot.item.balloon.update();
      }
    }
  }

  if (this.gift_shop_objects != null) {
    let new_gift_shop_objects = [];
    for (let i = 0; i < this.gift_shop_objects.length; i++) {
      if (!(this.gift_shop_objects[i].status == "dead")) {
        new_gift_shop_objects.push(this.gift_shop_objects[i])
      } else {
        // console.log("dead");
      }
    }
    this.gift_shop_objects = new_gift_shop_objects;
  }
  this.sortLayer(this.gift_shop_object_layer, this.gift_shop_objects);

  this.shakeThings();
  this.freeeeeFreeeeeFalling(fractional);
}
