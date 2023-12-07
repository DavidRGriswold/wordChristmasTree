/** @type HTMLTextAreaElement */
let wordArea = document.getElementById("wordArea");
/** @type HTMLDivElement */
let treeArea= document.getElementById("theTree");
let glowBox = document.getElementById("glowCheckbox");
let blinkBox = document.getElementById("blinkCheckbox");
let colorClassList = ["red","green","blue","white"];
let currentColor = 0;
let blinkTime = 300;

wordArea.oninput = createChristmasTree;
glowBox.onchange = createChristmasTree;
blinkBox.onchange = setUpBlinking;
let timeouts = [];
let intervals = [];
createChristmasTree();

function createChristmasTree() {
    let direction = 1;

    treeArea.innerHTML="";
    let words = wordArea.value.split("\n");
    words.sort((a,b)=>a.length-b.length);
    words.forEach( (word) => {
        if (word.trim()=="") return;
        let branch = document.createElement("div");
        branch.classList.add("branch");
        // now add spans for each letter
        let chars = word.split("");
        if (direction < 0) {
            chars.reverse();
        }
        for (let char of chars) {
            let letter = document.createElement("span");
            letter.classList.add("letter");
            if (glowBox.checked) letter.classList.add("glow");
            letter.classList.add(colorClassList[currentColor]);
            letter.innerText = char;
            currentColor++;
            if (currentColor == colorClassList.length) currentColor = 0;
            if (direction > 0) branch.appendChild(letter);
            else branch.insertBefore(letter, branch.firstChild);
        }
        
        treeArea.appendChild(branch);
        direction=-direction
        
        
    });
    currentColor=0; 
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
    if (blinkBox.checked) {
        for (let i = 0; i < colorClassList.length; i++){
            let color = colorClassList[i];
            let startTime = i * blinkTime;
            let switchTime = blinkTime * colorClassList.length;
            timeouts.push(
                setTimeout( () => {
                    intervals.push(setInterval( () => {
                        switchGlow(color);
                        },switchTime
                    ));
                }
                ,startTime
            ));
            timeouts.push(
                setTimeout( () => {
                    intervals.push(setInterval( () => {
                        switchGlow(color);
                        },switchTime
                    ));
                }
                ,startTime+blinkTime
            ));
        }
      
    }else{
        clearTimeoutsAndIntervals();
        document.getElementsByClassName("glow").forEach((e)=>e.classList.remove("glow"));
    }
}
        


function switchGlow(/**@type HTMLElement*/ color) {
    let letters = document.getElementsByClassName(color);
    for (letter of letters) {
    if (letter.classList.contains("glow")) {
        letter.classList.remove("glow");
    }else{
        letter.classList.add("glow");
    }
}
}