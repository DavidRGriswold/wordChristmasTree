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
blinkBox.onchange = createChristmasTree;

createChristmasTree();

function createChristmasTree() {
    treeArea.innerHTML="";
    let words = wordArea.value.split("\n");
    words.sort((a,b)=>a.length-b.length);
    words.forEach( (word) => {
        if (word.trim()=="") return;
        let branch = document.createElement("div");
        branch.classList.add("branch");
        // now add spans for each letter
        for (let char of word.split("")) {
            let letter = document.createElement("span");
            letter.classList.add("letter");
            if (glowBox.checked) letter.classList.add("glow");
            if (blinkBox.checked) setUpBlinking(letter);
            letter.classList.add(colorClassList[currentColor]);
            letter.innerText = char;
            currentColor++;
            if (currentColor == colorClassList.length) currentColor = 0;
            branch.appendChild(letter);
        }
        treeArea.appendChild(branch);
        currentColor=0;
    });   
}

function setUpBlinking(letter) {
    setTimeout(() =>
        setInterval( () => switchGlow(letter)
        ,blinkTime*colorClassList.length)
    ,currentColor*blinkTime   );
    setTimeout(() =>
        setInterval( () => switchGlow(letter)
        ,blinkTime*colorClassList.length)
    ,(currentColor+1)*blinkTime   );
}

function switchGlow(/**@type HTMLElement*/ letter) {
    if (letter.classList.contains("glow")) {
        letter.classList.remove("glow");
    }else{
        letter.classList.add("glow");
    }
}