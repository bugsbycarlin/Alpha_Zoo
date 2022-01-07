
//
// The train_station class defines a train station.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.makeTrainStation = function(name, x, y) {
  let self = this;

  let station = new PIXI.Container();
  station.position.set(x, y);

  station.name = name;

  // abusing the pen system
  station.special_object = "TRAIN";
  station.special = "TRAIN";
  station.state = "grey";

  station.exterior = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_station.png"));
  station.exterior.visible = false;
  station.exterior.anchor.set(0.5, 1.0);
  station.addChild(station.exterior);

  station.exterior_grey = new PIXI.Sprite(PIXI.Texture.from("Art/Trains/train_station_grey.png"));
  station.exterior_grey.visible = true;
  station.exterior_grey.anchor.set(0.5, 1.0);
  station.addChild(station.exterior_grey);

  station.polygon = [];
  station.polygon.push([x + 205, y]);
  station.polygon.push([x + 205, y - 200]);
  station.polygon.push([x - 205, y - 200]);
  station.polygon.push([x - 205, y]);
  station.polygon.push([x + 205, y]);

  station.grey = function() {
    station.exterior.visible = false;
    station.exterior_grey.visible = true;
    station.state = "grey";
  }

  station.ungrey = function() {
    station.exterior.visible = true;
    station.exterior_grey.visible = false;
    station.state = "ungrey";
  }

  self.decorations.push(station);

  return station;
}