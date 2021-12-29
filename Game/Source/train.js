
//
// The train class defines a train.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//


Game.prototype.makeTrain = function(parent, x, y) {
  
  for (let i = 0; i < 4; i++) {
    let train = this.makeTrainCar(parent, pick(ferris_wheel_colors), (i == 0) ? "engine" : "car", x - 256 * i, y);
    this.decorations.push(train);
    this.trains.push(train);
  }
}

Game.prototype.makeTrainCar = function(parent, color, type, x, y) {
  let self = this;

  let train = new PIXI.Container();
  train.position.set(x, y);

  console.log(type);
  train.train_type = type
  train.parent = parent;
  train.color = color;

  train.status = "active";

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
  train.left_wheel_shadow.position.set(-66, -32);
  train.addChild(train.left_wheel_shadow);

  train.left_wheel = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_wheel.png"));
  train.left_wheel.anchor.set(0.5, 0.5);
  train.left_wheel.position.set(-66, -30);
  train.left_wheel.tint = 0x999999;
  train.addChild(train.left_wheel);

  train.right_wheel_shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_wheel.png"));
  train.right_wheel_shadow.anchor.set(0.5, 0.5);
  train.right_wheel_shadow.position.set(66, -32);
  train.addChild(train.right_wheel_shadow);

  train.right_wheel = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_wheel.png"));
  train.right_wheel.anchor.set(0.5, 0.5);
  train.right_wheel.position.set(66, -30);
  train.right_wheel.tint = 0x999999;
  train.addChild(train.right_wheel);

  train.bar = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_car_bar.png"));
  train.bar.anchor.set(0.5, 0.5);
  train.bar.position.set(2, -48);
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
  train.update = function() {
  }

  // train.rope = new PIXI.SimpleRope(PIXI.Texture.from("Art/rope_texture.png"), train.rope_points);
  // train.addChild(train.rope);



  train.update();

  train.parent.addChild(train);

  return train;
}