function createBoard(row_count, col_count, mine_count) {
	const board = document.getElementById("board");

	for (let i=0; i<row_count; i++) {
		const row = document.createElement('div');
		row.className = "row";
		board.append(row);
		for (let j=0; j<col_count; j++){
			const cell = document.createElement('div');
			cell.className = "cell";
			cell.id = `${i}_${j}`;
			row.append(cell);

			cell.addEventListener('click', function(){
				handleClick(i,j)
			});

			cell.addEventListener('contextmenu', function(event){
				event.preventDefault();
				handleRightClick(i,j)
			})
		}
	}
	let minePositions = [];
	minePositions = createMinePositions(mine_count, row_count, col_count);
	console.log(minePositions.length)
	placeTheMines(minePositions);
}

function createMinePositions(mine_count, row_count, col_count) {	
	let minePositions = [];

	for (let i=0; i<mine_count; i++) {
		let x = randomNumber(0, row_count - 1);
		let y = randomNumber(0, col_count - 1);
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

function handleClick(x, y) {
	let cell = document.getElementById(`${x}_${y}`);

	if (cell.classList.contains("mine")) {
		let allMines = document.querySelectorAll(".mine");
		allMines.forEach(element => element.classList.add("revealed"))
	} else {
		reveal(x,y)
	}
}

function reveal(x,y){
	let cell = document.getElementById(`${x}_${y}`);

	if (!(cell.classList.contains("revealed"))){
		cell.classList.add("revealed");
		let mine_count_adjecent = 0;

		for (let m=Math.max(x-1, 0); m<=Math.min(x+1, row_count-1); m++){
			for (let n=Math.max(y-1, 0); n<=Math.min(y+1, col_count-1); n++){
				let adjecentCell = document.getElementById(`${m}_${n}`);

				if (adjecentCell.classList.contains("mine")) {
					mine_count_adjecent++;
				}
			}
		}

		if (mine_count_adjecent > 0) {
			cell.innerHTML = mine_count_adjecent;
		} else {
			for (let m=Math.max(x-1, 0); m<=Math.min(x+1, row_count-1); m++){
				for (let n=Math.max(y-1, 0); n<=Math.min(y+1, col_count-1); n++){
					reveal(m,n)
				}
			}
		}
	}
}

function handleRightClick(x,y){
	let cell = document.getElementById(`${x}_${y}`);

	if (!(cell.classList.contains("revealed"))){
		if(cell.classList.contains("flagged")){
			cell.classList.remove("flagged")
		} else {
			cell.classList.add("flagged")
		}
	}
}	

function randomNumber(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min)
}


const row_count = 10;
const col_count = 10;
createBoard(10,10,15);