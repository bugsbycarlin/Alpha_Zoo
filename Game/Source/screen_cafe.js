
//
// screen_zoo.js runs the cafe scene.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.initializeCafe = function() {
  var self = this;
  var screen = this.screens["cafe"];
  this.clearScreen(screen);


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

  this.cafe_escape_text = new PIXI.Text("Escape", {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.cafe_escape_text.anchor.set(0,1);
  this.cafe_escape_text.position.set(100, this.height - 32);
  this.cafe_escape_text.alpha = 0.6;
  this.cafe_escape_text.visible = true;
  screen.addChild(this.cafe_escape_text);

  // make four diners.
  // diner zero is the player.
  this.cafe_diners = [];
  let cafe_diner_locations = [[1107,704], [1213, 485], [798, 827], [324, 829]];
  for (let i = 0; i < 4; i++) {
    let name = "brown_bear";
    if (i > 0) name = pick(npc_list);
    let diner = this.makeCharacter(name);
    diner.scale.set(1,1); // reset to larger scale
    diner.position.set(cafe_diner_locations[i][0],cafe_diner_locations[i][1]);
    diner.direction = "downleft";
    if (i == 3) diner.direction = "downright";
    diner.updateDirection();
    screen.addChild(diner);
    this.cafe_diners.push(diner);
  }

  // make four tables.
  // table zero is the player's table.
  this.cafe_tables = [];
  let cafe_table_locations = [[1070,800], [1183, 578], [759, 922], [355, 923]];
  for (let i = 0; i < 4; i++) {
    let table = new PIXI.Sprite(PIXI.Texture.from("Art/Cafe/table.png"));
    table.anchor.set(0.5, 0.7);
    table.scale.set(1, 1);
    table.position.set(cafe_table_locations[i][0],cafe_table_locations[i][1]);
    screen.addChild(table);
    this.cafe_tables.push(table);
  }


  this.cafe_food_glyphs = {};

  for (let i = 0; i < menu_layout.length; i++) {
    let layout = menu_layout[i];
    let glyph = new PIXI.Sprite(PIXI.Texture.from("Art/Cafe/Food/steak_placeholder.png"));
    glyph.anchor.set(0.5, 0.5);
    glyph.position.set(layout[1], layout[2]);
    screen.addChild(glyph);

    let white_text = new PIXI.Text(layout[0], {fontFamily: "Bebas Neue", fontSize: 66, fill: 0xFFFFFF, letterSpacing: 5, align: "left"});
    white_text.anchor.set(0,0.43);
    white_text.position.set(layout[1] + 64, layout[2]);
    screen.addChild(white_text);
  }
}


Game.prototype.cafeKeyDown = function(ev) {
  var self = this;
  var screen = this.screens["cafe"];

  let key = ev.key;

  if (key === "Escape") {
    this.player.visible = true;
    this.player.y += 150;
    this.map.position.set(640 - this.player.x * this.map.scale.x, 580 - this.player.y * this.map.scale.y);
    this.zoo_mode = "active";
    this.fadeScreens("cafe", "zoo", true);
    return;
  }
  


  
}


Game.prototype.updateCafe = function(diff) {
  var self = this;
  var screen = this.screens["cafe"];

  let fractional = diff / (1000/30.0);


}

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