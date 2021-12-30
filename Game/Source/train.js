
//
// Train.js contains everything to do with trains,
// train generation, and train management.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//


let train_max_speed = 6;

Game.prototype.addTrains = function() {
  this.trains = [];

  let track_position = (this.zoo_size + 1) * square_width / 2;
  // track_position = 5800;
  // track_position = 256*3;
  let train = this.makeTrain(this.map.decoration_layer, track_position);
}


Game.prototype.makeTrain = function(parent, track_position) {
  
  for (let i = 0; i < 4; i++) {
    let train = this.makeTrainCar(parent, i, pick(ferris_wheel_colors), (i == 0) ? "engine" : "car", track_position);
    this.decorations.push(train);
    this.trains.push(train);
  }
}


Game.prototype.rollTrains = function() {
  let self = this;

  for (let i = 0; i < this.trains.length; i++) {
    this.trains[i].status = "rolling";
  }

  this.zoo_mode = "train_ride";
  this.player.old_position = [this.player.position.x, this.player.position.y];

  new_decorations = [];
  for (let i = 0; i < this.decorations.length; i++) {
    if (this.decorations[i].character_name != "brown_bear"
      && (this.decorations[i].character_name == null || !this.decorations[i].character_name.includes("stuffed"))) {
      new_decorations.push(this.decorations[i]);
    }
  }
  this.decorations = new_decorations;
  this.sortLayer(this.map.decoration_layer, this.decorations);

  this.trains[1].passenger_layer.addChild(this.player);
  this.player.position.set(0, -100);

  this.ghost.visible = false;

  this.soundEffect("train_whistle");
  this.soundEffect("train_rolling");
}


