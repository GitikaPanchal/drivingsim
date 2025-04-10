let speed = 0;
let cruiseEnabled = false;
let cruiseSpeed = 0;
let roadPosition = 0;
let lastTime = 0;

const road = document.getElementById("road");

// Clear existing lane markers
road.innerHTML = "";

// Create two sets of lane markers that we'll animate in parallel
const laneSet1 = document.createElement("div");
laneSet1.className = "lane-set";
laneSet1.style.position = "absolute";
laneSet1.style.width = "100%";
laneSet1.style.height = "100%";
laneSet1.style.top = "0";

const laneSet2 = document.createElement("div");
laneSet2.className = "lane-set";
laneSet2.style.position = "absolute";
laneSet2.style.width = "100%";
laneSet2.style.height = "100%";
laneSet2.style.top = "-100%";

road.appendChild(laneSet1);
road.appendChild(laneSet2);

// Create realistic dashed lane markers with proper spacing
// Highway lane markers are typically about 10 feet long with 30 feet gaps
// We'll simulate this with a visual ratio
const lineCount = 15; // Fewer lines with bigger gaps
const gapRatio = 3; // Gap is 3 times the length of the line

for (let i = 0; i < lineCount; i++) {
  const linePosition =
    i * (1 + gapRatio) * (100 / (lineCount * (1 + gapRatio)));

  const line1 = document.createElement("div");
  line1.className = "lane-line";
  line1.style.top = `${linePosition}%`;
  laneSet1.appendChild(line1);

  const line2 = document.createElement("div");
  line2.className = "lane-line";
  line2.style.top = `${linePosition}%`;
  laneSet2.appendChild(line2);
}

function updateUI() {
  document.getElementById("speed").innerText = speed.toFixed(1);
  document.getElementById("cruiseStatus").innerText = cruiseEnabled
    ? `ON (${cruiseSpeed} km/h)`
    : "OFF";
  document.getElementById("mechanicsLog").innerText = cruiseEnabled
    ? `ECU is controlling the throttle to maintain ${cruiseSpeed} km/h.`
    : "Driver manually pressing the pedal to change speed.";
  document
    .getElementById("ecuLight")
    .setAttribute("fill", cruiseEnabled ? "green" : "gray");
}

function accelerate() {
  if (!cruiseEnabled) speed += 5;
}

function decelerate() {
  if (!cruiseEnabled && speed > 0) speed -= 5;
}

function toggleCruise() {
  if (!cruiseEnabled && speed > 0) {
    cruiseEnabled = true;
    cruiseSpeed = speed.toFixed(1);
  } else {
    cruiseEnabled = false;
  }
  updateUI();
}

// Dynamic updates for the mechanical diagram
function updateMechanicalDiagram() {
  // Update cruise control indicator
  document
    .getElementById("cruise-indicator")
    .setAttribute("fill", cruiseEnabled ? "green" : "gray");

  // Update throttle position visualization based on speed
  const throttleWidth = Math.min(30, (speed / 5) * 30);
  document
    .getElementById("throttle-position")
    .setAttribute("width", throttleWidth);

  // Highlight active control path
  if (cruiseEnabled) {
    // Highlight ECU control path when cruise is on
    document.getElementById("ecu-control").setAttribute("stroke", "#00c");
    document.getElementById("cruise-command").setAttribute("stroke", "#00c");
    document.getElementById("speed-data").setAttribute("stroke", "#00c");
    document.getElementById("manual-control").setAttribute("stroke", "#333");
    document
      .getElementById("manual-control")
      .setAttribute("stroke-opacity", "0.3");
    // Show feedback loop active
    document.getElementById("feedback-loop").setAttribute("stroke", "#00c");
    document
      .getElementById("feedback-loop")
      .setAttribute("stroke-dasharray", "5,3");
  } else {
    // Highlight manual control path when cruise is off
    document.getElementById("manual-control").setAttribute("stroke", "#c00");
    document
      .getElementById("manual-control")
      .setAttribute("stroke-opacity", "1");
    document.getElementById("ecu-control").setAttribute("stroke", "#333");
    document.getElementById("cruise-command").setAttribute("stroke", "#333");
    document.getElementById("speed-data").setAttribute("stroke", "#333");
    // Show feedback loop inactive
    document.getElementById("feedback-loop").setAttribute("stroke", "#333");
    document
      .getElementById("feedback-loop")
      .setAttribute("stroke-dasharray", "3,2");
  }
}

// Call updateMechanicalDiagram inside the updateUI function
function updateUI() {
  document.getElementById("speed").innerText = speed.toFixed(1);
  document.getElementById("cruiseStatus").innerText = cruiseEnabled
    ? `ON (${cruiseSpeed} km/h)`
    : "OFF";
  document.getElementById("mechanicsLog").innerText = cruiseEnabled
    ? `ECU is controlling the throttle to maintain ${cruiseSpeed} km/h.`
    : "Driver manually pressing the pedal to change speed.";
  document
    .getElementById("ecuLight")
    .setAttribute("fill", cruiseEnabled ? "green" : "gray");

  // Update the mechanical diagram
  updateMechanicalDiagram();
}

function simulateDrive(currentTime) {
  if (!lastTime) lastTime = currentTime;
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (cruiseEnabled) {
    speed += (cruiseSpeed - speed) * 0.05;
  }

  if (speed > 0) {
    // Update road position with positive value (0-100%)
    roadPosition += speed * deltaTime * 0.5;

    // When position exceeds 100%, reset to continue the loop
    if (roadPosition >= 100) {
      roadPosition = 0;
    }

    // Apply transforms to both lane sets
    laneSet1.style.transform = `translateY(${roadPosition}%)`;
    laneSet2.style.transform = `translateY(${roadPosition}%)`;
  }

  updateUI();
  requestAnimationFrame(simulateDrive);
}

// Start the animation loop
requestAnimationFrame(simulateDrive);
