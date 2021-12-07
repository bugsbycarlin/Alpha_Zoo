
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



Game.prototype.initializeGiftShop = function() {
  var self = this;
  var screen = this.screens["gift_shop"];
  this.clearScreen(screen);
  console.log("initializing " + screen.name);

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


  this.gift_shop_objects = [];

  this.gift_shop_player = this.makeCharacter("brown_bear"); //brown_bear
  this.gift_shop_player.position.set(this.width / 2, this.height / 2);
  this.gift_shop_player.scale.set(1,1);
  this.gift_shop_object_layer.addChild(this.gift_shop_player);
  this.gift_shop_objects.push(this.gift_shop_player);

  for (let i = 0; i < gift_shop_table_locations.length; i++) {
    let p = gift_shop_table_locations[i];
    let gift_shop_table = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/gift_shop_table.png"));
    gift_shop_table.position.set(p[0], p[1]);
    gift_shop_table.anchor.set(0.5, 0.75);
    this.gift_shop_object_layer.addChild(gift_shop_table);
    this.gift_shop_objects.push(gift_shop_table);
  }

  this.gift_shop_mode = "active";
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
    this.map.position.set(this.width/2 - this.player.x * this.map.scale.x, (100 + this.height / 2) - this.player.y * this.map.scale.y);
    this.ghost.position.set(this.width/2, this.height/2 + 100);
    this.zoo_mode = "active";
    this.player.direction = "right";
    this.player.updateDirection();
    this.updateGhost();
    this.checkPenProximity(this.player.x, this.player.y, this.player.direction);
    this.fadeScreens("gift_shop", "zoo", true);
    return;
  }

  // if (this.cafe_typing_allowed) {
  //   for (i in lower_array) {
  //     if (key === lower_array[i] || key === letter_array[i]) {
  //       this.addCafeType(letter_array[i]);
  //     }
  //   }

  //   if (key === "Backspace" || key === "Delete") {
  //     this.deleteCafeType();
  //   }
  // }
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

  player.move();
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
