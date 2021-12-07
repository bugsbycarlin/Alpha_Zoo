
//
// The ferris wheel class makes a ferris wheel and has methods for controlling it.
// Actual ferris wheel sequence is handled in screen_zoo.js.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

// https://www.schemecolor.com/pastel-rainbow.php
let ferris_wheel_colors = [
  0xCC99C9, // purple,
  0x9EC1CF, // blue,
  0x9EE09E, // green,
  0xFDFD97, // yellow,
  0xFEB144, // orange,
  0xFF6663, // red,
  0xFEDCFF, // pink,
]



Game.prototype.makeFerrisWheel = function(pen) {
  let self = this;

  shuffleArray(ferris_wheel_colors);
  let fwc = ferris_wheel_colors;

  let ferris_wheel = new PIXI.Container();
  let fw = ferris_wheel;

  fw.pen = pen;

  fw.moving = false;
  fw.ride_number = 0;

  fw.sky = new PIXI.Sprite(PIXI.Texture.from("Art/sky.png"));
  fw.sky.visible = false;
  fw.sky.anchor.set(0.5, 1);
  fw.sky.scale.set(1.4,1.1);
  fw.sky.position.set(0, -1346 - 1100);
  fw.addChild(fw.sky);

  fw.wheel_shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/wheel.png"));
  fw.wheel_shadow.anchor.set(0.5, 0.5);
  fw.wheel_shadow.position.set(0, -1346 + 8); // 2370 - 1024 = 1346. 2370 is how far the base is from the center on the drawing.
  let c = PIXI.utils.hex2rgb(fwc[0]);
  let shadow_color = PIXI.utils.rgb2hex([c[0] * 0.8, c[1] * 0.8, c[2] * 0.8]);
  fw.wheel_shadow.tint = shadow_color
  fw.wheel_shadow.grey_color = 0xCCCCCC;
  fw.wheel_shadow.true_color = fw.wheel_shadow.tint;
  fw.addChild(fw.wheel_shadow);

  fw.wheel = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/wheel.png"));
  fw.wheel.anchor.set(0.5, 0.5);
  fw.wheel.position.set(0, -1346); // 2370 - 1024 = 1346. 2370 is how far the base is from the center on the drawing.
  fw.wheel.tint = fwc[0];
  fw.wheel.grey_color = 0xFFFFFF;
  fw.wheel.true_color = fw.wheel.tint;
  fw.addChild(fw.wheel);

  fw.cart_layer = new PIXI.Container();
  fw.addChild(fw.cart_layer);
  fw.riders = [];
  fw.carts = [];
  for (let i = 0; i < 12; i++) {
    fw.carts.push(new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/cart.png")));
    fw.carts[i].anchor.set(0.5, 0.0);
    fw.carts[i].position.set(
      0 + 850 * Math.cos(i * 30 * Math.PI / 180),
      -1346 - 850 * Math.sin(i * 30 * Math.PI / 180)
    );
    fw.carts[i].tint = fwc[1 + (i % 3)];
    fw.carts[i].grey_color = 0xFFFFFF;
    fw.carts[i].true_color = fw.carts[i].tint;
    fw.carts[i].fw_sort_depth = 1;

    if (i >= 7 && i <= 11 && i != 9) {
      let rider = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/Riders/rider_" + Math.floor(Math.random() * 6) + ".png")); //" + Math.floor(Math.random() * 8) + "
      rider.anchor.set(0.5,0.78125);
      rider.scale.set(0.72, 0.72);
      rider.seat = i;
      rider.position.set(
        0 + 850 * Math.cos(i * 30 * Math.PI / 180),
        -1346 - 850 * Math.sin(i * 30 * Math.PI / 180) + 186
      );
      rider.visible = false;
      fw.riders.push(rider);
      fw.cart_layer.addChild(rider);
    }

    fw.cart_layer.addChild(fw.carts[i]);
  }

  fw.base = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/base.png"));
  fw.base.anchor.set(0.5, 1.0);
  fw.base.tint = fwc[0];
  fw.base.grey_color = 0xFFFFFF;
  fw.base.true_color = fw.base.tint;
  fw.addChild(fw.base);

  fw.all_objects = fw.carts.concat([fw.base, fw.wheel, fw.wheel_shadow]);



  fw.addPlayer = function(player) {
    fw.player = player;
    fw.player.fw_sort_depth = 0;
    fw.player.direction = "right";
    fw.player.updateDirection();
    fw.player.position.set(
        0 + 850 * Math.cos(270 * Math.PI / 180),
        -1346 - 850 * Math.sin(270 * Math.PI / 180) + 186
      );
    while(fw.cart_layer.children[0]) {
      fw.cart_layer.removeChild(fw.cart_layer.children[0]);
    }
    fw.cart_layer.addChild(fw.player);
    for (let i = 0; i < fw.riders.length; i++) {
      fw.riders[i].visible = true;
      fw.cart_layer.addChild(fw.riders[i]);
    }
    for (let i = 0; i < 12; i++) {
      fw.cart_layer.addChild(fw.carts[i]);
    }
  }

  fw.removePlayer = function() {
    if (fw.player != null) {
      fw.player.position.set(fw.player.old_position[0], fw.player.old_position[1])
      fw.cart_layer.removeChild(fw.player);
      fw.player = null;
    }
  }

  fw.startMoving = function() {
    fw.wheel_angle = 0;
    fw.angular_velocity = 0;
    fw.angular_acceleration = 0.02;
    fw.max_angular_velocity = 0.4;
    fw.moving = true;
    fw.hideSoMuchStuff();
    fw.clunk_time = self.markTime();
    self.soundEffect("clunk");
  }

  fw.stopMoving = function() {
    new TWEEN.Tween(fw)
      .to({angular_velocity: 0})
      .duration(300)
      .start()
    fw.angular_acceleration = 0;
    fw.unhideTheStuff();
    
  }

  let sight_line = 2700;
  let decoration_sight_line = 2000;

  fw.hideSoMuchStuff = function() {
    for (let k = 0; k < total_ents; k++) {
      self.ents[k].visible = false;
    }

    for (let i = 0; i < self.npcs.length; i++) {
      self.npcs[i].visible = false;
    }

    for (let i = 0; i < self.zoo_pens.length; i++) {
      let pen = self.zoo_pens[i];
      if (pen.cy < fw.y - sight_line) {
        if (pen.animal_objects != null) {
          for (let j = 0; j < pen.animal_objects.length; j++) {
            pen.animal_objects[j].pre_ferris_visible = pen.animal_objects[j].visible;
            pen.animal_objects[j].visible = false;
          }
        }
        for (let j = 0; j < pen.decoration_objects.length; j++) {
          pen.decoration_objects[j].pre_ferris_visible = pen.decoration_objects[j].visible;
          pen.decoration_objects[j].visible = false;
        }
        if (pen.special == "CAFE") {
          pen.special_object.pre_ferris_visible = pen.special_object.visible;
          pen.special_object.visible = false;
        }
        if (pen.land_object != null) {
          pen.land_object.pre_ferris_visible = pen.land_object.visible;
          pen.land_object.visible = false;
        }
      }
    }

    for (let i = 0; i < self.decorations.length; i++) {
      if (self.decorations[i].y < fw.y - decoration_sight_line && self.decorations[i].type == "tree") {
        self.decorations[i].pre_ferris_visible = self.decorations[i].visible;
        self.decorations[i].visible = false;
      }
    }

    fw.sky.visible = true;
  }

  fw.unhideTheStuff = function() {

    for (let i = 0; i < self.npcs.length; i++) {
      self.npcs[i].visible = true;
    }

    for (let i = 0; i < self.zoo_pens.length; i++) {
      let pen = self.zoo_pens[i];
      if (pen.cy < fw.y - sight_line) {
        if (pen.animal_objects != null) {
          for (let j = 0; j < pen.animal_objects.length; j++) {
            pen.animal_objects[j].visible = pen.animal_objects[j].pre_ferris_visible;
          }
        }
        for (let j = 0; j < pen.decoration_objects.length; j++) {
          pen.decoration_objects[j].visible = pen.decoration_objects[j].pre_ferris_visible;
        }
        if (pen.special == "CAFE") {
          pen.special_object.visible = pen.special_object.pre_ferris_visible;
        }
        if (pen.land_object != null) {
          pen.land_object.visible = pen.land_object.pre_ferris_visible;
        }
      }
    }

    for (let i = 0; i < self.decorations.length; i++) {
      if (self.decorations[i].y < fw.y - decoration_sight_line && self.decorations[i].type == "tree") {
        self.decorations[i].visible = self.decorations[i].pre_ferris_visible;
      }
    }

    fw.sky.visible = false;
  }

  fw.reset = function() {
    fw.removePlayer();
    fw.wheel_angle = 0;
    fw.angular_velocity = 0;
    fw.moving = false;

    fw.wheel_shadow.angle = 0;
    fw.wheel.angle = 0;

    self.map.scale.set(1,1);

    for (let i = 0; i < fw.riders.length; i++) {
      fw.riders[i].visible = false;
      fw.riders[i].position.set(
        0 + 850 * Math.cos((fw.riders[i].seat * 30) * Math.PI / 180),
        -1346 - 850 * Math.sin((fw.riders[i].seat * 30) * Math.PI / 180) + 186
      );
    }

    for (let i = 0; i < 12; i++) {
      fw.carts[i].position.set(
        0 + 850 * Math.cos((i * 30) * Math.PI / 180),
        -1346 - 850 * Math.sin((i * 30) * Math.PI / 180)
      );
    }
  }
  
  fw.update = function(fractional) {
    if (fw.moving) {
      fw.last_angle = fw.wheel_angle;
      fw.wheel_angle += fw.angular_velocity * fractional;
      fw.angular_velocity += fw.angular_acceleration * fractional;
      if (fw.angular_velocity > fw.max_angular_velocity) fw.angular_velocity = fw.max_angular_velocity;

      fw.wheel_shadow.angle = -1 * fw.wheel_angle;
      fw.wheel.angle = -1 * fw.wheel_angle

      for (let i = 0; i < 12; i++) {
        fw.carts[i].position.set(
          0 + 850 * Math.cos((i * 30 + fw.wheel_angle) * Math.PI / 180),
          -1346 - 850 * Math.sin((i * 30 + fw.wheel_angle) * Math.PI / 180)
        );
      }

      for (let i = 0; i < fw.riders.length; i++) {
        fw.riders[i].position.set(
          0 + 850 * Math.cos((fw.riders[i].seat * 30 + fw.wheel_angle) * Math.PI / 180),
          -1346 - 850 * Math.sin((fw.riders[i].seat * 30 + fw.wheel_angle) * Math.PI / 180) + 186
        );
      }

      if (fw.player != null) {
        fw.player.position.set(
          0 + 850 * Math.cos((270 + fw.wheel_angle) * Math.PI / 180),
          -1346 - 850 * Math.sin((270 + fw.wheel_angle) * Math.PI / 180) + 186
        );

        if (fw.player.position.x > 30) {
          fw.player.direction = "right";
          fw.player.updateDirection();
        } else if (fw.player.position.x < -30) {
          fw.player.direction = "left";
          fw.player.updateDirection();
        }
      }

      // fw.sky.x = fw.player.position.x;

      if ((fw.wheel_angle % 360 < 90 || fw.wheel_angle % 360 > 300) && self.timeSince(fw.clunk_time) > 1000) {
        self.soundEffect("clunk");
        fw.clunk_time = self.markTime();
      }

       if (fw.last_angle % 360 < 100 && fw.wheel_angle % 360 >= 100) {
        if (self.music != null) {
          self.music.old_volume = self.music.volume;
          new TWEEN.Tween(self.music)
            .to({volume: 0.6 * self.music.old_volume})
            .duration(4000)
            .start()
        }
      }

      if (fw.last_angle % 360 < 120 && fw.wheel_angle % 360 >= 120) {
        console.log("here");
        self.soundEffect("breeze");
      }

      // Messing with Ferris Wheel zoom. Needs to be paired with making things
      // invisible and setting up the sky in a nicer way.
      // But this is good, basically.
      if (fw.wheel_angle % 360 > 90 && fw.wheel_angle % 360 < 270) {
        let scale_dip = 0.2 * (90 - Math.abs(180 - (fw.wheel_angle % 360))) / 90;
        self.map.scale.set(1 - scale_dip, 1 - scale_dip);
      } else {
        self.map.scale.set(1,1);
      }

      if (fw.last_angle % 360 < 240 && fw.wheel_angle % 360 >= 240) {
        // self.soundEffect("breeze");
        // self.music.volume = self.music.old_volume;
        if (self.music != null) {
          new TWEEN.Tween(self.music)
            .to({volume: self.music.old_volume})
            .duration(4000)
            .start()
        }
      }
    
    }
  }

  return ferris_wheel;
}