// Global variables
let speed = 0;
let cruiseEnabled = false;
let cruiseSpeed = 0;
let roadPosition = 0;
let lastTime = 0;
let isAccelerating = false;
let isDecelerating = false;
const MAX_SPEED = 120; // Maximum speed in km/h
let targetCruiseSpeed = 60; // Default target cruise speed in km/h
let laneSet1, laneSet2; // Declare these at the global scope

// Initialize the road and lane markers
function initializeRoad() {
  const road = document.getElementById("road");

  // Clear existing lane markers
  road.innerHTML = "";

  // Create two sets of lane markers that we'll animate in parallel
  laneSet1 = document.createElement("div"); // Assign to global variable
  laneSet1.className = "lane-set";
  laneSet1.style.position = "absolute";
  laneSet1.style.width = "100%";
  laneSet1.style.height = "100%";
  laneSet1.style.top = "0";

  laneSet2 = document.createElement("div"); // Assign to global variable
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
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize road without capturing the return value
  initializeRoad();

  // Rest of your initialization code remains the same
  createSpeedometerMarkings();
  updateMechanicalDiagramSpacing();
  setupEventListeners();
  setupPopup();

  // Add a title to the mechanical diagram
  const diagramTitle = document.createElement("h3");
  diagramTitle.textContent = "Cruise Control System";
  document.querySelector(".mechanical-diagram").prepend(diagramTitle);

  // Start the animation loop
  requestAnimationFrame(simulateDrive);
});

// Create speedometer ticks and labels
function createSpeedometerMarkings() {
  const container = document.querySelector(".speedometer-container");

  // Create ticks from -90 to 90 degrees (half circle)
  for (let i = 0; i <= 12; i++) {
    const angle = -90 + i * 15; // -90 to 90 in 15 degree steps
    const speed = Math.round(i * (MAX_SPEED / 12)); // Corresponding speed value

    // Create tick
    const tick = document.createElement("div");
    tick.className = i % 3 === 0 ? "speed-tick major" : "speed-tick";
    tick.style.transform = `rotate(${angle}deg)`;
    container.appendChild(tick);

    // Create label for major ticks
    if (i % 3 === 0) {
      const label = document.createElement("div");
      label.className = "speed-value";
      label.style.transform = `rotate(${angle}deg) translateX(-50%) rotate(${-angle}deg)`;
      // Show speed values in m/s on the speedometer
      const speedInMS = Math.round(speed * 0.277778);
      label.textContent = speedInMS;
      container.appendChild(label);
    }
  }
}

// Setup popup functionality
function setupPopup() {
  const popup = document.getElementById("infoPopup");
  const popupTitle = document.querySelector(".popup-title");
  const popupDescription = document.querySelector(".popup-description");
  const closeButton = document.querySelector(".popup-close");

  // Close popup when clicking close button
  closeButton.addEventListener("click", () => {
    popup.style.display = "none";
  });

  // Close popup when clicking outside the content
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });

  // Setup click handlers for mechanical parts
  document.querySelectorAll(".mechanical-part").forEach((part) => {
    part.addEventListener("click", function () {
      const title = this.getAttribute("data-title");
      const description = this.getAttribute("data-description");

      if (title && description) {
        popupTitle.textContent = title;
        popupDescription.textContent = description;
        popup.style.display = "flex";
      }
    });
  });
}

// Cruise control functions
function toggleCruise() {
  if (!cruiseEnabled) {
    // Enabling cruise control with the target speed
    cruiseEnabled = true;
    cruiseSpeed = targetCruiseSpeed;
  } else {
    // Disabling cruise control
    cruiseEnabled = false;
  }
  updateUI();
}

function increaseCruiseSpeed() {
  targetCruiseSpeed = Math.min(MAX_SPEED, targetCruiseSpeed + 5);
  if (cruiseEnabled) {
    cruiseSpeed = targetCruiseSpeed;
  }
  updateUI();
}

function decreaseCruiseSpeed() {
  targetCruiseSpeed = Math.max(0, targetCruiseSpeed - 5);
  if (cruiseEnabled) {
    cruiseSpeed = targetCruiseSpeed;
  }
  updateUI();
}