Game.prototype.makeTrainCar = function(parent, number, color, type, track_position) {
  let self = this;

  let train = new PIXI.Container();

  train.parent = parent;
  train.parent.addChild(train);

  train.train_type = type
  
  train.color = color;

  train.status = "active";
  train.speed = 0;

  train.number = number;

  train.passenger_layer = new PIXI.Container();
  train.addChild(train.passenger_layer);

  train.connector_1 = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/connector.png"));
  train.connector_1.anchor.set(0.5, 0.5);
  train.connector_1.position.set(-112, -85);
  
  train.addChild(train.connector_1);

  if (type == "car") {
    train.connector_2 = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/connector.png"));
    train.connector_2.anchor.set(0.5, 0.5);
    train.connector_2.position.set(111, -85);
    train.connector_2.scale.set(-1,1);
    train.addChild(train.connector_2);
  }

  train.body = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_" + type + ".png"));
  train.body.anchor.set(0.5, 1.0);
  train.body.position.set(0, -40);
  train.body.tint = train.color;
  train.addChild(train.body);

  train.left_wheel_shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_wheel.png"));
  train.left_wheel_shadow.anchor.set(0.5, 0.5);
  train.left_wheel_shadow.position.set(-66, -41);
  train.addChild(train.left_wheel_shadow);

  train.left_wheel = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_wheel.png"));
  train.left_wheel.anchor.set(0.5, 0.5);
  train.left_wheel.position.set(-66, -39);
  train.left_wheel.tint = 0x999999;
  train.addChild(train.left_wheel);

  train.right_wheel_shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_wheel.png"));
  train.right_wheel_shadow.anchor.set(0.5, 0.5);
  train.right_wheel_shadow.position.set(66, -41);
  train.addChild(train.right_wheel_shadow);

  train.right_wheel = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_wheel.png"));
  train.right_wheel.anchor.set(0.5, 0.5);
  train.right_wheel.position.set(66, -39);
  train.right_wheel.tint = 0x999999;
  train.addChild(train.right_wheel);

  train.red_circle = new PIXI.Sprite(PIXI.Texture.from("Art/red_circle.png"));
  train.red_circle.anchor.set(0.5,0.5);
  train.red_circle.position.set(0,0);
  train.red_circle.scale.set(0.25, 0.25);
  train.addChild(train.red_circle);

  if (type == "engine") {
    train.right_wheel.position.set(74, -39);
    train.right_wheel_shadow.position.set(74, -41);
  }

  train.bar = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_" + type + "_bar.png"));
  train.bar.anchor.set(0.5, 0.5);
  train.bar.position.set(2, -57);
  train.addChild(train.bar);

  train.tick = 0
  train.update = function() {
    if (train.status == "rolling") {
      train.tick += 1;
      if (train.speed < train_max_speed) train.speed += 0.02;

      train.right_wheel.angle += train.speed;
      train.right_wheel_shadow.angle = train.right_wheel.angle;
      train.left_wheel.angle = train.right_wheel.angle;
      train.left_wheel_shadow.angle = train.right_wheel.angle;

      train.bar.position.set(
        2 + 16 * Math.sin(train.right_wheel.angle * Math.PI / 180),
        -41 - 16 * Math.cos(train.right_wheel.angle * Math.PI / 180)
      );

      // if ()

      train.track_position += 80 * train.speed * Math.PI / 180;
      train.updatePosition();

      if (type == "engine") {
        if (train.tick % 15 == 0) {
          self.makeSteam(
            self.map.train_smoke_layer, 
            train.x + 95, train.y - 240,
            1.8, 1.8
          );
        }
      }

      if (train.number % 2 == 0) {
        train.body.scale.set(1,0.98 + 0.04 * Math.abs(Math.sin(1.5 * train.right_wheel.angle * Math.PI / 180)))
      } else {
        train.body.scale.set(1,0.98 + 0.04 * Math.abs(Math.cos(1.5 * train.right_wheel.angle * Math.PI / 180)))
      }
    } else {
      //train.updatePosition();
      train.body.scale.set(1,1);
      // train.angle += 3;
    }
  }

   // Use track_position as a parameter to choose x, y coordinates on the track.
  train.updatePosition = function() {
    let track_size = 4 * (self.zoo_size + 1) * square_width;

    console.log(train.track_position);
    if (train.track_position > track_size) {
      train.track_position -= track_size;
    }

    let p = train.track_position;

    if (p >= 0 && p < (self.zoo_size + 1) * square_width) {
      train.position.set(-0.5 * square_width + p, (self.zoo_size + 0.5) * square_width + 36);
      train.scale.x = 1;
    
      if (p < 200) {
        let diff = 200 - p;
        train.x += diff/4;
        train.y -= diff/4;
      }

      if ((self.zoo_size + 1) * square_width - p < 200) {
        // for the last 200 pixels, parametrize to a point -50,-50 from the target.
        let diff = 200 + p - (self.zoo_size + 1) * square_width;
        train.x -= diff/4;
        train.y -= diff/4;
      }
    } else if (p >= (self.zoo_size + 1) * square_width && p < 2 * (self.zoo_size + 1) * square_width) {
      let p2 = p - ((self.zoo_size + 1) * square_width);
      train.position.set((self.zoo_size + 0.5) * square_width, (self.zoo_size + 0.5) * square_width + 36 - p2);
    
      if (p2 < 200) {
        let diff = 200 - p2;
        train.x -= diff/4;
        train.y -= diff/4;
      }

      if ((self.zoo_size + 1) * square_width * 2 - p < 200) {
        // for the last 200 pixels, parametrize to a point -50,-50 from the target.
        let diff = 200 + p - (self.zoo_size + 1) * square_width * 2;
        train.x -= diff/4;
        train.y += diff/4;
      }
    } else if (p >= (self.zoo_size + 1) * square_width * 2 && p < 3 * (self.zoo_size + 1) * square_width) {
      let p3 = p - 2 * (self.zoo_size + 1) * square_width;
      train.position.set((self.zoo_size + 0.5) * square_width - p3, -0.5 * square_width + 36);
      train.scale.x = -1;
    
      if (p3 < 200) {
        let diff = 200 - p3;
        train.x -= diff/4;
        train.y += diff/4;
      }

      if ((self.zoo_size + 1) * square_width * 3 - p < 200) {
        // for the last 200 pixels, parametrize to a point -50,-50 from the target.
        let diff = 200 + p - (self.zoo_size + 1) * square_width * 3;
        train.x += diff/4;
        train.y += diff/4;
      }

    } else if (p >= (self.zoo_size + 1) * square_width * 3) {
      let p4 = p - 3 * ((self.zoo_size + 1) * square_width);
      train.position.set(-0.5 * square_width, -0.5 * square_width + 36 + p4);
    
      if (p4 < 200) {
        let diff = 200 - p4;
        train.x += diff/4;
        train.y += diff/4;
      }

      if ((self.zoo_size + 1) * square_width * 4 - p < 200) {
        // for the last 200 pixels, parametrize to a point -50,-50 from the target.
        let diff = 200 + p - (self.zoo_size + 1) * square_width * 4;
        train.x += diff/4;
        train.y -= diff/4;
      }
    } 
  }

  train.track_position = track_position - 256 * number;
  train.updatePosition();

  return train;
}