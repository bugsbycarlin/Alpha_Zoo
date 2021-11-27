
//
// animal_pop.js does a cute animal popping graphic.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//


let pop_bg = 0xa4bf79




Game.prototype.initializeAnimalPop = function() {
  var self = this;
  var screen = this.screens["animal_pop"];
  this.clearScreen(screen);
  console.log("initializing " + screen.name);


  // this.pop_bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
  this.pop_bg = new PIXI.Sprite(PIXI.Texture.from("Art/zoo_gradient.png"));
  this.pop_bg.scale.set(1.4, 1.4);
  this.pop_bg.angle = 180;
  this.pop_bg.anchor.set(0.5,0.5);
  this.pop_bg.position.set(this.width/2,this.height/2);
  // this.pop_bg.width = 1280;
  // this.pop_bg.height = 960;
  // this.pop_bg.tint = pop_bg;
  screen.addChild(this.pop_bg)

  this.animal_pop_list = Object.keys(animals);
  this.animal_pop_list.sort().reverse();

  this.animal_pop_positions = [];
  for (let i = 0; i < this.animal_pop_list.length; i++) {
    this.animal_pop_positions.push(230 + Math.random() * 360);
  }
  this.animal_pop_positions.sort().reverse();

  this.dropshadow_filter = new PIXI.filters.DropShadowFilter();
  this.dropshadow_filter.blur  = 2;
  this.dropshadow_filter.quality = 3;
  this.dropshadow_filter.alpha = 0.55;
  this.dropshadow_filter.distance = 8;
  this.dropshadow_filter.rotation = 45;

  this.animal_pop_board = new PIXI.Container();
  screen.addChild(this.animal_pop_board);

  
  this.animals_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 75, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  this.animals_text.tint = 0x000000;
  this.animals_text.anchor.set(0,0.5);
  this.animals_text.position.set(25, 63);


  console.log("what");
  this.animals_backing = new PIXI.Graphics();
  this.animals_backing.beginFill(0xFFFFFF, 1);
  let mwidth = 240;
  this.animals_backing.drawRoundedRect(-20, -20, mwidth + 180, 120, 20);
  for (let i = 0; i < mwidth + 200; i += 40 + Math.floor(Math.random() * 20)) {
    //this.animals_backing.drawRoundedRect(-20, -20, 500, 180, 20);
    this.animals_backing.drawCircle(i, 80 + 40 * Math.random() - 40 * (i / (mwidth + 200)), 50 + 30 * Math.random());
  }
  this.animals_backing.drawCircle(mwidth + 200, 10 + 30 * Math.random(), 20 + 30 * Math.random());
  this.animals_backing.endFill();
  this.animals_backing.filters = [this.dropshadow_filter];
  screen.addChild(this.animals_backing);
  screen.addChild(this.animals_text);

  this.animals_text.visible = false;
  this.animals_backing.visible = false;
  console.log("oka");


  this.words_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 75, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  this.words_text.tint = 0x000000;
  this.words_text.anchor.set(1,0.5);
  this.words_text.position.set(1280 - 25, 63);


  this.words_backing = new PIXI.Graphics();
  this.words_backing.beginFill(0xFFFFFF, 1);
  let mwidth2 = 200;
  this.words_backing.drawRoundedRect(1280 - 380, -20, mwidth2 + 180, 120, 20);
  for (let i = 0; i < mwidth2 + 200; i += 40 + Math.floor(Math.random() * 20)) {
    //this.words_backing.drawRoundedRect(-20, -20, 500, 180, 20);
    this.words_backing.drawCircle(1280 - i, 80 + 40 * Math.random() - 40 * (i / (mwidth2 + 200)), 50 + 30 * Math.random());
  }
  this.words_backing.drawCircle(1280 - (mwidth2 + 200), 10 + 30 * Math.random(), 20 + 30 * Math.random());
  this.words_backing.endFill();
  this.words_backing.filters = [this.dropshadow_filter];
  screen.addChild(this.words_backing);
  screen.addChild(this.words_text);

  this.words_text.visible = false;
  this.words_backing.visible = false;

  this.word_pop_list = [];
  for (let i = 0; i < menu_layout.length; i++) {
    this.word_pop_list.push(menu_layout[i][0]);
  }
  this.word_pop_list = this.word_pop_list.concat([
    "Ferris_Wheel/icon.png", "Ferris_Wheel/cart_icon.png", 
    "Cafe/icon.png", "color_icon.png", "map_icon.png",
    "poop.png", "Food/food.png",
  ]);
  // this.word_pop_list.sort().reverse();
  console.log(this.word_pop_list);

  this.animals_pop_length = this.animal_pop_list.length;
  this.words_pop_length = this.word_pop_list.length;

  delay(function() {
      self.pop_delay = 90;
      self.last_animal_pop = self.markTime();
  }, 1000);


}


