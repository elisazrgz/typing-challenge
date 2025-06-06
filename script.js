const $timer = document.querySelector("timer");
const $p = document.querySelector("p");
const $input = document.querySelector("input");
const $game = document.querySelector("#game");
const $results = document.querySelector("#results");
const $wpm = $results.querySelector("#results-wpm");
const $accuracy = $results.querySelector("#results-accuracy");
const $button = document.querySelector("#reload-button");

const initialTime = 30;
let currentTime = 0;

initGame();
initEvents();

function initGame(){
    $game.style.display = "flex"
    $results.style.display = "none"
    $input.value = ""

    const initialWords = words.toSorted(
        () => Math.random() - 0.5
    )
    .slice(0, 32);

    currentTime = initialTime
    $timer.textContent = currentTime;
    $p.innerHTML = initialWords.map(word => {
        const letters = word.split("");

        return `<word>
        ${letters
        .map(letter => `<letter>${letter}</letter>`)
        .join("")}
        </word>
        `;
    }).join("")

    const $firstWord = $p.querySelector("word");
    $firstWord.classList.add("active");
    $firstWord.querySelector("letter").classList.add("active");

    const interval = setInterval(() => {
        currentTime--
        $timer.textContent = currentTime;
        if (currentTime === 0){
            clearInterval(interval);
            gameOver()
        }
    }, 1000)
};

function initEvents(){
    document.addEventListener("keydown", () => {
        $input.focus()
    } )
    $input.addEventListener("keydown", onKeyDown)
    $input.addEventListener("keyup", onKeyUp)
    $button.addEventListener("click", initGame)
}

function onKeyDown(event){
    const $currentWord = $p.querySelector("word.active")
    const $currentLetter = $currentWord.querySelector("letter.active")

    const { key } = event
    if (key === " "){
        event.preventDefault()

        const $nextWord = $currentWord.nextElementSibling
        const $nextLetter = $nextWord.querySelector("letter")

        $currentWord.classList.remove("active", "marked")
        $currentLetter.classList.remove("active")

        $nextWord.classList.add("active")
        $nextLetter.classList.add("active")

        $input.value = ""

        const hasMissedLetters = $currentWord.querySelectorAll('letter:not(.correct)').length > 0

        const classToAdd = hasMissedLetters ? "marked" : "correct"
        $currentWord.classList.add(classToAdd)
        
        return
    }

    if (key === "Backspace"){
        const $prevWord = $currentWord.previousElementSibling
        const $prevLetter = $currentLetter.previousElementSibling

        if (!$prevWord && !$prevLetter){
            event.preventDefault()
            return
        }

        const $wordMarked = $p.querySelector("word.marked")
        if ($wordMarked && !$prevLetter){
            event.preventDefault()
            $prevWord.classList.remove("marked")
            $prevWord.classList.add("active")

            const $letterToGo = $prevWord.querySelector("letter:last-child")

            $currentLetter.classList.remove("active")
            $letterToGo.classList.add("active")

            $input.value = [
                ...$prevWord.querySelectorAll("letter.correct, letter.incorrect")
            ].map($el => {
                return $el.classList.contains("correct") ? $el.innerText : "*"
            })
            .join("")
        }
    }
}


function onKeyUp(){
    const $currentWord = $p.querySelector("word.active")
    const $currentLetter = $currentWord.querySelector("letter.active")

    const currentWord = $currentWord.innerText.trim()
    $input.maxLength = currentWord.length

    const $allLetters = $currentWord.querySelectorAll("letter")

    $allLetters.forEach($letter => $letter.classList.remove("correct", "incorrect"))

    $input.value.split("").forEach((char, index) => {
        const $letter = $allLetters[index]
        const letterToCheck = currentWord[index]
        
        const isCorrect = char === letterToCheck
        const letterClass = isCorrect ? "correct" : "incorrect"

        $letter.classList.add(letterClass)
    })

    $currentLetter.classList.remove("active", "is-last")
    const inputLength = $input.value.length
    const $nextActiveLetter = $allLetters[inputLength]
    
    if($nextActiveLetter){
        $nextActiveLetter.classList.add("active")
    } else {
        $currentLetter.classList.add("active", "is-last")
    }
}

function gameOver(){
    $game.style.display = 'none'
    $results.style.display = 'flex'

    const correctWords = $p.querySelectorAll('word.correct').length
    const correctLetter = $p.querySelectorAll('letter.correct').length
    const incorrectLetter = $p.querySelectorAll('letter.incorrect').length

    const totalLetters = correctLetter + incorrectLetter

    const accuracy = totalLetters > 0
      ? (correctLetter / totalLetters) * 100
      : 0

    const wpm = correctWords * 60 / initialTime
    $wpm.textContent = wpm
    $accuracy.textContent = `${accuracy.toFixed(2)}%`
}