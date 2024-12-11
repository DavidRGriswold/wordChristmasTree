/// <reference path='libs/lz-string.js'>

/** @type HTMLTextAreaElement */
let wordArea = document.getElementById("wordArea");
/** @type HTMLDivElement */
let tree = document.getElementById("theTree");
let treeArea = document.getElementById("treeArea");
let glowBox = document.getElementById("glowCheckbox");
let blinkBox = document.getElementById("blinkCheckbox");
let musicBox = document.getElementById("musicCheckbox");
let snowBox = document.getElementById("snowCheckbox");
let fullButton = document.getElementById("fullButton");
/** @type HTMLInputElement */
let shareURL = document.getElementById("shareURLBox");
/** @type HTMLAudioElement */
let song = document.getElementById("song");
let colorClassList = ["red", "green", "blue", "white"];
let currentColor = 0;
let blinkingColor = -1;
let blinkTime = 300;

wordArea.oninput = createChristmasTree;
glowBox.onchange = update;
blinkBox.onchange = setUpBlinking;
snowBox.onchange = setUpSnow;
musicBox.onchange = update;
shareURL.ondblclick = copyShareURL;
document.onclick = update;
fullButton.onclick = switchFull;

let timeouts = [];
let intervals = [];

let ourURL = new URL(window.location.href);
let inputb64 = ourURL.searchParams.get("w");
let inputBlink = ourURL.searchParams.get("b");
let inputMusic = ourURL.searchParams.get("m");
let inputGlow = ourURL.searchParams.get("g");
let inputSnow = ourURL.searchParams.get("s");
let baseName;
baseName = window.location.href;
if (inputb64) {
    let inputText = convertBase64URLtoString(inputb64);
    //let inputText = LZString.LZString.decompressFromEncodedURIComponent(inputb64);
    wordArea.value = inputText;
}
if (inputGlow && inputGlow == "1") {
    glowBox.checked = true;
}

if (inputMusic && inputMusic == "1") {
    musicBox.checked = true;
}

if (inputBlink && inputBlink == "1") {
    blinkBox.checked = true;
    setUpBlinking();
}

if (inputSnow && inputSnow == "1") {
    snowBox.checked = true;
    setUpSnow();
}

if (baseName.includes("?")) baseName = baseName.substring(0, baseName.indexOf("?"));


createChristmasTree();

function update() {
    if (musicBox.checked) {
        song.play();
    } else {
        song.pause();
    }
    let url = new URL(baseName);
    if (blinkBox.checked) url.searchParams.append("b", "1");
    if (musicBox.checked) url.searchParams.append("m", "1");
    if (glowBox.checked) url.searchParams.append("g", "1");
    if (snowBox.checked) url.searchParams.append("s", "1");
    const b64txt = convertStringToBase64URL(wordArea.value);
    url.searchParams.append("w", b64txt);
    shareURL.value = url.href;
    if (!blinkBox.checked) {
        if (glowBox.checked) {

            document.querySelectorAll(".letter").forEach((el) => el.classList.add("glow"));
        } else {
            document.querySelectorAll(".letter").forEach((el) => el.classList.remove("glow"));
        }
    }
}

