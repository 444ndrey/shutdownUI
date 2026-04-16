const { invoke } = window.__TAURI__.core;

let statusMsgEl;
let lastCustomMinutes = null;
let lastCustomButton;
let timerInterval = null;
let remainingSeconds = 0;

async function showMessage(message) {
  statusMsgEl.textContent = message;
}

const app = document.querySelector('body');
function lockUI(value = true){
    app.classList.toggle('locked', value);
}


async function shutdownInSeconds(seconds) {
  try {
    lockUI();
    const result = await invoke("shutdown_in_seconds", { seconds });
    showMessage(result);
    if (seconds > 0) {
      startTimer(seconds);
      localStorage.setItem('shutdownEndTime', Date.now() + seconds * 1000);
    }
  } catch (error) {
    showMessage(`Error: ${error}`);
  }
  finally {
    lockUI(false);
  }
}

async function cancelShutdown() {
  try {
     lockUI();
    const result = await invoke("cancel_shutdown");
    showMessage(result);
    stopTimer();
    localStorage.removeItem('shutdownEndTime');
  } catch (error) {
    showMessage(`Error: ${error}`);
  }
  finally{
     lockUI(false);
  }
}

async function shutdownLastCustom() {
  if (lastCustomMinutes) {
    await customShutdown(lastCustomMinutes);
  } else {
    showMessage("No last custom time set.");
  }
}

async function customShutdown(minutes) {
  const seconds = minutes * 60;
  await shutdownInSeconds(seconds);
}

function updateLastCustomButton() {
  if (lastCustomMinutes) {
    lastCustomButton.textContent = `Custom (${lastCustomMinutes} min)`;
  } else {
    lastCustomButton.textContent = "Custom";
  }
}

function startTimer(seconds) {
  remainingSeconds = seconds;
  updateCountdown();
  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateCountdown();
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      hideTimer();
      showButtons();
      localStorage.removeItem('shutdownEndTime');
      showMessage("Shutdown initiated.");
    }
  }, 1000);
  hideButtons();
  showTimer();
}

function updateCountdown() {
  const min = Math.floor(remainingSeconds / 60);
  const sec = remainingSeconds % 60;
  document.getElementById('countdown').textContent = `${min}:${sec.toString().padStart(2, '0')}`;
}

function hideButtons() {
  document.querySelectorAll('#shutdown-now, #shutdown-30m, #shutdown-1h, #shutdown-2h, #last-custom, #custom-form').forEach(el => el.style.display = 'none');
}

function showButtons() {
  document.querySelectorAll('#shutdown-now, #shutdown-30m, #shutdown-1h, #shutdown-2h, #last-custom, #custom-form').forEach(el => el.style.display = '');
}

function showTimer() {
  document.getElementById('timer').style.display = 'block';
}

function hideTimer() {
  document.getElementById('timer').style.display = 'none';
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    remainingSeconds = 0;
    hideTimer();
    showButtons();
    localStorage.removeItem('shutdownEndTime');
  }
}

async function checkExistingShutdown() {
  const storedEndTime = localStorage.getItem('shutdownEndTime');
  if (storedEndTime) {
    const endTime = parseInt(storedEndTime);
    const now = Date.now();
    if (endTime > now) {
      try {
        const result = await invoke("cancel_shutdown", {});
        if (result === "Shutdown cancelled.") {
          // There was a shutdown, re-schedule
          const remainingMs = endTime - now;
          const remainingSec = Math.ceil(remainingMs / 1000);
          await shutdownInSeconds(remainingSec);
          showMessage(`Timer was recreated with saved time`);
        } else {
          // No shutdown, remove
          localStorage.removeItem('shutdownEndTime');
        }
      } catch (error) {
        localStorage.removeItem('shutdownEndTime');
      }
    } else {
      localStorage.removeItem('shutdownEndTime');
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  statusMsgEl = document.querySelector("#status-msg");
  lastCustomButton = document.querySelector("#last-custom");

  checkExistingShutdown();

  document.querySelector("#shutdown-30m").addEventListener("click", () => {
    shutdownInSeconds(1800);
  });

  document.querySelector("#shutdown-1h").addEventListener("click", () => {
    shutdownInSeconds(3600);
  });

  document.querySelector("#shutdown-2h").addEventListener("click", () => {
    shutdownInSeconds(7200);
  });

  document.querySelector("#last-custom").addEventListener("click", () => {
    shutdownLastCustom();
  });

  document.querySelector("#cancel").addEventListener("click", () => {
    cancelShutdown();
  });

  document.querySelector("#custom-input").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });

  document.querySelector("#custom-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const inputEl = document.querySelector("#custom-input");
    const inputValue = inputEl.value;
    const minutes = parseInt(inputValue);
    if (inputValue && minutes > 0) {
      lastCustomMinutes = minutes;
      updateLastCustomButton();
      showMessage(`Custom time set to ${minutes} minutes.`);
      inputEl.value = '';
    } else {
      showMessage("Please enter a valid positive integer for minutes.");
    }
  });
});
