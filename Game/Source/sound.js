//
// This file contains general sound effect and music utilities based on Howl.js.
//
// Copyright 2023 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var use_music = true;
var use_sound = true;

let music_volume = 0.4;
let sound_volume = 0.6;
let current_music = null;
let old_music = null;

let sound_files = [
  ["success","success.wav"],
  ["swipe","swipe.wav"],
  ["pop","pop.wav"],
  ["puff","puff.wav"],
  ["throw","throw.wav"],
  ["slurp","slurp.wav"],
  ["build","build.wav"],
  ["coin","coin.wav"],
  ["clunk","clunk.wav"],
  ["jump","jump.wav"],
  ["tree_shake","tree_shake.wav"],
  ["poop_1","poop_1.mp3"],
  ["poop_2","poop_2.mp3"],
  ["poop_3","poop_3.mp3"],
  ["breeze","breeze.mp3"],
  ["train_whistle","train_whistle.mp3"],
  ["train_rolling","train_rolling.mp3"],
  ["background_music","Chris Haugen - Campfire Song.mp3"],
  ["chomp_1","chomp_1.mp3"],
  ["chomp_2","chomp_2.mp3"],
  ["rhino","Animals/rhino.mp3"],
  ["otter","Animals/otter.mp3"],
  ["hippo","Animals/hippo.mp3"],
  ["lion","Animals/lion.mp3"],
  ["cheetah","Animals/cheetah.mp3"],
  ["tiger","Animals/tiger.mp3"],
  ["panther","Animals/panther.mp3"],
  ["alligator","Animals/alligator.mp3"],
  ["dog","Animals/dog.mp3"],
  ["fox","Animals/fox.mp3"],
  ["parrot","Animals/parrot.mp3"],
  ["gorilla","Animals/gorilla.mp3"],
  ["zebra","Animals/zebra.mp3"],
  ["snake","Animals/snake.mp3"],
  ["giraffe","Animals/giraffe.mp3"],
  ["cat","Animals/cat.mp3"],
  ["mouse","Animals/mouse.mp3"],
  ["elephant","Animals/elephant.mp3"],
  ["bear","Animals/bear.mp3"],
  ["cow","Animals/cow.mp3"],
  ["chicken","Animals/chicken.mp3"],
  ["frog","Animals/frog.mp3"],
  ["owl","Animals/owl.mp3"],
  ["yak","Animals/yak.mp3"],
  ["pig","Animals/pig.mp3"],
  ["sheep","Animals/sheep.mp3"],
  ["seal","Animals/seal.mp3"],
  ["deer","Animals/deer.mp3"],
  ["moose","Animals/moose.mp3"],
  ["baboon","Animals/baboon.mp3"],
  ["horse","Animals/horse.mp3"],
  ["wolf","Animals/wolf.mp3"],
  ["penguin","Animals/penguin.mp3"],
  ["chimpanzee","Animals/chimpanzee.mp3"],
  ["capybara","Animals/capybara.mp3"],
  ["kangaroo","Animals/kangaroo.mp3"],
  ["meerkat","Animals/meerkat.mp3"],
  ["camel","Animals/camel.mp3"],
  ["goat","Animals/goat.mp3"],
  ["rabbit","Animals/rabbit.mp3"],
  ["alpaca","Animals/alpaca.mp3"],
  ["peacock","Animals/peacock.mp3"],
  ["lemur","Animals/lemur.mp3"],
  ["orangutan","Animals/orangutan.mp3"],
  ["ostrich","Animals/ostrich.mp3"],
  ["flamingo","Animals/flamingo.mp3"],
  ["swan","Animals/swan.mp3"],
  ["goose","Animals/goose.mp3"],
  ["duck","Animals/duck.mp3"],
  ["a4","Marimba/a4.wav"],
  ["b4","Marimba/b4.wav"],
  ["c4","Marimba/c4.wav"],
  ["d4","Marimba/d4.wav"],
  ["e4","Marimba/e4.wav"],
  ["f4","Marimba/f4.wav"],
  ["g4","Marimba/g4.wav"],
  ["a5","Marimba/a5.wav"],
  ["b5","Marimba/b5.wav"],
  ["c5","Marimba/c5.wav"],
  ["d5","Marimba/d5.wav"],
  ["e5","Marimba/e5.wav"],
  ["f5","Marimba/f5.wav"],
  ["g5","Marimba/g5.wav"],
]


let sound_data = [];
for (let i = 0; i < sound_files.length; i++) {
  file = sound_files[i];
  sound_data[file[0]] = new Howl({preload: true, src: ["Sound/" + file[1]]})
}


soundEffect = function(effect_name, volume=sound_volume) {
  if (use_sound && volume > 0) {
    var sound_effect = sound_data[effect_name];
    if (sound_effect != null) {
      sound_effect.volume(volume);
      sound_effect.play();
    }
  }
}


stopSoundEffect = function(effect_name) {
  if (sound_volume > 0) {
    var sound_effect = sound_data[effect_name];
    if (sound_effect != null) {
      sound_effect.stop();
    }
  }
}


stopAllSound = function() {
  for (const [key, value] of Object.entries(sound_data)) {
    sound_data[key].stop();
  }
}


pauseSoundEffect = function(effect_name) {
  if (sound_data[effect_name].playing() == true) {
    sound_data[effect_name].hold_up = true;
    sound_data[effect_name].pause();
  }
}


resumeSoundEffect = function(effect_name) {
  if (sound_data[effect_name] != null && sound_data[effect_name].hold_up == true) {
    sound_data[effect_name].hold_up = null;
    sound_data[effect_name].play();
  }
}


setMusic = function(music_name, loop = true) {
  if (use_music && music_volume > 0) {
    if (current_music != null && current_music.name == music_name) {
      return;
    }

    let crossfade = false;
    if (current_music != null && current_music.name != music_name) {
      crossfade = true;
      fadeMusic(500);
    }

    current_music = sound_data[music_name];
    if (current_music != null) {
      current_music.name = music_name;
      current_music.loop(loop);
      current_music.volume(music_volume);
      current_music.play();

      if (crossfade) {
        for (let i = 0; i < 14; i++) {
          delay(function() {
            current_music.volume(i / 20);
          }, 50 * i);
        }
      } else {
        current_music.volume(0.6);
      }
    }
  }
}


stopMusic = function() {
  if (current_music != null) {
    current_music.stop();
    current_music = null;
  }
}


fadeMusic = function(delay_time = 0) {
  if (current_music != null) {
    old_music = current_music;
    current_music = null;
    for (let i = 0; i < 14; i++) {
      delay(function() {
        old_music.volume((13 - i) / 20);
      }, delay_time + 50 * i);
    }
    setTimeout(function() {
      // TO DO
      // DELETE OLD MUSIC
      old_music = null;
    }, 1500);
  }
}

