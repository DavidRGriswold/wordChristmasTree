/** @type HTMLTextAreaElement */
let wordArea = document.getElementById("wordArea");
/** @type HTMLDivElement */
let treeArea= document.getElementById("theTree");
let glowBox = document.getElementById("glowCheckbox");

let colorClassList = ["red","green","blue","white"];
let currentColor = 0;
wordArea.oninput = createChristmasTree;
glowBox.onchange = createChristmasTree;
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