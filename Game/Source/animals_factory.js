

// animals_factory.js contains the makeAnimal factory function.
//
//
// The animal class makes animals and governs their behavior. This file also
// contains lists of animal properties such as diet, land type, behavior type, etc.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin

Game.prototype.makeAnimal = function(animal_type, pen) {
  let self = this;

  let animal = new PIXI.Container();
  animal.height_container = new PIXI.Container();
  animal.addChild(animal.height_container);

  animal.pen = pen;
  animal.type = animal_type;

  animal.animated = (animal.type in animated_animals);

  animal.sprite = null;
  let filename = animal.type.toLowerCase();
  if (animals[animal_type].variations > 1) filename += "_" + Math.ceil(Math.random() * animals[animal_type].variations);
  console.log("ANIMAL FILENAME " + filename);
  var sheet = PIXI.Loader.shared.resources["Art/Animals/" + filename + ".json"].spritesheet;
  animal.sprite = new PIXI.AnimatedSprite(sheet.animations[filename]);
  animal.sprite.scale.set(animal_scale, animal_scale);
  animal.sprite.anchor.set(0.5,0.75);

  animal.height_container.addChild(animal.sprite);

  if (animals[animal.type].movement == "walk_and_stand"
    || animals[animal.type].movement == "arboreal"
    || animals[animal.type].movement == "walk_and_swim") {
    animal.second_sprite = new PIXI.AnimatedSprite(sheet.animations[animals[animal.type].movement]);
    animal.second_sprite.scale.set(animal_scale, animal_scale);
    animal.second_sprite.anchor.set(0.5,0.75);

    animal.height_container.addChild(animal.second_sprite);
    animal.second_sprite.visible = false;
  }

  animal.movement = animals[animal.type].movement;

  animal.still_frames = animals[animal.type].still_frames;

  if (animal.movement == "arboreal") {
    animal.arboreal_state = "on_ground";
    animal.last_arboreal = self.markTime();
    animal.arboreal_duration = 0;
  }

  if (pen.land == "water" || pen.pond != null) {
    animal.water_mask = new PIXI.Graphics();
    animal.water_mask.beginFill(water_color);
    animal.water_mask.drawRect(-128, -5, 256, -384);
    animal.water_mask.endFill();
    animal.height_container.addChild(animal.water_mask);
    if (pen.land == "water") {
      animal.mask = animal.water_mask;
      animal.water_mask.visible = true;
      animal.height_container.y = 20;
    } else {
      animal.water_mask.visible = false;
      animal.height_container.y = 0;
    }
  }

  animal.delay = 0;
  animal.delay_time = null;

  animal.vx = land_speed_factor * animals[animal.type].speed;
  animal.vy = 0;
  animal.direction = 1;

  animal.land_angle = (Math.random() * 360) * Math.PI / 180;

  animal.land_speed = land_speed_factor * animals[animal.type].speed;

  // if (animal.type == "CHEETAH") animal.land_speed = 4.8;
  // if (animal.type == "GAZELLE") animal.land_speed = 4.8;

  animal.undulation_counter = 0;
  animal.last_animated = this.markTime();

  animal.eating = false;
  animal.eating_time = this.markTime();
  animal.eating_target = null;

  animal.prepping_walk = 0;

  animal.update = function() {

    animal.eating_target = null;
    for (let j = 0; j < self.foods.length; j++) {
      let food = self.foods[j];
      if (food.status == "ground" && food.animal_target == animal.type) {
        animal.eating_target = food;
      }
    }

    for (let j = 0; j < self.foods.length; j++) {
      let food = self.foods[j];
      if (food.status == "ground" && (animal.movement != "fly" || animal.sprite.y == 0) &&
        distance(animal.x, animal.y + animal.sprite.y, food.x, food.y) < 70) {

        if (animal.animated) animal.stopMoving(false);

        if (self.timeSince(animal.eating_time) > 500) {
          // take a bite!
          animal.eating_time = self.markTime();
          if (distance(self.player.x, self.player.y, animal.x, animal.y) < 1000) soundEffect("chomp_" + Math.ceil(Math.random() * 2));
          if (food.currentFrame < 2) {
            food.gotoAndStop(food.currentFrame + 1);
          } else if (food.currentFrame == 2) {
            food.status = "dead";
            food.visible = false;
            game.dollar_bucks += 1;
            game.updateAnimalCount();
            // Save triggered by auto-save timer (feeding is frequent)
          }
          animal.shake = self.markTime();

          let b = animal.global_mouth_coords();
      
          let food_shard = new PIXI.Graphics();
          if (food.type == "greens" || food.type == "bamboo") {
            food_shard.beginFill(greens_color);
          } else if (food.type == "steak" || food.type == "fish" || food.type == "micro") {
            food_shard.beginFill(steak_color);
          } else if (food.type == "fruit") {
            food_shard.beginFill(fruit_color);
          }
          
          food_shard.drawPolygon([
            -3, -3 - 100,
            2 + 2 * Math.random(), -2 - 2 * Math.random() - 100,
            2 + 2 * Math.random(), 2 + 2 * Math.random() - 100,
            -2 - 2 * Math.random(), 2 + 2 * Math.random() - 100,
            -3, -3 - 100,
          ]);
          food_shard.position.set(b[0], b[1] + 100);
          food_shard.endFill();

          food_shard.vx = -1 - 1.5 * Math.random();
          if (animal.direction < 0) food_shard.vx *= -1;
          food_shard.vy = 0;
          food_shard.gravity = 1;
          food_shard.floor = b[1] + 50 + 100;
          food_shard.parent = self.map.decoration_layer;
          self.map.decoration_layer.addChild(food_shard);
          self.decorations.push(food_shard);

          self.drops.push(food_shard);

          delay(function() {
            food_shard.parent.removeChild(food_shard);
            food_shard.status = "dead";
          }, 500);

        }

        break;
      }
    }

    if (animal.delay > 0 && self.timeSince(animal.delay_time) > animal.delay) {
      animal.delay = 0;
      animal.delay_time = null;
    }

    if (animal.movement == "arboreal" && animal.arboreal_state == "in_tree" 
      && self.timeSince(animal.last_arboreal) > animal.arboreal_duration) {
      
      if (distance(animal.x, animal.y, self.player.x, self.player.y) < 1000) soundEffect("tree_shake");
      animal.tree.shake = self.markTime();


      animal.sprite.visible = true;
      animal.second_sprite.visible = false;
      animal.sprite.gotoAndStop(0);
      animal.sprite.x = animal.second_sprite.x;
      animal.sprite.y = animal.second_sprite.y;
      if (Math.cos(animal.land_angle) < 0) {
        animal.direction = -1;
        animal.sprite.scale.set(-animal_scale, animal_scale);
      } else {
        animal.direction = 1;
        animal.sprite.scale.set(animal_scale, animal_scale);
      }

      animal.arboreal_duration = 0;
      animal.arboreal_state = "jumping_down";

      new TWEEN.Tween(animal.sprite)
        .to({x: 0, y: 0})
        .duration(300)
        .easing(TWEEN.Easing.Quadratic.In)
        .start()
        .onComplete(function() {
          animal.arboreal_state = "on_ground";
          animal.tree = null;
          animal.sprite.animationSpeed = animated_animals[animal.type];
          animal.sprite.play();
          animal.last_arboreal = self.markTime();
        });      
    }

    if (animals[animal.type].last_sound == null || self.timeSince(animals[animal.type].last_sound) > animals[animal.type].sound_delay) {
      let px = self.player.x;
      let py = self.player.y;
      if (self.zoo_mode == "train_ride" || self.zoo_mode == "train_control" || self.zoo_mode == "train_fade") {
        px = self.trains[1].x;
        py = self.trains[1].y - 150;
      }
      if (distance(px, py, animal.x, animal.y) < 1000) {
        if (Math.random() > 0.65) {
          soundEffect(animals[animal.type].sound);
          animals[animal.type].sound_delay = 3000 + Math.random() * 11000;
          animals[animal.type].last_sound = self.markTime();
        }
      }
    }

    if (animal.delay == 0 && animal.prepping_walk == 2 && animal.eating == false && animal.movement == "walk_and_stand") {
      animal.second_sprite.visible = true;
      animal.sprite.visible = false;
      animal.second_sprite.gotoAndStop(0);
      animal.second_sprite.animationSpeed = animated_animals[animal.type];
      animal.second_sprite.loop = false;
      animal.second_sprite.play();
      animal.prepping_walk = 1;
      animal.second_sprite.onComplete = function() {
        animal.prepping_walk = 0;
        // animal.second_sprite.gotoAndStop(0);
      }
    }

    if (animal.delay == 0 && animal.eating == false && animal.prepping_walk == 0) {
      
      // if (animal.movement == "bounce") {
      //   //animal.sprite.x += animal.vx;
      //   animal.sprite.y += animal.vy;
      //   animal.move();

      //   let outside = false;
      //   for (let a = 0; a < 360; a += 45) {
      //     let p = [animal.x + 42 * Math.cos(a * Math.PI / 180), animal.y + 42 * Math.sin(a * Math.PI / 180)];
      //     if(!pointInsidePolygon(p, pen.polygon)) {
      //       outside = true;
      //     }
      //   }
      //   if (outside) {
      //     animal.y -= animal.land_speed * Math.sin(animal.land_angle);
      //     animal.x -= animal.land_speed * Math.cos(animal.land_angle);

      //     animal.land_angle = (Math.random() * 360) * Math.PI / 180;          
      //   }

      //   // animation test for bouncers
      //   if (animal.animated) {
      //     if (self.timeSince(animal.last_animated) > walk_frame_time) {
      //       if (animal.sprite.currentFrame == 0) {
      //         animal.sprite.gotoAndStop(1);
      //         // animal.vy -= (0.5 + 0.55 * Math.random())
      //       } else if (animal.sprite.currentFrame == 1) {
      //         animal.sprite.gotoAndStop(0);
      //         // animal.vy -= (0.2 + 0.3 * Math.random())
      //       }
      //       animal.last_animated = self.markTime();
      //     }
      //   }

      //   if (animal.sprite.y >= 0) {
      //     animal.vy = -3.6;
      //     if (animal.type == "KANGAROO" || animal.type == "FROG") animal.vy = -5;
      //     if (animal.type == "SLOTH") animal.vy = -2.4;
      //     animal.sprite.y = 0;

      //     if(Math.random() < 0.05) {
      //       if (animal.animated) animal.stopMoving(false);

      //       if (Math.random() < 0.75) animal.maybeJumpIntoATree();

      //       if (animal.movement != "arboreal" || animal.arboreal_state == "on_ground") {
      //         animal.maybeChangeDirection();
      //       }
      //     }

      //     if (Math.random() < 0.1) animal.maybeJumpIntoATree();
      //   } else {
      //     animal.vy += 0.6;
      //     if (animal.type == "SLOTH") animal.vy -= 0.3;
      //   }
      // }


      if (animal.movement == "jump") {
        animal.sprite.y += animal.vy;
        if (!animal.still_frames.includes(animal.sprite.currentFrame)) {
          animal.move();
        }
        
        let outside = false;
        for (let a = 0; a < 360; a += 45) {
          let p = [animal.x + 42 * Math.cos(a * Math.PI / 180), animal.y + 42 * Math.sin(a * Math.PI / 180)];
          if(!pointInsidePolygon(p, pen.polygon)) {
            outside = true;
          }
        }
        if (outside) {
          animal.y -= animal.land_speed * Math.sin(animal.land_angle);
          animal.x -= animal.land_speed * Math.cos(animal.land_angle);

          animal.land_angle = (Math.random() * 360) * Math.PI / 180;          
        }

        if (animal.animated && !animal.sprite.playing) {
          animal.sprite.gotoAndStop(0);
          animal.sprite.animationSpeed = animated_animals[animal.type];
          animal.sprite.play();
        } else {
          if (animal.sprite.currentFrame == 0) {
            if (Math.random() < 0.15) {
              animal.stopMoving(true);
              animal.maybeChangeDirection();
            }


          }
        }
      }


      if (animal.movement == "walk" || animal.movement == "walk_and_stand" 
        || animal.movement == "walk_and_swim"
        || (animal.movement == "arboreal" && animal.arboreal_state == "on_ground")) {
        animal.sprite.y += animal.vy;
        animal.move();

        let outside = false;
        for (let a = 0; a < 360; a += 45) {
          let p = [animal.x + 42 * Math.cos(a * Math.PI / 180), animal.y + 42 * Math.sin(a * Math.PI / 180)];
          if(!pointInsidePolygon(p, pen.polygon)) {
            outside = true;
          }
        }
        if (outside) {
          animal.y -= animal.land_speed * Math.sin(animal.land_angle);
          animal.x -= animal.land_speed * Math.cos(animal.land_angle);

          animal.land_angle = (Math.random() * 360) * Math.PI / 180;          
        }

        
        if (animal.movement != "walk_and_swim") {
          if (animal.animated && !animal.sprite.playing) {
            if (animal.movement == "walk_and_stand") {
              animal.sprite.visible = true;
              animal.second_sprite.visible = false;
            }

            // This starts the main animation for regular animals
            animal.sprite.gotoAndStop(dice(animal.sprite.totalFrames));
            animal.sprite.animationSpeed = animated_animals[animal.type];
            animal.sprite.play();
          }
        }

        if (animal.movement == "walk_and_swim") {
          if (animal.animated && !animal.sprite.playing && !animal.second_sprite.playing) {
            if (pen.land == "water" ||
            (pen.pond != null && pointInsidePolygon([animal.x, animal.y], pen.pond) == true)) {
              console.log("otter in water")
              animal.sprite.visible = false;
              animal.sprite.gotoAndStop(0);
              animal.second_sprite.visible = true;
              animal.second_sprite.gotoAndStop(dice(animal.second_sprite.totalFrames));
              animal.second_sprite.animationSpeed = animated_animals[animal.type];
              animal.second_sprite.play();
            } else {
              animal.sprite.visible = true;
              animal.second_sprite.visible = false;
              animal.second_sprite.gotoAndStop(0);
              animal.sprite.gotoAndStop(dice(animal.sprite.totalFrames));
              animal.sprite.animationSpeed = animated_animals[animal.type];
              animal.sprite.play();
            }
          }

          // Cover the switching case
          if (pen.land == "water" ||
            (pen.pond != null && pointInsidePolygon([animal.x, animal.y], pen.pond) == true)) {
            if (animal.sprite.visible == true) {
              animal.sprite.visible = false;
              animal.sprite.gotoAndStop(0);
              animal.second_sprite.visible = true;
              animal.second_sprite.gotoAndStop(dice(animal.second_sprite.totalFrames));
              animal.second_sprite.animationSpeed = animated_animals[animal.type];
              animal.second_sprite.play();
            }
          } else {
            if (animal.second_sprite.visible == true) {
              animal.sprite.visible = true;
              animal.second_sprite.visible = false;
              animal.second_sprite.gotoAndStop(0);
              animal.sprite.gotoAndStop(dice(animal.sprite.totalFrames));
              animal.sprite.animationSpeed = animated_animals[animal.type];
              animal.sprite.play();
            }
          }
        }

        let stop_chance = 0.005;
        if (animal.type == "MEERKAT") stop_chance = 0.0005;
        if(Math.random() < stop_chance) {
          if (animal.animated) animal.stopMoving(true);

          animal.maybeChangeDirection();
        }

        if (Math.random() < 0.05) animal.maybeJumpIntoATree();

        if (Math.random() < 0.05) {
          if (pen.land == "water" ||
            (pen.pond != null && pointInsidePolygon([animal.x, animal.y], pen.pond) == true)) {
            let droplet = new PIXI.Sprite(PIXI.Texture.from("Art/water_droplet.png"));
            droplet.scale.set(animal_scale * 0.75);
            droplet.anchor.set(0.5,0.5);
            droplet.position.set(animal.sprite.x, animal.sprite.y - 1);
            droplet.vx = -2 + 4 * Math.random();
            droplet.vy = -3 + -2 * Math.random();
            droplet.gravity = 1;
            droplet.floor = 10;
            animal.height_container.addChild(droplet);
            self.freefalling.push(droplet);
          }
        }
      }


      if (animal.movement == "undulate") {
        //animal.sprite.x += animal.vx;
        animal.move();

        if (animal.animated && !animal.sprite.playing) {
          // animal.sprite.currentFrame = dice(animal.sprite.totalFrames); 
          animal.sprite.gotoAndStop(dice(animal.sprite.totalFrames));
          //if (animated_animals[animal.type] == 1) {
          animal.sprite.animationSpeed = animated_animals[animal.type];
          //}
          animal.sprite.play();
        }

        let outside = false;
        for (let a = 0; a < 360; a += 45) {
          let p = [animal.x + 42 * Math.cos(a * Math.PI / 180), animal.y + 21 * Math.sin(a * Math.PI / 180)];
          if(!pointInsidePolygon(p, pen.polygon)) {
            outside = true;
          }
        }
        if (outside) {
          animal.y -= animal.land_speed * Math.sin(animal.land_angle);
          animal.x -= animal.land_speed * Math.cos(animal.land_angle);

          animal.land_angle = (Math.random() * 360) * Math.PI / 180;          
        }

        animal.undulation_counter += 1;

        animal.sprite.y = 3 * Math.sin(Math.PI * animal.undulation_counter / 16);

        if (Math.abs(animal.sprite.y) < 0.0005) {
          if(Math.random() < 0.1) {
            if (animal.animated) animal.stopMoving(false);

            animal.maybeChangeDirection();
          }
        }
      }


      if (animal.movement == "fly") {
        animal.sprite.x += animal.vx;
        animal.sprite.y += animal.vy;

        if (animal.sprite.y >= 0) {
          
          if(Math.random() < 0.5) {
            animal.sprite.y = 0;
            animal.vy = 0;

            if (animal.animated) animal.stopMoving(false);
          } else {
            animal.sprite.y -= 18;
            animal.vy = -1.8;
          }
        } else {
          if (animal.animated && !animal.sprite.playing) {
            animal.sprite.gotoAndStop(dice(animal.sprite.totalFrames));
            animal.sprite.animationSpeed = animated_animals[animal.type];
            animal.sprite.play();
          }

          animal.vy += -0.6 + Math.random() * 1.2;
          if (animal.sprite.y < -300) {
            animal.vy += 0.6;
          }
        }

        if (animal.vx > 0 && animal.sprite.x >= 120) {
          animal.direction = -1;
          animal.vx *= -1;
          animal.sprite.scale.set(-animal_scale, animal_scale);
        } else if (animal.vx < 0 && animal.sprite.x <= -120) {
          animal.direction = 1;
          animal.vx *= -1;
          animal.sprite.scale.set(animal_scale, animal_scale);
        }
      }


      animal.height_container.y = 0;
      if ((animal.water_mask != null) && 
        (pen.land == "water" || (pen.pond != null && pointInsidePolygon([animal.x, animal.y], pen.pond) == true))) {
        animal.mask = animal.water_mask;
        animal.water_mask.visible = true;
        animal.height_container.y = 20;
      } else if (animal.water_mask != null) {
        animal.mask = null;
        animal.water_mask.visible = false;
        animal.height_container.y = 0;
      }

      if (pen.terrace != null && pen.terrace.length > 0) {
        let height = 0;
        for (let k = 0; k < pen.terrace.length; k++) {
          let terrace = pen.terrace[k];
          if (pointInsidePolygon([animal.x, animal.y], terrace)) {
            height += edging_depth;
          }
        }
        animal.height_container.y -= height;
      }
    }
  }


  animal.stopMoving = function(alert_others=false) {
    // HACKS HACKS I SAY
    if (alert_others && animal.type == "MEERKAT") {
      for (let i = 0; i < animal.pen.animal_objects.length; i++) {
        let other_animal = animal.pen.animal_objects[i];
        if (other_animal.type == "MEERKAT") other_animal.stopMoving(false);
      } 
      return;
    }

    animal.delay = 500 + 2000 * Math.random();
    if (animal.type == "MEERKAT") animal.delay += 500 * Math.random() + 2000;
    animal.delay_time = self.markTime();

    animal.sprite.gotoAndStop(0);

    if (animal.movement == "walk_and_stand") {

      if (Math.cos(animal.land_angle) < 0) {
        animal.direction = -1;
        animal.second_sprite.scale.set(-animal_scale, animal_scale);
      } else {
        animal.direction = 1;
        animal.second_sprite.scale.set(animal_scale, animal_scale);
      }

      animal.second_sprite.gotoAndStop(0);
      animal.second_sprite.x = animal.sprite.x;
      animal.second_sprite.y = animal.sprite.y;
      animal.sprite.visible = false;
      animal.second_sprite.visible = true;
      animal.second_sprite.gotoAndStop(0);
      animal.prepping_walk = 2;
    }
  }


  animal.move = function() {
    animal.y += animal.land_speed * Math.sin(animal.land_angle);
    animal.x += animal.land_speed * Math.cos(animal.land_angle);

    if (Math.cos(animal.land_angle) < 0) {
      animal.direction = -1;
      animal.sprite.scale.set(-animal_scale, animal_scale);
    } else {
      animal.direction = 1;
      animal.sprite.scale.set(animal_scale, animal_scale);
    }
  }


  animal.maybeChangeDirection = function() {
    let dice = Math.random();

    if ((animal.eating_target == null && dice < 0.5)
      || (animal.eating_target != null && dice < 0.25)) {
      animal.land_angle = (Math.random() * 360) * Math.PI / 180;
    } else if (animal.eating_target != null && dice >= 0.25 && dice < 0.75) {
      animal.land_angle = Math.atan2(animal.eating_target.position.y - animal.y, animal.eating_target.position.x - animal.x);
    }
  }

  animal.maybeJumpIntoATree = function() {
    if (animal.movement == "arboreal" && animal.arboreal_state == "on_ground") {
      if (self.timeSince(animal.last_arboreal) < 1500) {
        return;
      }

      contact_points = [];
      for (let p = 0; p < animal.pen.decoration_objects.length; p++) {
        let decoration = animal.pen.decoration_objects[p];
        if (decoration.type == "tree" 
          && distance(decoration.x, decoration.y, animal.x, animal.y) < arboreal_jump_distance
          && Math.abs(decoration.x - animal.x) < Math.abs(decoration.y - animal.y) * 0.9
          && animal.y < decoration.y + 80) {
          for (let c = 0; c < tree_touch_points[animal.type][decoration.tree_number].length; c++) { // hey, c++
            let cling_point = tree_touch_points[animal.type][decoration.tree_number][c];
            if ((cling_point[0] > 0 && animal.x > decoration.x)
              || (cling_point[0] < 0 && animal.x < decoration.x)) {
              contact_points.push([decoration, cling_point[0], cling_point[1]]);
            }
          }
        }
      }

      if (contact_points.length > 0) {
        let contact_point = pick(contact_points);
        animal.arboreal_state = "in_tree";
        if (distance(animal.x, animal.y, self.player.x, self.player.y) < 1000) soundEffect("jump");
        animal.last_arboreal = self.markTime();
        animal.arboreal_duration = 3000 + Math.random() * animals[animal.type].tree_time;
        animal.tree = contact_point[0];

        animal.sprite.gotoAndStop(0);

        if (contact_point[1] > 0) {
          animal.direction = -1;
          animal.sprite.scale.set(-animal_scale, animal_scale);
        } else {
          animal.direction = 1;
          animal.sprite.scale.set(animal_scale, animal_scale);
        }

        new TWEEN.Tween(animal)
          .to({x: contact_point[0].x, y: contact_point[0].y + 5})
          .duration(300)
          .easing(TWEEN.Easing.Quadratic.In)
          .start();
        new TWEEN.Tween(animal.sprite)
          .to({x: contact_point[1], y: -1 * contact_point[2] - 5})
          .duration(300)
          .easing(TWEEN.Easing.Quadratic.In)
          .start()
          .onComplete(function() {
            if (distance(animal.x, animal.y, self.player.x, self.player.y) < 1000) soundEffect("tree_shake");
            contact_point[0].shake = self.markTime();

            animal.sprite.visible = false;
            animal.second_sprite.visible = true;
            animal.second_sprite.gotoAndStop(0);
            animal.second_sprite.x = animal.sprite.x;
            animal.second_sprite.y = animal.sprite.y;
            // animal.second_sprite.scale.set(-animal_scale, animal_scale);
            // if (Math.cos(animal.land_angle) < 0) {
            //   animal.direction = -1;
            //   animal.second_sprite.scale.set(-animal_scale, animal_scale);
            // } else {
            //   animal.direction = 1;
            //   animal.second_sprite.scale.set(animal_scale, animal_scale);
            // }
          });
      }
    }
  }

  animal.global_butt_coords = function() {
    // Find coords (say for a mouth or a butt) relative to the
    // anchor point (0.5, 0.75) in a 512x512 animal sprite
    let butt = animals[animal.type].butt;
    if (animal.movement == "arboreal" && animal.second_sprite.visible) {
      butt = animals[animal.type].arboreal_contact;
    }
    if (animal.direction >= 0) return [animal.x + animal_scale * (animal.sprite.x + butt[0] - 256), animal.y + animal_scale * (animal.sprite.y + butt[1] - 384)];
    if (animal.direction < 0) return [animal.x + animal_scale * (animal.sprite.x + 256 - butt[0]), animal.y + animal_scale * (animal.sprite.y + butt[1] - 384)];
  }

  animal.global_mouth_coords = function() {
    // Find coords (say for a mouth or a butt) relative to the
    // anchor point (0.5, 0.75) in a 512x512 animal sprite
    let mouth = animals[animal.type].mouth;
    if (animal.direction >= 0) return [animal.x + animal_scale * (animal.sprite.x + mouth[0] - 256), animal.y + animal_scale * (animal.sprite.y + mouth[1] - 384)];
    if (animal.direction < 0) return [animal.x + animal_scale * (animal.sprite.x + 256 - mouth[0]), animal.y + animal_scale * (animal.sprite.y + mouth[1] - 384)];
  }


  // The "visible" property is used by the system, and I need several different things to feed into it,
  // such as culling, and whether something should be hidden from view.
  // So I've made hidden and culled into properties that can be controlled independently.
  animal.hidden = false;
  animal.culled = false;

  animal.computeVisibility = function() {
    if (animal.hidden || animal.culled) {
      animal.visible = false;
    } else {
      animal.visible = true;
    }
  }

  animal.hide = function() {
    animal.hidden = true;
    animal.computeVisibility();
  }

  animal.show = function() {
    animal.hidden = false;
    animal.computeVisibility();
  }

  animal.computeCulling = function(x, y) {
    if(game.map_visible == true || (Math.abs(x - animal.x) < 900 && Math.abs(y - (animal.y - 128)) < 700)) {
      animal.culled = false;
    } else {
      animal.culled = true;
    }
    animal.computeVisibility();
  }

  console.log(animal);
  return animal;
}