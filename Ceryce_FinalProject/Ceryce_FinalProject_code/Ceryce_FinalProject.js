//DN1010 Experimental Interaction Final Project
//Ho Ruo Xuan Ceryce, G01
 //A game that doesn't even let you play it.

var video;
var target = [];
var threshold = 25;
var hasGameStarted = false;

var btnX, btnY;
var btnSize = 120;
let letters = "BORING "; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();
  
  // Start button in the center
  btnX = width / 2 - btnSize / 2;
  btnY = height / 2 - btnSize / 4;
}

function draw() {
  background(0);
  video.loadPixels();

// When player tries to cheat by covering whole screen with the colour:
  let totalBrightness = 0;
  for (let j = 0; j < video.pixels.length; j += 4) {
    totalBrightness += (video.pixels[j] + video.pixels[j + 1] + video.pixels[j + 2]) / 3;
  }
  let avgBright = totalBrightness / (video.width * video.height);

  if (avgBright < 110) { 
    runMeltdownMode();
    return; 
  }

  // Color tracking
  let colorFoundOnScreen = false; 

  for (var i = 0; i < target.length; i++) {
    for (var x = 0; x < video.width; x += 3) {
      for (var y = 0; y < video.height; y += 3) {
        var index = (x + y * video.width) * 4;
        var r = video.pixels[index + 0];
        var g = video.pixels[index + 1];
        var b = video.pixels[index + 2];

        if (dist(r, g, b, target[i].red, target[i].green, target[i].blue) < threshold) {
          target[i].avgX += x;
          target[i].avgY += y;
          target[i].count++;
        }
      }
    }

    // Check if we actually saw enough of the color
    if (target[i].count > 10) { 
      colorFoundOnScreen = true; 
      
      target[i].avgX = target[i].avgX / target[i].count;
      target[i].avgY = target[i].avgY / target[i].count;
      
      // Scale the tracking coordinates to the full window size
      let mappedX = map(target[i].avgX, 0, 640, 0, width);
      let mappedY = map(target[i].avgY, 0, 480, 0, height);

      if (target[i].count > (video.width * video.height) / 4) {
        runMeltdownMode();
        return;
      } else {
        let d = dist(target[i].avgX, target[i].avgY, btnX + btnSize / 2, btnY + btnSize / 4);
        if (d < 150) {
          btnX = random(50, width - btnSize - 50);
          btnY = random(50, height - btnSize - 50);
        } else {
          image(video, 0, 0); 
        }
      }
    }
    target[i].reset();
  }

  // If player stops moving (as in the selected colour is no longer on screen)
  if (!colorFoundOnScreen) {
    
    //If game hasn't started, show normal video so user can pick a color
    if (!hasGameStarted) {
      image(video, 0, 0); 
      fill(255);
      textAlign(CENTER);
      textSize(40);
      text("CLICK ON A COLOUR TO START :)", width / 2, height - 40);
      return;
    } 
    
    // If game has started but the selected colour is gone, show ASCII to taunt them
    else {
      runAsciiMode();
      fill(255);
      textAlign(CENTER);
      textSize(40);
      text("LOL, DID YOU GIVE UP??", width / 2, height - 20);
      return; 
    }
  }
  
  drawButton();
}

function drawButton() {
  fill(255, 0, 0);
  stroke(255);
  strokeWeight(2);
  rect(btnX, btnY, btnSize, btnSize / 2, 5);
  noStroke();
  fill(255);
  textSize(14);
  textAlign(CENTER);
  text("START GAME", btnX + btnSize / 2, btnY + btnSize / 4);
}

function runAsciiMode() {
  video.loadPixels();
  textSize(10);
  textAlign(LEFT);
  let wScale = width / video.width;
  let hScale = height / video.height;
  for (let y = 0; y < video.height; y += 12) {
    for (let x = 0; x < video.width; x += 8) {
      let pix = (x + y * video.width) * 4;
      let lum = video.pixels[pix] + video.pixels[pix+1] + video.pixels[pix+2];
      let tone = int(map(lum, 0, 765, 0, letters.length - 1));
      fill(255);
      text(letters.charAt(tone), x, y);
    }
  }
}

function runMeltdownMode() {
  push(); 
  background(255, 0, 0); 
  
  fill(0); 
  textAlign(CENTER, CENTER);
  textFont('Courier New'); 
  
  textSize(40);
  text("SYSTEM SUFFOCATION", width / 2, height / 2 - 20);
  
  textSize(20);
  text("STAND BACK. YOU ARE TOO CLOSE.", width / 2, height / 2 + 30);
  pop(); 
}

function mousePressed() {
  target = []; 
  target.push(new TargetColor(video.get(mouseX, mouseY)));
  hasGameStarted = true; // The game officially starts
}

class TargetColor {
  constructor(c) {
    this.red = red(c);
    this.green = green(c);
    this.blue = blue(c);
    this.avgX = 0;
    this.avgY = 0;
    this.count = 0;
  }
  reset() {
    this.avgX = 0;
    this.avgY = 0;
    this.count = 0;
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(windowWidth, windowHeight);
  
  // Re-center the button if it gets lost off-screen
  btnX = width / 2 - btnSize / 2;
  btnY = height / 2 - btnSize / 4;
}