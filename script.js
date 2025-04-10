let speed = 0;
let cruiseEnabled = false;
let cruiseSpeed = 0;
let roadPosition = 0;
let lastTime = 0;
let isAccelerating = false; // New flag to track if accelerator is being pressed
let isDecelerating = false; // New flag to track if brake is being pressed

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

// Create realistic dashed lane markers
const lineCount = 15;
const gapRatio = 3;

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

// Setup event listeners for button press/release
function setupEventListeners() {
  const accelButton = document.querySelector("#controls button:nth-child(1)");
  const brakeButton = document.querySelector("#controls button:nth-child(2)");

  // Accelerator button events
  accelButton.addEventListener("mousedown", function () {
    isAccelerating = true;
    accelButton.classList.add("active");
  });

  accelButton.addEventListener("mouseup", function () {
    isAccelerating = false;
    accelButton.classList.remove("active");
  });

  accelButton.addEventListener("mouseleave", function () {
    isAccelerating = false;
    accelButton.classList.remove("active");
  });

  // Brake button events
  brakeButton.addEventListener("mousedown", function () {
    isDecelerating = true;
    brakeButton.classList.add("active");
  });

  brakeButton.addEventListener("mouseup", function () {
    isDecelerating = false;
    brakeButton.classList.remove("active");
  });

  brakeButton.addEventListener("mouseleave", function () {
    isDecelerating = false;
    brakeButton.classList.remove("active");
  });

  // Touch events for mobile
  accelButton.addEventListener("touchstart", function (e) {
    e.preventDefault();
    isAccelerating = true;
    accelButton.classList.add("active");
  });

  accelButton.addEventListener("touchend", function () {
    isAccelerating = false;
    accelButton.classList.remove("active");
  });

  brakeButton.addEventListener("touchstart", function (e) {
    e.preventDefault();
    isDecelerating = true;
    brakeButton.classList.add("active");
  });

  brakeButton.addEventListener("touchend", function () {
    isDecelerating = false;
    brakeButton.classList.remove("active");
  });
}

function updateUI() {
  document.getElementById("speed").innerText = speed.toFixed(1);
  document.getElementById("cruiseStatus").innerText = cruiseEnabled
    ? `ON (${cruiseSpeed} km/h)`
    : "OFF";
  document.getElementById("mechanicsLog").innerText = cruiseEnabled
    ? `ECU is controlling the throttle to maintain ${cruiseSpeed} km/h.`
    : isAccelerating
    ? "Driver pressing accelerator pedal to increase speed."
    : isDecelerating
    ? "Driver pressing brake pedal to decrease speed."
    : "Driver not pressing any pedals.";

  document
    .getElementById("ecuLight")
    .setAttribute("fill", cruiseEnabled ? "green" : "gray");
  updateMechanicalDiagram();
}

// These functions are no longer needed as button clicks since we're using event listeners
// But we'll keep them as the functions that actually modify the speed
function accelerate() {
  if (!cruiseEnabled) speed += 0.5; // Reduced acceleration rate for smoother control
}

function decelerate() {
  if (!cruiseEnabled && speed > 0) {
    speed -= 0.5;
    if (speed < 0) speed = 0;
  }
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

function updateMechanicalDiagramSpacing() {
  // Driver Input Section - Move to left
  document
    .getElementById("driver-input")
    .setAttribute("transform", "translate(-5, -5)");

  // Cruise Control Switch - Move down and to left
  document
    .getElementById("cruise-switch")
    .setAttribute("transform", "translate(-5, 15)");

  // ECU - Move to center
  document
    .getElementById("ecu-unit")
    .setAttribute("transform", "translate(20, 0)");

  // Speed Sensor - Move up
  document
    .getElementById("speed-sensor")
    .setAttribute("transform", "translate(0, -15)");

  // Throttle - Move to right
  document
    .getElementById("throttle")
    .setAttribute("transform", "translate(20, -10)");

  // Engine - Move to right and down
  document
    .getElementById("engine")
    .setAttribute("transform", "translate(15, 5)");

  // Update connection lines
  document.getElementById("manual-control").setAttribute("x1", "45");
  document.getElementById("manual-control").setAttribute("y1", "45");
  document.getElementById("manual-control").setAttribute("x2", "210");
  document.getElementById("manual-control").setAttribute("y2", "65");

  document.getElementById("cruise-command").setAttribute("x1", "45");
  document.getElementById("cruise-command").setAttribute("y1", "115");
  document.getElementById("cruise-command").setAttribute("x2", "120");
  document.getElementById("cruise-command").setAttribute("y2", "130");

  document.getElementById("speed-data").setAttribute("x1", "100");
  document.getElementById("speed-data").setAttribute("y1", "90");
  document.getElementById("speed-data").setAttribute("x2", "130");
  document.getElementById("speed-data").setAttribute("y2", "130");

  document.getElementById("ecu-control").setAttribute("x1", "180");
  document.getElementById("ecu-control").setAttribute("y1", "140");
  document.getElementById("ecu-control").setAttribute("x2", "210");
  document.getElementById("ecu-control").setAttribute("y2", "75");

  document.getElementById("throttle-input").setAttribute("x1", "250");
  document.getElementById("throttle-input").setAttribute("y1", "75");
  document.getElementById("throttle-input").setAttribute("x2", "255");
  document.getElementById("throttle-input").setAttribute("y2", "120");

  // Update feedback loop path
  document
    .getElementById("feedback-loop")
    .setAttribute("d", "M280,165 Q300,190 240,190 Q170,190 100,75");
}

function simulateDrive(currentTime) {
  if (!lastTime) lastTime = currentTime;
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (cruiseEnabled) {
    // Cruise control maintains speed
    speed += (cruiseSpeed - speed) * 0.05;
  } else {
    // Manual control - apply acceleration or deceleration based on button state
    if (isAccelerating) {
      accelerate();
    } else if (isDecelerating) {
      decelerate();
    } else {
      // Natural deceleration when no pedal is pressed
      if (speed > 0) {
        speed -= 0.1 * deltaTime * 10; // Gradual slow down when not accelerating
        if (speed < 0) speed = 0;
      }
    }
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

// Initialize when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  updateMechanicalDiagramSpacing();
  setupEventListeners();

  // Update the button layout and functionality
  const accelButton = document.querySelector("#controls button:nth-child(1)");
  const brakeButton = document.querySelector("#controls button:nth-child(2)");
  const cruiseButton = document.querySelector("#controls button:nth-child(3)");

  // Remove the old click handlers
  accelButton.removeAttribute("onclick");
  brakeButton.removeAttribute("onclick");

  // Keep the cruise control click handler
  cruiseButton.setAttribute("onclick", "toggleCruise()");

  // Start the animation loop
  requestAnimationFrame(simulateDrive);
});
