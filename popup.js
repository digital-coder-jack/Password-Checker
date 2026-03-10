const passwordInput = document.getElementById("passwordInput");
const nameInput = document.getElementById("nameInput");
const toggleVisibility = document.getElementById("toggleVisibility");
const scoreLabel = document.getElementById("scoreLabel");
const strengthLabel = document.getElementById("strengthLabel");
const meterFill = document.getElementById("meterFill");
const entropyLabel = document.getElementById("entropyLabel");
const varietyLabel = document.getElementById("varietyLabel");
const crackLabel = document.getElementById("crackLabel");
const insightsList = document.getElementById("insightsList");

const lengthInput = document.getElementById("lengthInput");
const lengthValue = document.getElementById("lengthValue");
const optNumbers = document.getElementById("optNumbers");
const optSymbols = document.getElementById("optSymbols");
const optMixCase = document.getElementById("optMixCase");
const optShuffle = document.getElementById("optShuffle");
const generatedOutput = document.getElementById("generatedOutput");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const copyStatus = document.getElementById("copyStatus");

const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?"
};

const COMMON_PASSWORDS = [
  "password", "123456", "12345678", "123456789", "qwerty",
  "111111", "123123", "abc123", "password1", "letmein",
  "iloveyou", "admin", "welcome", "monkey", "dragon",
  "football", "shadow", "master", "login", "freedom"
];

