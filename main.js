//Saper by Grz
 
var MYAPP = MYAPP || {};
//sprawdzam przelaczenie sie miedzy galeziami
//główna funkcja w postaci IIFE
(function(nms) {
	//definujemyn dostęp do elementów interfejsu
	const closeGameOver = document.querySelector(".btn-closeGameOver");
	const reset = document.querySelector(".btn-reset");
	const boardNode = document.querySelector("#board");
	const flagCounter = document.querySelector(".counter").querySelector("span");
	const mineCounter = document.querySelector(".mine-counter").querySelector("span");
	const timer = document.querySelector(".timer").querySelector("span");
	let gameStarted = false; //zmienna używana do odpalenia zegara po pierwszym kliknięciu
	let interval;

	const board = { //obiekt z własicwościami boardu
		row_count : 10,
		col_count : 10,
		mine_count : 15
	}

	const init = function(){
		mineCounter.innerText = board.mine_count; //wyświetla liczbę min na interfejsie
		//dwie pętle for do tworzenia każdej komórki boardu
		for (let i=0; i<board.row_count; i++) {
			const row = document.createElement('div');
			row.className = "row";
			boardNode.append(row);
			for (let j=0; j<board.col_count; j++){
				const cell = document.createElement('div');
				cell.className = "cell";
				cell.id = `${i}_${j}`;
				row.append(cell);

				//dodajemy eventlistener do każdej komórki wrażliwy na lewy i prawy przycisk myszy
				cell.addEventListener('click', function(){
					handleClick(i, j)
				});

				cell.addEventListener('contextmenu', function(event){
					event.preventDefault();
					handleRightClick(i,j)
				})
			}
		}
		//tworzenie i umiejscowienie min
		placeTheMines(createMinePositions());

		//zaprogramowanie przycisku resetującego grę
		reset.addEventListener("click", function(){
			resetGame();
		});
	}

	//funkcja losująca położenie min i zwracająca tablice z koordynatami
	const createMinePositions = function() {	
		let minePositions = [];
		//uzywamy zdefiniwanej nizej fukncji randomNumber, ktora losuje liczbe w podanym zakresie
		for (let i=0; i<board.mine_count; i++) {
			let x = randomNumber(0, board.row_count - 1);
			let y = randomNumber(0, board.col_count - 1);
			let position = [x,y];
			//zapobiegamy nakladania sie na sienie min poprzez parametr isUnique
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

	//funckja wykorzystująca koordynaty min aby przypasować każdą do odpowiedniej komórki w boardzie
	const placeTheMines = function(minePositions) {

		for (let i=0; i<minePositions.length; i++) {
			let x = minePositions[i][0];
			let y = minePositions[i][1];
			let cellAtThisPosition = document.getElementById(`${x}_${y}`);
			//komórka z miną otrzymuje klasę "mine"
			cellAtThisPosition.classList.add("mine");
		}
	}

	//funkcja okreslajaca co sie dzieje po kliknięciu lewym przyciskiem myszy na którąś z komórek
	const handleClick = function(x, y) {
		if (!gameStarted) { //warunek, który odpala zegar o ile jest to pierwsze kliknięcie w danej grze
			setTimer(); //zmienna gameStarted jest nastepnie zmieniona na true (dopiero reset gry zmienia ją z powrotem na false)
		}
		let cell = document.getElementById(`${x}_${y}`);
		//jeżeli dana komórka zaweria minę (klasę "mine") to gra odsłania wszystkie miny (do klasy cell mine dodajemy klase revealed)
		if (cell.classList.contains("mine")) {
			let allMines = document.querySelectorAll(".mine");
			allMines.forEach(element => element.classList.add("revealed"))
		} else {
			//jeżeli komórka nie zawiera bomby, to musimy ustalić jaką liczbę powinna wyświetlić po naciśnięciu na niej
			reveal(x, y)
		}
		//pod koniec sprawdzamy, czy z powodu kliknięcia gracz nie zakończył gry (z powodu odkrycia bomby lub odkryciu całej planszy)
		checkIfWon();
	}

	//funkcja ujawniająca liczby ukryte w klikniętej komórce i (ewentualnie) w sąsiednich komórkach
	const reveal = function(x, y){
		let cell = document.getElementById(`${x}_${y}`);

		//jeżeli kliknięta komórka została już ujawniona (posiada klasę "revealed" to nic się nie dzieje)
		if (!(cell.classList.contains("revealed"))){
			//jeżeli odkryta komórka sprawiła odkrycie większej ilości komórek, a któreś z nich były niepoprawnie oflagowane
			//to musimy usunąć flagi
			if (cell.classList.contains("flagged")){
				cell.classList.remove("flagged")
				flagCounter.innerText--; //modyfikujemy licznik oflagowanych pól w interfejsie
			}
			//odkrywamy komórke (poprzez dodanie klasy "revealed" i zaczanymi liczenie z iloma minami sąsiaduje dane pole)
			cell.classList.add("revealed");
			let mine_count_adjecent = 0;
			//sprawdzamy ile min znajduje się w sąsiednich polach. Musimy być wrażliwy na przypadki 
			//odkrywanych pól z granicznych stref boardu, stąd zastosowanie Math.max i min
			for (let m=Math.max(x-1, 0); m<=Math.min(x+1, board.row_count-1); m++){
				for (let n=Math.max(y-1, 0); n<=Math.min(y+1, board.col_count-1); n++){
					let adjecentCell = document.getElementById(`${m}_${n}`);
					//jeżeli przyległe pole zawiera minę, zwiększamy licznik (liczbę która pojawi się na odkrytym polu)
					if (adjecentCell.classList.contains("mine")) {
						mine_count_adjecent++;
					}
				}
			}
			//jezeli do danego pola przylegą jakieś miny wyświetlimy ich liczbę w tym polu
			if (mine_count_adjecent > 0) {
				cell.innerHTML = mine_count_adjecent;
			} else { //jeżli do danego pola nie przylegają żadne miny, to stosujemy cały algorytm do wszystkich sąsiadujących z nim pól
				cell.classList.add("noNumber"); //klasa noNumber usuwa obramowania wokół pól bez żadnej cyferki
				for (let m=Math.max(x-1, 0); m<=Math.min(x+1, board.row_count-1); m++){
					for (let n=Math.max(y-1, 0); n<=Math.min(y+1, board.col_count-1); n++){
						reveal(m, n, board) //rekurencja, tj odwołanie się do funkcji wewnątrz tej samej funkcji
					}
				}
			}
		}
	}

	//funkcja obsługująca prawe kliknięcie mysze - oflagowanie pola
	const handleRightClick = function(x,y){
		let cell = document.getElementById(`${x}_${y}`);
		//jeżeli pole zawiera flagę to ją usuwamy, jeżeli nie, to pokazujemy (wszystko przy pomocy klasy "flagged")
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

	//funckja sprawdzająca, czy gracz nie zakończył gry
	const checkIfWon = function() {
		//sprawdzamy ile min zostało odkrytych (powinno być albo 0 albo wszystkie) oraz ile komórek jest wciąż nieodkrytych
		let minesRevealed = document.querySelectorAll(".mine.revealed").length;
		let cellsStillHidden = board.row_count*board.col_count - document.querySelectorAll(".cell.revealed").length
		//jeżeli odkrytych min jest więcej niż 0, to oznacza, że gracz przegrał. Jeżeli nieodkrytych pól jest tyle samo co 
		//(wciąż ukrytych) min, to oznacza, że gracz wygrał
		if (minesRevealed > 0) {
			showGameOver(false) //przegrana
		} else if (cellsStillHidden == board.mine_count){
			showGameOver(true) //wygrana
		}
	}


	//funkcja, która zakomunikuje graczowi wygraną lub przegraną
	const showGameOver = function(result) {
		//do operowania na modalu (komunikacie) wykorzystujemy zdefiniowana niżej klasę Modal
		const gameOver = new Modal();
		//jeżeki gracz wygrał (result = true) to otwieramy modal, nadając mu kolor zielony, pokazując ile czasu zajęło graczowi 
		//odkrycie wszystkich pól oraz wypisujemy komunikat o zwycięstwie
		//przy przegranej podobnie, poza tym, że funkcja setTime() wymazuje całą informację o czasie(np. z poprzedniej gry)
		if (result){
			gameOver.open().setColor("lime").setTime(result).setText("WYGRALES");
		} else {
			gameOver.open().setColor("red").setTime(result).setText("PRZEGRALES");
		}
		//na modalu pojawia się również przycisk do zamknięcia okna. Zamknięcie go ujawni również przycisk do zresetowania gry
		closeGameOver.addEventListener("click", function(){
			gameOver.close();
			reset.style.display = "block";
		});
		//uniemożliwiamy jakiekolwiek klikanie na planszy oraz zatrzymujemy zegar
		boardNode.classList.add("disable");
		clearInterval(interval);
	}

	//funkcja resetująca grę, uruchamiana poprzez przycisk RESET.
	const resetGame = function(){
		gameStarted = false; //aby wykryć pierwsze kliknięcie
		boardNode.innerHTML = ''; //usuwanie starej planszy
		boardNode.classList.remove("disable"); //umożliwamy klikanie na planszy
		init(); //tworzymy nową planszę
		reset.style.display = "none"; //ukrywamy przycisk reset
		flagCounter.innerText = "0"; //zerujemy licznik oflagowanych pól
		timer.innerText = "0"; //zerujemy zegar
	}

	//funkcja odpalająca zegar
	const setTimer = function(){
		gameStarted = true;
		interval = setInterval(function(){
			timer.innerText++
		},1000)
	}

	//funckja do otrzymania losowej liczby z zakresu
	const randomNumber = function(min, max){
		return Math.floor(Math.random() * (max - min + 1) + min)
	}

	//klasa modal z funkcjami otwierania, zamykania, zmiany komunikatu, koloru pola oraz 
	//wyświetlajaca czas w przypadku wygranej i usuwająca informacje w przypadku przegranej
	//return umożliwia łańcuchowe łączenie metod klasy
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
		setTime(result){
			if(result) {
				this.modal.querySelector("#modal-time").innerText = "Twój czas to: " + timer.innerText;
			} else {
				this.modal.querySelector("#modal-time").innerText = "";
			}
			return this;
		}
	}

	init();
})(MYAPP);















