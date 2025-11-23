// script.js - Jogo da Memória (versão final solicitada)
const playBtn = document.getElementById('playBtn');
const intro = document.getElementById('intro');
const game = document.getElementById('game');
const board = document.getElementById('board');
const expandBar = document.getElementById('play-expand');
const movesSpan = document.getElementById('moves');
const matchesSpan = document.getElementById('matches');
const restartBtn = document.getElementById('restart');

// A grande lista de todos os emojis disponíveis para seleção aleatória
const ALL_EMOJIS = [
    '🍇','🍈','🍉','🍊','🍋','🍋‍🟩','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐',
    '🥝','🍅','❤️','🩷','🧡','💛','💚','💙','🩵','💜','🤎','🖤','🩶','🐶','🦊','🐺',
    '🐱','🦁','🐯','🐴','🦄','🐹','🐭','🐰','🐷','🐼','🐻','🐸','🐦‍⬛','🦚','🦋','🐜',
    '🏵️','🌸','⚽','🏀','🏈','🌍','☀️','🔥','🪐','☂️','🌈','💧','✂️','😀','😂','😘',
    '😍','👍','🫶','👀','🧠', '💌','💎','🎆','🥇','🫔','🍓','💫','✨','🦥','😇',
    '💍','👸🏻','💄','💋','🫶🏻','😽','😴','🤩',
];

function selectRandomElements(array, count) {
    // Cria uma cópia da array e embaralha superficialmente (usando o método .sort com Math.random)
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    
    // Retorna apenas os primeiros 'count' elementos (os 12 emojis que serão usados)
    return shuffled.slice(0, count);
}

let cols = 6;
const rows = 4;
const totalCards = cols * rows; // 24
const pairCount = totalCards / 2;

let symbols = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;

function generateSymbols(){
    // 1. SELEÇÃO: Escolhe 12 emojis únicos aleatoriamente da ALL_EMOJIS
    const uniqueSymbols = selectRandomElements(ALL_EMOJIS, pairCount);
    // 2. DUPLICAÇÃO: Cria os pares (total de 24 cartas)
    symbols = uniqueSymbols.concat(uniqueSymbols); 
    // 3. EMBARALHAMENTO: Aplica o embaralhamento final
    shuffle(symbols);
}

function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [array[i],array[j]] = [array[j],array[i]];
  }
  return array;
}

function buildBoard(){
  board.innerHTML = '';
  for(let i=0;i<symbols.length;i++){
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = symbols[i];
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front">?</div>
        <div class="card-face card-back">${symbols[i]}</div>
      </div>
    `;
    card.addEventListener('click', () => onCardClick(card));
    board.appendChild(card);
  }
}

function onCardClick(card){
  if(lockBoard) return;
  if(card.classList.contains('matched')) return;
  if(card === firstCard) return;

  card.classList.add('flip');

  if(!firstCard){
    firstCard = card;
    return;
  }
  secondCard = card;
  lockBoard = true;
  moves++;
  movesSpan.textContent = 'Movimentos: ' + moves;

  if(firstCard.dataset.value === secondCard.dataset.value){
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matches++;
    matchesSpan.textContent = 'Pares: ' + matches;
    resetTurn(true);
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flip');
      secondCard.classList.remove('flip');
      resetTurn(false);
    }, 900);
  }
}

function resetTurn(){
  [firstCard, secondCard] = [null, null];
  lockBoard = false;

  if(matches === pairCount){
    setTimeout(() => alert('🎉 Parabéns! Você encontrou todos os pares em ' + moves + ' movimentos!'), 300);
  }
}

function startGame(){
  moves = 0; matches = 0;
  movesSpan.textContent = 'Movimentos: 0';
  matchesSpan.textContent = 'Pares: 0';
  generateSymbols();
  buildBoard();
  expandBar.classList.add('grow');
  setTimeout(() => {
    intro.classList.add('hidden');
    game.classList.remove('hidden');
  }, 520);
}

playBtn.addEventListener('click', startGame);

restartBtn.addEventListener('click', () => {
  expandBar.classList.remove('grow');
  game.classList.add('hidden');
  intro.classList.remove('hidden');
  setTimeout(() => expandBar.style.width = '0', 10);
});

// Timer + Ranking + Modal
let startTime = null;
let timerInterval = null;
const modal = document.getElementById('victory-modal');
const finalTimeElem = document.getElementById('final-time');
const rankingList = document.getElementById('ranking-list');
const playAgainBtn = document.getElementById('play-again');

function startTimer() {
  if (startTime) return;
  startTime = Date.now();
  timerInterval = setInterval(()=>{},1000);
}

function stopTimer() {
  if (!startTime) return 0;
  const time = (Date.now() - startTime)/1000;
  clearInterval(timerInterval);
  return Math.round(time);
}

function saveRanking(time) {
  let ranks = JSON.parse(localStorage.getItem('memory_ranking')||"[]");
  ranks.push(time);
  ranks.sort((a,b)=>a-b);
  ranks = ranks.slice(0,5);
  localStorage.setItem('memory_ranking', JSON.stringify(ranks));
  return ranks;
}

function showVictory() {
  const time = stopTimer();
  finalTimeElem.textContent = `Seu tempo: ${time}s`;
  const ranks = saveRanking(time);
  rankingList.innerHTML = ranks.map(t=>`<li>${t}s</li>`).join("");
  modal.classList.remove('hidden');
}

playAgainBtn.addEventListener('click', ()=>{
  modal.classList.add('hidden');
  window.location.reload();
});