function createChristmasTree() {
    update();
    let direction = 1;

    tree.innerHTML = "";
    let words = wordArea.value.split("\n");
    words.sort((a, b) => a.length - b.length);
    let extraPadding = 0;
    let lastlength = 0;
    words.forEach((word) => {
        let len = word.length;
        if (len == lastlength) {
            extraPadding += 0.25;
        } else {
            extraPadding -= 0.5 * (len - lastlength);
            if (extraPadding < 0) extraPadding = 0;
        }
        lastlength = len;
        let numSpaces = len - word.trim().length;
        let numDots = Math.floor(numSpaces / 2);
        numSpaces -= 2 * numDots;
        // split these spaces in between letters and to the edges

        word = word.trim();
        if (numDots > 1) { numDots--; word = " " + word + " " }
        word = "•".repeat(numDots) + word + "•".repeat(numDots);
        if (word.trim() == "") return;
        let branch = document.createElement("div");
        branch.classList.add("branch");
        let numSpots = word.length + 3;
        let spacing = (numSpaces + extraPadding) / numSpots;
        branch.style.paddingLeft = 1.6 + spacing + "ch";
        branch.style.paddingRight = 1.6 + "ch";
        branch.style.letterSpacing = spacing + "ch";
        // now add spans for each letter
        let chars = word.split("");
        if (direction < 0) {
            chars.reverse();
        }
        for (let char of chars) {
            let letter = document.createElement("span");
            if (char.match(/\S/g)) {
                letter.classList.add("letter");
                letter.classList.add(colorClassList[currentColor]);
                currentColor++;
                if (currentColor == colorClassList.length) currentColor = 0;
            }
            letter.innerText = char;
            ;
            if (direction > 0) branch.appendChild(letter);
            else branch.insertBefore(letter, branch.firstChild);
        }

        tree.appendChild(branch);
        direction = -direction

    });
    currentColor = 0;
    update();
}

function clearTimeoutsAndIntervals() {
    while (timeouts.length > 0) {
        clearTimeout(timeouts.pop());
    }
    while (intervals.length > 0) {
        clearInterval(intervals.pop());
    }
}

function setUpBlinking() {
    clearTimeoutsAndIntervals();
    if (blinkBox.checked) {
        intervals.push(setInterval(switchColor, blinkTime));
    }
    update();
}

function switchColor() {
    blinkingColor++;
    if (blinkingColor === colorClassList.length) blinkingColor = 0;
    if (!glowBox.checked) {
        document.querySelectorAll(".letter").forEach((el) => el.classList.remove("glow"));
        document.querySelectorAll("." + colorClassList[blinkingColor]).forEach((el) => el.classList.add("glow"));
    }else{
        document.querySelectorAll(".letter").forEach((el) => el.classList.add("glow"));
        document.querySelectorAll("." + colorClassList[blinkingColor]).forEach((el) => el.classList.remove("glow"));
    }
    }


function switchGlow(/**@type HTMLElement*/ color) {
    update();
    let letters = document.getElementsByClassName(color);
    for (letter of letters) {
        if (letter.classList.contains("glow")) {
            letter.classList.remove("glow");
        } else {
            letter.classList.add("glow");
        }
    }
}

function convertStringToBase64URL(str) {
    // // convert to bytes
    // let td = new TextEncoder();
    // const bytes = td.encode(str);
    // const binString = String.fromCodePoint(...bytes);
    // const b64 = btoa(binString);
    // return b64.replace("/","_").replace("+","-");
    return LZString.compressToEncodedURIComponent(str);
}

function convertBase64URLtoString(b64) {
    // const binString = atob(b64.replace("_","/").replace("-","+"));
    // const bytes = Uint8Array.from(binString,(m)=>m.codePointAt(0));
    // return new TextDecoder().decode(bytes);
    return LZString.decompressFromEncodedURIComponent(b64);
}

function copyShareURL() {
    shareURL.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(shareURL.value);
    shareURL.setSelectionRange(0, 0);
}

function setUpSnow() {
    if (snowBox.checked) {
        // add 50 snowflakes with a 0.2 second delay in each
        let area = document.getElementById("treeArea");
        for (let i = 0; i < 50; i++) {
            let flake = document.createElement("div");
            flake.classList.add("flake");
            let maxPercent = (1 - flake.offsetWidth / area.offsetWidth) * 100;
            flake.style.left = Math.random() * maxPercent + "%";
            flake.style.top = "-1rem";
            flake.style.animationDelay = 0.2 * i + "s";
            area.insertBefore(flake,area.firstChild);
        }
    } else {
        let flakes = document.querySelectorAll(".flake");
        for (let flake of flakes) {
            flake.remove();
        }
    }
}

function switchFull() {
    if (treeArea.classList.contains("full")) {
        treeArea.classList.remove("full");
        document.body.classList.remove("full");
    }else {
        treeArea.classList.add("full");
        document.body.classList.add("full");
    }
}