// Setup event listeners for button press/release
function setupEventListeners() {
  const accelButton = document.querySelector("#controls button:nth-child(1)");
  const brakeButton = document.querySelector("#controls button:nth-child(2)");
  const cruiseButton = document.getElementById("cruiseButton");

  // Set up cruise speed adjustment buttons
  const decreaseCruiseBtn = document.getElementById("decreaseCruiseBtn");
  const increaseCruiseBtn = document.getElementById("increaseCruiseBtn");

  decreaseCruiseBtn.addEventListener("click", decreaseCruiseSpeed);
  increaseCruiseBtn.addEventListener("click", increaseCruiseSpeed);

  // Accelerator button events
  accelButton.addEventListener("mousedown", function () {
    // If cruise is enabled, turn it off
    if (cruiseEnabled) {
      cruiseEnabled = false;
      updateUI();
    }
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
    // If cruise is enabled, turn it off
    if (cruiseEnabled) {
      cruiseEnabled = false;
      updateUI();
    }
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
    // If cruise is enabled, turn it off
    if (cruiseEnabled) {
      cruiseEnabled = false;
      updateUI();
    }
    isAccelerating = true;
    accelButton.classList.add("active");
  });

  accelButton.addEventListener("touchend", function () {
    isAccelerating = false;
    accelButton.classList.remove("active");
  });

  brakeButton.addEventListener("touchstart", function (e) {
    e.preventDefault();
    // If cruise is enabled, turn it off
    if (cruiseEnabled) {
      cruiseEnabled = false;
      updateUI();
    }
    isDecelerating = true;
    brakeButton.classList.add("active");
  });

  brakeButton.addEventListener("touchend", function () {
    isDecelerating = false;
    brakeButton.classList.remove("active");
  });

  // Cruise control button
  cruiseButton.addEventListener("click", toggleCruise);
}

// Update the UI with current state
function updateUI() {
  // Convert km/h to m/s (1 km/h = 0.277778 m/s)
  const speedInMS = Math.round(speed * 0.277778);

  // Update cruise control button status
  const cruiseIndicator = document.querySelector(".cruise-indicator");
  if (cruiseEnabled) {
    const cruiseSpeedInMS = Math.round(cruiseSpeed * 0.277778);
    cruiseIndicator.textContent = `ON (${cruiseSpeedInMS} m/s)`;
    cruiseIndicator.classList.add("on");
    document.getElementById("cruiseButton").classList.add("active");
  } else {
    const targetSpeedInMS = Math.round(targetCruiseSpeed * 0.277778);
    cruiseIndicator.textContent = `Target: ${targetSpeedInMS} m/s`;
    cruiseIndicator.classList.remove("on");
    document.getElementById("cruiseButton").classList.remove("active");
  }

  // Update mechanics log
  let mechanicsText = "";
  if (cruiseEnabled) {
    if (Math.abs(speed - cruiseSpeed) > 0.5) {
      // If we're adjusting to the target speed
      const cruiseSpeedInMS = Math.round(cruiseSpeed * 0.277778);
      if (speed < cruiseSpeed) {
        mechanicsText = `ECU is increasing throttle to reach ${cruiseSpeedInMS} m/s`;
      } else {
        mechanicsText = `ECU is decreasing throttle to reach ${cruiseSpeedInMS} m/s`;
      }
    } else {
      const cruiseSpeedInMS = Math.round(cruiseSpeed * 0.277778);
      mechanicsText = `ECU is controlling the throttle to maintain ${cruiseSpeedInMS} m/s`;
    }
  } else {
    if (isAccelerating) {
      mechanicsText = "Driver pressing accelerator pedal to increase speed.";
    } else if (isDecelerating) {
      mechanicsText = "Driver pressing brake pedal to decrease speed.";
    } else {
      mechanicsText = "Driver not pressing any pedals.";
    }
  }
  document.getElementById("mechanicsLog").innerText = mechanicsText;

  // Update speedometer display - no decimals, m/s units
  document.querySelector(".speed-display").textContent = `${speedInMS} m/s`;

  // Calculate needle angle: map 0-MAX_SPEED to -90-90 degrees
  const needleAngle = -90 + (speed / MAX_SPEED) * 180;
  document.querySelector(
    ".speedometer-needle"
  ).style.transform = `rotate(${needleAngle}deg)`;

  document
    .getElementById("ecuLight")
    .setAttribute("fill", cruiseEnabled ? "#0ea5e9" : "gray");
  updateMechanicalDiagram();
}

