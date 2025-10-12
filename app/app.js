"use strict";

const version = {
    vers: "1.0.1",
    allPoint: 400,
    cellSize: 20
}
let intervalId;
let arrLife = [];
let stat = "newGame";
let recorder = false;
let recorderArr = [{ dataVersion: version}];

function createGameField(num, plaingFiled) {
    plaingFiled.innerHTML = "";
    clearInterval(intervalId);

    arrLife = [];
    const mode = document.querySelector("#optoins").value;

    for (let i = 0; i < num; i++) {
        let element = {
            id: i,
            life: false,
            el: document.createElement("div")
        }

        element.el.className = `point point${i}`;

        if (mode === "auto" && Math.random() < 0.3) {
            element.life = true;
            element.el.classList.add("active");
        }

        if (mode === "manual") {
            element.el.addEventListener("click", () => {
                if (stat === "newGame") {
                    element.life = !element.life;
                    element.el.classList.toggle("active");
                }
            });
        }

        arrLife.push(element);
        plaingFiled.append(element.el);
    }

    stat = "newGame";
}

function updatePoint(num) {
    arrLife.forEach(cell => {
        if (cell.life) cell.el.classList.add("active");
        else cell.el.classList.remove("active");
    });
    document.querySelector("#num").innerText = num;
}

function startGame() {
    if (stat !== "newGame") return;

    recorder = confirm("Начать запись игры?");
    stat = "inProgress";
    let num = 0;
    arrLife.forEach(cell => cell.el.style.pointerEvents = "none");

    let speed = document.querySelector("#speedStepData").value;
    let speedData = 1000;
    switch(speed){
        case "slow": speedData = 1500; break;
        case "normally": speedData = 1000; break;
        case "fast": speedData = 500; break;
    }

    addRecordItem(arrLife)

    intervalId = setInterval(() => {
        num++
        arrLife = stepLife(arrLife);
        updatePoint(num);

        checkGameOver(num);
        if (recorder) {
           addRecordItem(arrLife) 
        }
    }, speedData);
}
function checkGameOver(num) {
	let active = document.querySelectorAll(".active");
	if (!active.length) {
		setTimeout(()=>{
            console.log(recorderArr)
			alert(`Game over, all dead. Step game: ${num}`);
	    	clearInterval(intervalId);

            if (recorder) {
                saveRecorder();
            } else {
                window.location.reload();
            }
		}, 500)
	}
}
function addRecordItem(allPoint) {
    let thisStep = {
        step: recorderArr.length,
        activePoint: []
    }

    for (var i = 0; i < allPoint.length; i++) {
        if (allPoint[i].life) {
            thisStep.activePoint.push(allPoint[i])
        }
    }

    recorderArr.push(thisStep);
}
function stepLife(arrLife) {
    let cols = 20;
    let rows = 20;
    let newStates = new Array(arrLife.length).fill(false);

    for (let i = 0; i < arrLife.length; i++) {
        let x = i % cols;
        let y = Math.floor(i / cols);
        let neighbors = 0;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                let nx = x + dx;
                let ny = y + dy;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                    let ni = ny * cols + nx;
                    if (arrLife[ni].life) neighbors++;
                }
            }
        }

        if (arrLife[i].life) newStates[i] = (neighbors === 2 || neighbors === 3);
        else newStates[i] = (neighbors === 3);
    }

    for (let i = 0; i < arrLife.length; i++) arrLife[i].life = newStates[i];

    return arrLife;
}
function saveRecorder() {
    let container = document.createElement("div");
    container.className = "container";

    let elem = document.createElement("div");
    elem.className = "dataElem";
    elem.innerHTML = `<div class="recorderName">
        Действия с записью
    </div>
    <div class="textRecorder">
      Запись вашей игры «Life» успешно завершена! (≈${byteSize(JSON.stringify(recorderArr)).toFixed(4)}МБ) 
      <br><br>
      После сохранения запись станет <b>общедоступной</b> — её смогут увидеть и просмотреть все пользователи.  
      <br><br>
      Она появится в общем списке сохранённых игр, где вы и другие игроки сможете наблюдать развитие клеточных колоний, сравнивать стратегии и анализировать результаты.  
      <br><br>
      Таким образом, каждая ваша запись становится не только частью вашей игровой истории, но и вкладом в общую коллекцию симуляций «Жизни».  
      <br><br>
      📖 Делитесь, изучайте и вдохновляйтесь — ведь каждая новая запись открывает уникальные сценарии эволюции!
    </div>
    `

    let buttonContainer = document.createElement("div");
    buttonContainer.className = "buttonContainer";

    let containerInput = document.createElement("div");
    containerInput.className = "containerInput";

    let input = document.createElement("input");
    input.className = "inputElem";
    input.maxLength = 10;
    input.placeholder = "Имя записи"
    containerInput.append(input);

    let saveBtn = document.createElement("button");
    saveBtn.id = "saveBtn";
    saveBtn.innerText = "Сохранить на сервере";

    let canselBtn = document.createElement("button");
    canselBtn.id = "canselBtn";
    canselBtn.innerText = "Отмена";

    canselBtn.addEventListener("click", ()=>{
        removeModalRecorder(container)
    })

    buttonContainer.append(saveBtn, canselBtn)
    elem.append(containerInput, buttonContainer)
    container.append(elem);
    document.body.append(container)
}
function removeModalRecorder(container) {
    recorderArr = [{ dataVersion: version}];

    container.remove();
}
document.querySelector("#startGame").addEventListener("click", () => startGame());
document.querySelector("#optoins").addEventListener("change", () => {
    createGameField(400, document.querySelector("#plaing-filed"));
});

createGameField(400, document.querySelector("#plaing-filed"));

const byteSize = (str) => {
    let byte = new Blob([str]).size
    return byte / 1024 / 1024;
};