Game.prototype.updateAnimalPop = function(diff) {
  var self = this;
  var screen = this.screens["animal_pop"];

  let fractional = diff / (1000/30.0);

  if (this.timeSince(this.last_animal_pop) > this.pop_delay && this.animal_pop_list.length > 0) {
    console.log("here");
    let animal_name = this.animal_pop_list.pop();

    let x = 100 + Math.random() * 1080;
    let y = this.animal_pop_positions[this.animal_pop_list.length];

    this.makeSmoke(this.animal_pop_board, x, y - 30, 1.8, 1.8);

    let animal = this.makeAnimal(animal_name, this.animal_pop_board);
    animal.position.set(x, y);
    this.animal_pop_board.addChild(animal);

    this.shakers.push(animal);
    animal.shake = this.markTime();

    this.animals_text.text = (this.animals_pop_length - this.animal_pop_list.length) + " ANIMALS!";

    // this.pop_delay -= 1;

    // if (!this.animals_backing.visible) {
    //   this.animals_backing.visible = true;
    //   this.animals_text.visible = true;
    // }

    this.last_animal_pop = this.markTime();
  }

  if (false && this.timeSince(this.last_animal_pop) > this.pop_delay && this.animal_pop_list.length == 0
    && this.word_pop_list.length > 0) {
    this.pop_delay = 90;
    let word = this.word_pop_list.pop();
    
    let x = 0;
    let y = 0;

    let glyph = null;
    if (this.words_pop_length - this.word_pop_list.length <= 7) {
      console.log(word);
      glyph = new PIXI.Sprite(PIXI.Texture.from("Art/" + word));
      glyph.scale.set(0.62, 0.62);
      glyph.anchor.set(0.5, 0.85);

      x = 100 + 154 * (this.words_pop_length - this.word_pop_list.length);
      y = 610 - 20 + 40 * Math.random();
    } else {
      word = word.toLowerCase().replace(" ","_");
      let sheet = PIXI.Loader.shared.resources["Art/Cafe/Food/" + word + ".json"].spritesheet
      glyph = new PIXI.AnimatedSprite(sheet.animations[word]);
      glyph.anchor.set(0.5, 0.5);

      x = 100 + 46 * (this.words_pop_length - 7 - this.word_pop_list.length);
      y = 650 - 20 + 40 * Math.random();
    }

    this.makeSmoke(this.animal_pop_board, x, y - 30, 1.8, 1.8);

    
    glyph.position.set(x, y);

    this.shakers.push(glyph);
    glyph.shake = this.markTime();

    this.animal_pop_board.addChild(glyph);

    this.words_text.text = (this.words_pop_length + this.animals_pop_length - this.animal_pop_list.length - this.word_pop_list.length) + " WORDS!";

    // if (!this.words_backing.visible) {
    //   this.words_backing.visible = true;
    //   this.words_text.visible = true;
    // }

    this.last_animal_pop = this.markTime();
  }

  this.shakeThings();
  this.freeeeeFreeeeeFalling(fractional);
}