const KEYBOARD_PATTERNS = [
  "qwerty", "asdf", "zxcv", "1234", "12345", "123456",
  "0987", "abcd", "password"
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setFullMode() {
  const params = new URLSearchParams(window.location.search);
  const shouldFull = params.get("full") === "1" || window.innerWidth >= 520;
  document.body.classList.toggle("full", shouldFull);
}

function getNameParts(value) {
  const matches = value.match(/[a-z]+/gi);
  if (!matches) return [];
  return matches.map((part) => part.toLowerCase()).filter((part) => part.length >= 3);
}

function randomInt(max) {
  const array = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let value = 0;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
}

function randomChar(set) {
  return set[randomInt(set.length)];
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function leetify(input) {
  const map = {
    a: "4",
    e: "3",
    i: "1",
    o: "0",
    s: "$",
    t: "7",
    l: "1"
  };
  return input
    .split("")
    .map((ch) => {
      const lower = ch.toLowerCase();
      if (map[lower] && randomInt(100) < 45) {
        return map[lower];
      }
      return ch;
    })
    .join("");
}

function buildNameSeed(rawName, mixCase) {
  const parts = rawName.match(/[a-z]+/gi) || [];
  if (parts.length === 0) return "";
  const base = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
  const leet = leetify(base);
  if (!mixCase) return leet.toLowerCase();
  return leet
    .split("")
    .map((ch, idx) => (idx % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
    .join("");
}

function generatePassword() {
  const length = clamp(parseInt(lengthInput.value, 10) || 16, 8, 32);
  const includeNumbers = optNumbers.checked;
  const includeSymbols = optSymbols.checked;
  const mixCase = optMixCase.checked;
  const shuffle = optShuffle.checked;

  const nameSeed = buildNameSeed(nameInput.value, mixCase);
  const required = [];

  if (mixCase) {
    required.push(randomChar(CHARSETS.upper));
    required.push(randomChar(CHARSETS.lower));
  } else {
    required.push(randomChar(CHARSETS.lower));
  }

  if (includeNumbers) required.push(randomChar(CHARSETS.digits));
  if (includeSymbols) required.push(randomChar(CHARSETS.symbols));

  let pool = CHARSETS.lower;
  if (mixCase) pool += CHARSETS.upper;
  if (includeNumbers) pool += CHARSETS.digits;
  if (includeSymbols) pool += CHARSETS.symbols;

  let chars = nameSeed.split("");
  if (chars.length > length - required.length) {
    chars = chars.slice(0, Math.max(0, length - required.length));
  }

  chars.push(...required);

  while (chars.length < length) {
    chars.push(randomChar(pool));
  }

  if (shuffle) shuffleArray(chars);

  const result = chars.slice(0, length).join("");
  generatedOutput.value = result;
  copyStatus.textContent = "Generated a password with name, symbols, and numbers.";

  updateAnalysis();
}

function hasSequential(text) {
  const value = text.toLowerCase();
  let run = 1;
  for (let i = 1; i < value.length; i += 1) {
    const prev = value.charCodeAt(i - 1);
    const curr = value.charCodeAt(i);
    const prevChar = value[i - 1];
    const currChar = value[i];

    const prevIsDigit = /\d/.test(prevChar);
    const currIsDigit = /\d/.test(currChar);
    const prevIsAlpha = /[a-z]/.test(prevChar);
    const currIsAlpha = /[a-z]/.test(currChar);

    if ((prevIsDigit && currIsDigit) || (prevIsAlpha && currIsAlpha)) {
      if (curr === prev + 1 || curr === prev - 1) {
        run += 1;
        if (run >= 3) return true;
        continue;
      }
    }
    run = 1;
  }
  return false;
}

function hasKeyboardPattern(text) {
  const lower = text.toLowerCase();
  return KEYBOARD_PATTERNS.some((pattern) => lower.includes(pattern));
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "Instant";
  const units = [
    { label: "sec", size: 60 },
    { label: "min", size: 60 },
    { label: "hr", size: 24 },
    { label: "day", size: 365 },
    { label: "yr", size: 10 },
    { label: "decade", size: 10 },
    { label: "century", size: 10 }
  ];
  let value = seconds;
  let label = "sec";
  for (const unit of units) {
    label = unit.label;
    if (value < unit.size) break;
    value /= unit.size;
  }
  const rounded = value < 10 ? value.toFixed(1) : Math.round(value).toString();
  return `${rounded} ${label}${rounded === "1" ? "" : "s"}`;
}

function estimateCrackTime(entropy) {
  if (!entropy) return 0;
  const guessesPerSecond = 1e10;
  const averageGuesses = Math.pow(2, Math.max(entropy - 1, 0));
  return averageGuesses / guessesPerSecond;
}

function labelToClass(label) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function analyzePassword(password, name) {
  if (!password) {
    return {
      score: 0,
      label: "No data",
      entropy: 0,
      variety: 0,
      issues: ["Type a password to see strength insights."]
    };
  }

  const lower = /[a-z]/.test(password);
  const upper = /[A-Z]/.test(password);
  const digits = /\d/.test(password);
  const symbols = /[^a-zA-Z0-9]/.test(password);
  const variety = [lower, upper, digits, symbols].filter(Boolean).length;

  const setSize = (lower ? 26 : 0) + (upper ? 26 : 0) + (digits ? 10 : 0) + (symbols ? 32 : 0) || 1;
  const entropy = Math.round(Math.log2(setSize) * password.length);

  let score = Math.min(40, password.length * 2);
  score += variety * 10;
  score += Math.min(20, Math.floor(entropy / 4));

  const issues = [];
  const passwordLower = password.toLowerCase();
  const nameParts = getNameParts(name || "");

  if (COMMON_PASSWORDS.includes(passwordLower)) {
    issues.push("Matches a common password. Avoid reused or popular choices.");
    score = 0;
  }

  if (password.length < 8) {
    issues.push("Too short. Use at least 12 characters.");
  }

  if (variety < 3) {
    issues.push("Add more character types (upper, lower, digits, symbols).");
    score -= 8;
  }

  if (/(.)\1{2,}/.test(password)) {
    issues.push("Repeated characters make it easier to guess.");
    score -= 12;
  }

  if (hasSequential(password)) {
    issues.push("Sequential patterns like 123 or abc reduce strength.");
    score -= 12;
  }

  if (hasKeyboardPattern(password)) {
    issues.push("Keyboard patterns (qwerty, asdf) are easy to guess.");
    score -= 10;
  }

  if (/\b(19|20)\d{2}\b/.test(password)) {
    issues.push("Years are predictable. Mix in unrelated numbers.");
    score -= 6;
  }

  if (nameParts.some((part) => passwordLower.includes(part))) {
    issues.push("Contains your name. Use a less personal base.");
    score -= 15;
  }

  if (variety === 1) {
    issues.push("Single character type. Mix letters, digits, and symbols.");
    score -= 10;
  }

  score = clamp(score, 0, 100);

  let label = "Weak";
  if (score >= 85) label = "Elite";
  else if (score >= 70) label = "Strong";
  else if (score >= 50) label = "Good";
  else if (score >= 30) label = "Fair";

  if (issues.length === 0) {
    issues.push("Looks strong. Avoid reuse and rotate regularly.");
  }

  return { score, label, entropy, variety, issues };
}

function updateAnalysis() {
  const password = passwordInput.value;
  const name = nameInput.value;
  const analysis = analyzePassword(password, name);
  const crackSeconds = estimateCrackTime(analysis.entropy);

  scoreLabel.textContent = `Score: ${analysis.score}`;
  strengthLabel.textContent = analysis.label;
  strengthLabel.className = `badge ${labelToClass(analysis.label)}`;
  meterFill.style.width = `${analysis.score}%`;
  entropyLabel.textContent = `Entropy: ${analysis.entropy} bits`;
  varietyLabel.textContent = `Variety: ${analysis.variety}/4`;
  crackLabel.textContent = password
    ? `Crack time: ${formatDuration(crackSeconds)}`
    : "Crack time: -";

  insightsList.textContent = "";
  analysis.issues.forEach((issue) => {
    const li = document.createElement("li");
    li.textContent = issue;
    insightsList.appendChild(li);
  });
}

function togglePasswordVisibility() {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  toggleVisibility.textContent = isHidden ? "Hide" : "Show";
}

function handleGlobalClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const interactive = target.closest("input, button, textarea, select, label, a");
  if (!interactive && document.activeElement && typeof document.activeElement.blur === "function") {
    document.activeElement.blur();
  }
}

function fallbackCopy(value) {
  try {
    generatedOutput.focus();
    generatedOutput.select();
    const success = document.execCommand && document.execCommand("copy");
    if (generatedOutput.setSelectionRange) {
      generatedOutput.setSelectionRange(value.length, value.length);
    }
    return !!success;
  } catch (error) {
    return false;
  }
}

async function copyGenerated() {
  const value = generatedOutput.value;
  if (!value) {
    copyStatus.textContent = "Generate a password first.";
    return;
  }
  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      const success = fallbackCopy(value);
      copyStatus.textContent = success
        ? "Copied to clipboard."
        : "Copy failed. Select and copy manually.";
      return;
    }
    await navigator.clipboard.writeText(value);
    copyStatus.textContent = "Copied to clipboard.";
  } catch (error) {
    const success = fallbackCopy(value);
    copyStatus.textContent = success
      ? "Copied to clipboard."
      : "Copy failed. Select and copy manually.";
  }
}

lengthInput.addEventListener("input", () => {
  lengthValue.textContent = lengthInput.value;
});

window.addEventListener("resize", setFullMode);
passwordInput.addEventListener("input", updateAnalysis);
nameInput.addEventListener("input", updateAnalysis);

optNumbers.addEventListener("change", updateAnalysis);
optSymbols.addEventListener("change", updateAnalysis);
optMixCase.addEventListener("change", updateAnalysis);
optShuffle.addEventListener("change", updateAnalysis);

toggleVisibility.addEventListener("click", togglePasswordVisibility);
generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyGenerated);
document.addEventListener("click", handleGlobalClick);

lengthValue.textContent = lengthInput.value;
setFullMode();
updateAnalysis();
