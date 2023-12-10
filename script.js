/// <reference path='libs/lz-string.js'>

/** @type HTMLTextAreaElement */
let wordArea = document.getElementById("wordArea");
/** @type HTMLDivElement */
let treeArea = document.getElementById("theTree");
let glowBox = document.getElementById("glowCheckbox");
let blinkBox = document.getElementById("blinkCheckbox");
let musicBox = document.getElementById("musicCheckbox");
/** @type HTMLInputElement */
let shareURL = document.getElementById("shareURLBox");
/** @type HTMLAudioElement */
let song = document.getElementById("song");
let colorClassList = ["red", "green", "blue", "white"];
let currentColor = 0;
let blinkTime = 300;

wordArea.oninput = createChristmasTree;
glowBox.onchange = createChristmasTree;
blinkBox.onchange = setUpBlinking;
musicBox.onchange = update;
shareURL.ondblclick = copyShareURL;
document.onclick = update;

let timeouts = [];
let intervals = [];

let ourURL = new URL(window.location.href);
let inputb64 = ourURL.searchParams.get("w");
let inputBlink = ourURL.searchParams.get("b");
let inputMusic = ourURL.searchParams.get("m");
let inputGlow = ourURL.searchParams.get("g");
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
    const b64txt = convertStringToBase64URL(wordArea.value);
    url.searchParams.append("w", b64txt);
    shareURL.value = url.href;
}

function createChristmasTree() {
    update();
    let direction = 1;

    treeArea.innerHTML = "";
    let words = wordArea.value.split("\n");
    words.sort((a, b) => a.length - b.length);
    words.forEach((word) => {
        if (word.trim() == "") return;
        let branch = document.createElement("div");
        branch.classList.add("branch");
        // now add spans for each letter
        let chars = word.split("");
        if (direction < 0) {
            chars.reverse();
        }
        for (let char of chars) {
            let letter = document.createElement("span");
            if (char.match(/\S/g)) {
                letter.classList.add("letter");
                if (glowBox.checked) letter.classList.add("glow");
                letter.classList.add(colorClassList[currentColor]);
                currentColor++;
                if (currentColor == colorClassList.length) currentColor = 0;
            }
            letter.innerText = char;
            if (direction > 0) branch.appendChild(letter);
            else branch.insertBefore(letter, branch.firstChild);
        }

        treeArea.appendChild(branch);
        direction = -direction

    });
    currentColor = 0;
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
    update();
    if (blinkBox.checked) {
        for (let i = 0; i < colorClassList.length; i++) {
            let color = colorClassList[i];
            let startTime = i * blinkTime;
            let switchTime = blinkTime * colorClassList.length;
            timeouts.push(
                setTimeout(() => {
                    intervals.push(setInterval(() => {
                        switchGlow(color);
                    }, switchTime
                    ));
                }
                    , startTime
                ));
            timeouts.push(
                setTimeout(() => {
                    intervals.push(setInterval(() => {
                        switchGlow(color);
                    }, switchTime
                    ));
                }
                    , startTime + blinkTime
                ));
        }

    } else {
        clearTimeoutsAndIntervals();
        if (!glowBox.checked) {
            let glowers = document.querySelectorAll(".glow");
            for (let glower of glowers) {
                glower.classList.remove("glow");
            }
        } else {
            let letters = document.querySelectorAll(".letter");
            for (let letter of letters) {
                if (!letter.classList.contains("glow")) letter.classList.add("glow");
            }
        }

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
