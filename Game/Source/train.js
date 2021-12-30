
//
// The train class defines a train.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//


Game.prototype.makeTrain = function(parent, x, y) {
  
  for (let i = 0; i < 4; i++) {
    let train = this.makeTrainCar(parent, i, pick(ferris_wheel_colors), (i == 0) ? "engine" : "car", x - 256 * i, y);
    this.decorations.push(train);
    this.trains.push(train);
  }
}


Game.prototype.rollTrains = function() {
  let self = this;

  for (let i = 0; i < this.trains.length; i++) {
    this.trains[i].status = "rolling";
  }

  this.soundEffect("train_whistle");
  this.soundEffect("train_rolling");
}


Game.prototype.makeTrainCar = function(parent, number, color, type, x, y) {
  let self = this;

  let train = new PIXI.Container();
  train.position.set(x, y);

  console.log(type);
  train.train_type = type
  train.parent = parent;
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

  if (type == "engine") {
    train.right_wheel.position.set(74, -39);
    train.right_wheel_shadow.position.set(74, -41);
  }

  train.bar = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_" + type + "_bar.png"));
  train.bar.anchor.set(0.5, 0.5);
  train.bar.position.set(2, -57);
  train.addChild(train.bar);



  // // Move the entire train without changing the string
  // train.reposition = function(new_x, new_y) {
  //   let dx = new_x - train.x;
  //   let dy = new_y - train.y;
  //   train.x += dx;
  //   train.y += dy;
  //   // train.original_x += dx;
  //   // train.original_y += dy;
  //   // train.top_x += dx;
  //   // train.top_y += dy;
  // }

  // // Push the train by a certain amount, which will cause it to rebound
  // train.push = function(dx, dy) {
  //   train.top_x += dx;
  //   train.top_y += dy;
  // }

  // // Release the train to fly upwards.
  // train.free = function(x, y, layer) {
  //   train.reposition(x, y);
  //   train.ceiling = train.y - 3000;
  //   train.status = "free";
  //   layer.addChild(train);
  //   train.parent = layer;
  //   game.free_trains.push(train);
  // }

  // Update the train, rebounding it and gently moving the string
  train.tick = 0
  train.update = function() {
    if (train.status == "rolling") {
      train.tick += 1;
      if (train.speed < 6) train.speed += 0.02;

      train.right_wheel.angle += train.speed;
      train.right_wheel_shadow.angle = train.right_wheel.angle;
      train.left_wheel.angle = train.right_wheel.angle;
      train.left_wheel_shadow.angle = train.right_wheel.angle;

      train.bar.position.set(
        2 + 16 * Math.sin(train.right_wheel.angle * Math.PI / 180),
        -41 - 16 * Math.cos(train.right_wheel.angle * Math.PI / 180)
      );

      train.x += 80 * train.speed * Math.PI / 180;

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
      train.body.scale.set(1,1);
    }
  }

  // train.rope = new PIXI.SimpleRope(PIXI.Texture.from("Art/rope_texture.png"), train.rope_points);
  // train.addChild(train.rope);



  train.update();

  train.parent.addChild(train);

  return train;
}