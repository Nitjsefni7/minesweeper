const closeGameOver = document.querySelector(".btn-closeGameOver");
const reset = document.querySelector(".btn-reset");
const boardNode = document.querySelector("#board");
const flagCounter = document.querySelector(".counter").querySelector("span");

function createBoard(row_count, col_count, mine_count) {
	const board = {
		row_count,
		col_count,
		mine_count
	}

	for (let i=0; i<row_count; i++) {
		const row = document.createElement('div');
		row.className = "row";
		boardNode.append(row);
		for (let j=0; j<col_count; j++){
			const cell = document.createElement('div');
			cell.className = "cell";
			cell.id = `${i}_${j}`;
			row.append(cell);

			cell.addEventListener('click', function(){
				handleClick(i, j, board)
			});

			cell.addEventListener('contextmenu', function(event){
				event.preventDefault();
				handleRightClick(i,j)
			})
		}
	}
	let minePositions = [];
	minePositions = createMinePositions(board);
	placeTheMines(minePositions);

	reset.addEventListener("click", function(){
		resetGame(board);
	});
}

function createMinePositions(board) {	
	let minePositions = [];

	for (let i=0; i<board.mine_count; i++) {
		let x = randomNumber(0, board.row_count - 1);
		let y = randomNumber(0, board.col_count - 1);
		let position = [x,y];

		let isUnique = true;
		minePositions.forEach(function(element, index){
			if (element[0]==x && element[1]==y){
				i--;
				isUnique = false;
			}
		});
		if (isUnique) {
			minePositions.push(position);
		}
	}
	return minePositions;
}

function placeTheMines(minePositions) {

	for (let i=0; i<minePositions.length; i++) {
		let x = minePositions[i][0];
		let y = minePositions[i][1];
		let cellAtThisPosition = document.getElementById(`${x}_${y}`);
		cellAtThisPosition.classList.add("mine");
	}
}

function handleClick(x, y, board) {
	let cell = document.getElementById(`${x}_${y}`);

	if (cell.classList.contains("mine")) {
		let allMines = document.querySelectorAll(".mine");
		allMines.forEach(element => element.classList.add("revealed"))
	} else {
		reveal(x, y, board)
	}

	checkIfWon(board)
}

function reveal(x, y, board){
	let cell = document.getElementById(`${x}_${y}`);

	if (!(cell.classList.contains("revealed"))){
		if (cell.classList.contains("flagged")){
			cell.classList.remove("flagged")
			flagCounter.innerText--;
		}
		cell.classList.add("revealed");
		let mine_count_adjecent = 0;

		for (let m=Math.max(x-1, 0); m<=Math.min(x+1, board.row_count-1); m++){
			for (let n=Math.max(y-1, 0); n<=Math.min(y+1, board.col_count-1); n++){
				let adjecentCell = document.getElementById(`${m}_${n}`);

				if (adjecentCell.classList.contains("mine")) {
					mine_count_adjecent++;
				}
			}
		}

		if (mine_count_adjecent > 0) {
			cell.innerHTML = mine_count_adjecent;
		} else {
			cell.classList.add("noNumber");
			for (let m=Math.max(x-1, 0); m<=Math.min(x+1, board.row_count-1); m++){
				for (let n=Math.max(y-1, 0); n<=Math.min(y+1, board.col_count-1); n++){
					reveal(m, n, board)
				}
			}
		}
	}
}

function handleRightClick(x,y){
	let cell = document.getElementById(`${x}_${y}`);
	
	if (!(cell.classList.contains("revealed"))){
		if(cell.classList.contains("flagged")){
			cell.classList.remove("flagged");
			flagCounter.innerText--;
		} else {
			cell.classList.add("flagged");
			flagCounter.innerText++;
		}
	}
}

function checkIfWon(board) {
	let minesRevealed = document.querySelectorAll(".mine.revealed").length;
	let cellsStillHidden = board.row_count*board.col_count - document.querySelectorAll(".cell.revealed").length

	if (minesRevealed > 0) {
		showGameOver(false)
	} else if (cellsStillHidden ==board.mine_count){
		showGameOver(true)
	}
}

function showGameOver(result) {
	const gameOver = new Modal();
	if (result){
		gameOver.open().setColor("lime").setText("WYGRALES");
	} else {
		gameOver.open().setColor("red").setText("PRZEGRALES");
	}

	closeGameOver.addEventListener("click", function(){
		gameOver.close();
		reset.style.display = "block";
	});
	boardNode.classList.add("disable");
}

function resetGame(board){
	boardNode.innerHTML = '';
	boardNode.classList.remove("disable");
	createBoard(board.row_count, board.col_count, board.mine_count);
	reset.style.display = "none";
	flagCounter.innerText = "0";
}

function randomNumber(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min)
}

class Modal {
	constructor(){
		this.modal = document.querySelector("#modal");
	}
	open(){
		this.modal.style.display = "block";
		return this;
		}
	close(){
		this.modal.style.display = "none";
		}
	setText(text){
		this.modal.querySelector("#modal-text").innerText = text;
		}
	setColor(color){
		this.modal.querySelector("#modal-content").style.backgroundColor = color;
		return this;
		}
}

createBoard(10,10,15);
