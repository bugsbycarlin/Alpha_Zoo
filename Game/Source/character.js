
//
// The character class makes characters (player and NPC) and has methods
// for making them move around. Actual input/control is handled in screen_zoo.js.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var default_walk_speed = 6;
var walk_frame_time = 105;

var history_length = 8;

var directions = ["down", "left", "up", "right", "downleft", "upleft", "downright", "upright"]

Game.prototype.makeCharacter = function(character_name, subtype = "normal") {
  let character = new PIXI.Container();
  character.position.set(0,0);
  character.scale.set(0.72, 0.72);
  // map.addChild(character);

  character.type = "character";
  character.character_name = character_name;

  character.red_circle = new PIXI.Sprite(PIXI.Texture.from("Art/red_circle.png"));
  character.red_circle.anchor.set(0.5,0.78125);
  character.red_circle.position.set(0,0);
  character.red_circle.visible = false;
  character.addChild(character.red_circle);

  character.history = [];
  character.stuffies = [];

  character.shirt = null;
  character.glasses = null;

  if (subtype == "normal") {
    let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + ".json"].spritesheet;
    character.character_sprite = {};
    for(let i = 0; i < 8; i++) {
      character.character_sprite[directions[i]] = new PIXI.AnimatedSprite(sheet.animations[directions[i]]);
      character.character_sprite[directions[i]].anchor.set(0.5,0.78125);
      character.character_sprite[directions[i]].position.set(0, 0);
      character.addChild(character.character_sprite[directions[i]]);
      character.character_sprite[directions[i]].visible = false;
    }

    character.current_image = "down_0";
    character.character_sprite["down"].visible = true;
  } else if (subtype == "stuffed") {
    character.character_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/Stuffed_Animals/" + character_name + ".png"));
    character.character_sprite.anchor.set(0.5,0.75);
    character.character_sprite.position.set(0,0);
    character.scale.set(0.75,0.75);
    character.addChild(character.character_sprite);
  }

  character.direction = "down";
  character.walk_frame_time = walk_frame_time;
  character.last_image_time = null;
  character.walk_speed = default_walk_speed;

  character.move = function() {

    //character.direction = character.level.testWalk(character, character.direction);

    if (character.direction != null) {
      character.history.push([character.x, character.y, character.direction]);
      if (character.history.length > history_length) {
        character.history.shift();
      }
    }

    if (character.direction == "upright") {
      character.y -= 0.707 * character.walk_speed;
      character.x += 0.707 * character.walk_speed; 
    } else if (character.direction == "upleft") {
      character.y -= 0.707 * character.walk_speed;
      character.x -= 0.707 * character.walk_speed;
    } else if (character.direction == "downright") {
      character.y += 0.707 * character.walk_speed;
      character.x += 0.707 * character.walk_speed;
    } else if (character.direction == "downleft") {
      character.y += 0.707 * character.walk_speed;
      character.x -= 0.707 * character.walk_speed;
    } else if (character.direction == "down") {
      character.y += character.walk_speed;
    } else if (character.direction == "up") {
      character.y -= character.walk_speed;
    } else if (character.direction == "left") {
      character.x -= character.walk_speed;
    } else if (character.direction == "right") {
      character.x += character.walk_speed;
    }

    if (character.direction != null) {
      character.walkAnimation();
    }

    for (let i = 0; i < character.stuffies.length; i++) {
      if (i == 0) character.stuffies[i].follow(character);
      else character.stuffies[i].follow(character.stuffies[i-1]);
    }
  }

  if (subtype == "normal") {
    character.walkAnimation = function() {
      for(let i = 0; i < 8; i++) {
        if (directions[i] == character.direction) {
          character.character_sprite[directions[i]].visible = true;
          if (character.shirt != null) character.shirt[directions[i]].visible = true;
          if (character.glasses != null) character.glasses[directions[i]].visible = true;
        } else {
          character.character_sprite[directions[i]].visible = false;
          if (character.shirt != null) character.shirt[directions[i]].visible = false;
          if (character.glasses != null) character.glasses[directions[i]].visible = false;
        }
      }

      var f0 = character.direction + "_0";
      var f1 = character.direction + "_1";
      if (character.current_image != f0 && character.current_image != f1) {
        character.current_image = f0
        character.last_image_time = Date.now();
      } else if (character.last_image_time == null) {
        character.last_image_time = Date.now();
      } else if (Date.now() - character.last_image_time > character.walk_frame_time) {
        if (character.current_image == f0) {
          character.current_image = f1;
        } else {
          character.current_image = f0;
        }
        character.last_image_time = Date.now();
      }

      if (character.character_sprite[character.direction].currentFrame == 0 && character.current_image == f1) {
        character.character_sprite[character.direction].gotoAndStop(1);
        if (character.shirt != null) character.shirt[character.direction].gotoAndStop(1);
        if (character.glasses != null) character.glasses[character.direction].gotoAndStop(1);
      } else if (character.character_sprite[character.direction].currentFrame == 1 && character.current_image == f0) {
        character.character_sprite[character.direction].gotoAndStop(0);
        if (character.shirt != null) character.shirt[character.direction].gotoAndStop(0);
        if (character.glasses != null) character.glasses[character.direction].gotoAndStop(0);
      }
    }

    character.updateDirection = function() {
      for(let i = 0; i < 8; i++) {
        if (directions[i] == character.direction) {
          character.character_sprite[directions[i]].visible = true;
          if (character.shirt != null) character.shirt[directions[i]].visible = true;
          if (character.glasses != null) character.glasses[directions[i]].visible = true;
        } else {
          character.character_sprite[directions[i]].visible = false;
          if (character.shirt != null) character.shirt[directions[i]].visible = false;
          if (character.glasses != null) character.glasses[directions[i]].visible = false;
        }
      }

      character.character_sprite[character.direction].gotoAndStop(0);
      if (character.shirt != null) character.shirt[character.direction].gotoAndStop(0);
      if (character.glasses != null) character.glasses[character.direction].gotoAndStop(0);
    }
  } else if (subtype == "stuffed") {
    // empty, no walk animation and no updateDirection
    character.walkAnimation = function() {
    }

    character.updateDirection = function() {
    }
  }

  character.follow = function(follow_character) {
    if (follow_character.history.length >= history_length) {
      var element = follow_character.history[0];
      character.x = element[0];
      character.y = element[1];
      character.direction = element[2];
      if (follow_character.direction != null) {
        if (character.direction != null) {
          character.history.push([element[0], element[1], element[2]]);
          if (character.history.length > history_length) {
            character.history.shift();
          }
        }

        character.walkAnimation();
      }
    }
  }

  character.addStuffie = function(stuffed_animal, decorations_list) {
    let stuffie = game.makeCharacter(stuffed_animal, "stuffed");
    stuffie.position.set(character.x + (character.stuffies.length + 1) * 50, character.y)
    stuffie.scale.set(character.scale.x * 0.65,character.scale.y * 0.65);
    character.stuffies.push(stuffie);
    decorations_list.push(stuffie);
    if (character.stuffies.length == 1) stuffie.follow(character);
    else {
      stuffie.follow(character.stuffies[character.stuffies.length-2]);
    }

    game.makeSmoke(character, stuffie.x - character.x + 10, stuffie.y - character.y - 40, 1.8, 1.8);
  }

  character.addShirt = function(shirt_color) {
    if (character.shirt != null) {
      for(let i = 0; i < 8; i++) {
        character.removeChild(character.shirt[directions[i]]);
        character.shirt[directions[i]].destroy();
      }
    }

    let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + "_shirt.json"].spritesheet;
    character.shirt = {};
    character.shirt_color = shirt_color;
    for(let i = 0; i < 8; i++) {
      character.shirt[directions[i]] = new PIXI.AnimatedSprite(sheet.animations[directions[i]]);
      character.shirt[directions[i]].anchor.set(0.5,0.78125);
      character.shirt[directions[i]].position.set(0, 0);
      character.addChild(character.shirt[directions[i]]);
      character.shirt[directions[i]].tint = shirt_color
      character.shirt[directions[i]].visible = false;
    }

    character.updateDirection();

    game.makeSmoke(character, 0, 0, 1.8, 1.8);
    // console.log(character.shirt);
    // console.log(character.direction);
    // if (character.direction != null) character.shirt[character.direction].visible = true;
  }

  character.addGlasses = function(glasses_type) {
    if (character.glasses != null) {
      for(let i = 0; i < 8; i++) {
        character.removeChild(character.glasses[directions[i]]);
        character.glasses[directions[i]].destroy();
      }
    }

    let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + "_" + glasses_type + ".json"].spritesheet;
    character.glasses = {};
    character.glasses_type = glasses_type;
    for(let i = 0; i < 8; i++) {
      character.glasses[directions[i]] = new PIXI.AnimatedSprite(sheet.animations[directions[i]]);
      character.glasses[directions[i]].anchor.set(0.5,0.78125);
      character.glasses[directions[i]].position.set(0, 0);
      character.addChild(character.glasses[directions[i]]);
      character.glasses[directions[i]].visible = false;
    }

    character.updateDirection();

    game.makeSmoke(character, 0, 0, 1.8, 1.8);
    // console.log(character.shirt);
    // console.log(character.direction);
    // if (character.direction != null) character.shirt[character.direction].visible = true;
  }

  return character;
}