// Speed control functions
function accelerate() {
  speed += 0.5; // Reduced acceleration rate for smoother control
  if (speed > MAX_SPEED) speed = MAX_SPEED; // Cap to maximum speed
}

function decelerate() {
  if (speed > 0) {
    speed -= 0.5;
    if (speed < 0) speed = 0;
  }
}

// Update mechanical diagram visuals
function updateMechanicalDiagram() {
  // Update cruise control indicator
  document
    .getElementById("cruise-indicator")
    .setAttribute("fill", cruiseEnabled ? "#0ea5e9" : "gray");

  // Update throttle position visualization based on speed
  const throttleWidth = Math.min(30, (speed / 5) * 30);
  document
    .getElementById("throttle-position")
    .setAttribute("width", throttleWidth);

  // Highlight active control path
  if (cruiseEnabled) {
    // Highlight ECU control path when cruise is on
    document.getElementById("ecu-control").setAttribute("stroke", "#0ea5e9");
    document.getElementById("cruise-command").setAttribute("stroke", "#0ea5e9");
    document.getElementById("speed-data").setAttribute("stroke", "#0ea5e9");
    document.getElementById("manual-control").setAttribute("stroke", "#333");
    document
      .getElementById("manual-control")
      .setAttribute("stroke-opacity", "0.3");
    // Show feedback loop active
    document.getElementById("feedback-loop").setAttribute("stroke", "#0ea5e9");
    document
      .getElementById("feedback-loop")
      .setAttribute("stroke-dasharray", "5,3");
  } else {
    // Highlight manual control path when cruise is off
    document.getElementById("manual-control").setAttribute("stroke", "#ef4444");
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

// Position the elements in the mechanical diagram
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

  // Position tooltip trigger points
  document.getElementById("manual-control-tooltip").setAttribute("x1", "120");
  document.getElementById("manual-control-tooltip").setAttribute("y1", "60");
  document.getElementById("manual-control-tooltip").setAttribute("x2", "125");
  document.getElementById("manual-control-tooltip").setAttribute("y2", "65");

  document.getElementById("cruise-command-tooltip").setAttribute("x1", "70");
  document.getElementById("cruise-command-tooltip").setAttribute("y1", "115");
  document.getElementById("cruise-command-tooltip").setAttribute("x2", "75");
  document.getElementById("cruise-command-tooltip").setAttribute("y2", "120");

  document.getElementById("ecu-control-tooltip").setAttribute("x1", "170");
  document.getElementById("ecu-control-tooltip").setAttribute("y1", "110");
  document.getElementById("ecu-control-tooltip").setAttribute("x2", "175");
  document.getElementById("ecu-control-tooltip").setAttribute("y2", "115");
}

// Main driving simulation loop
function simulateDrive(currentTime) {
  if (!lastTime) lastTime = currentTime;
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (cruiseEnabled) {
    // Cruise control adjusts speed to reach target cruise speed
    if (speed < cruiseSpeed) {
      // Need to accelerate
      speed += 0.3 * deltaTime * 60; // Gentle acceleration
      if (speed > cruiseSpeed) speed = cruiseSpeed; // Don't exceed target
    } else if (speed > cruiseSpeed) {
      // Need to decelerate
      speed -= 0.3 * deltaTime * 60; // Gentle deceleration
      if (speed < cruiseSpeed) speed = cruiseSpeed; // Don't go below target
    }
  } else {
    // Manual control
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
  // Initialize road and get lane set references
  const { laneSet1, laneSet2 } = initializeRoad();

  // Set up components
  createSpeedometerMarkings();
  updateMechanicalDiagramSpacing();
  setupEventListeners();
  setupPopup();

  // Add a title to the mechanical diagram
  const diagramTitle = document.createElement("h3");
  diagramTitle.textContent = "Cruise Control System";
  document.querySelector(".mechanical-diagram").prepend(diagramTitle);

  // Start the animation loop
  requestAnimationFrame(simulateDrive);
});
