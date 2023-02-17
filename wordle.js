const board_letters = document.querySelectorAll('.board-letter')
const loadingDiv = document.querySelector('.info-bar')
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function start() {
    let currentGuess = ""
    let currentRow = 0
    let done = false
    let isLoading = true
     
    const res = await fetch("https://words.dev-apis.com/word-of-the-day")
    const resObj = await res.json()
    const word = resObj.word.toUpperCase()
    const wordParts = word.split("")
    console.log(word)
    isLoading = false
    setLoading(false)


    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            // add letter to the end
            currentGuess += letter
        } else {
            // replace the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter
        }
        board_letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1)
        board_letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = ""
    }

    async function commitGuess() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            // do nothing
            return
        }

        isLoading = true
        setLoading(true)
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        }) 
        const resObj = await res.json()
        const validWord = resObj.validWord

        isLoading = false
        setLoading(false)

        if (!validWord) {
            markInvalidWord()
            return
        }
        
        // marking as "correct", "close" or "wrong"
        const guessParts = currentGuess.split("")
        const map = makeMap(wordParts)
        
        console.log(map)

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            // mark as correct
            if (guessParts[i] === wordParts[i]) {
                board_letters[currentRow * ANSWER_LENGTH + i].classList.add("correct")
                map[guessParts[i]]--;
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordParts[i]) {
                // do nothing, I've done it already
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
                // mark as close
                board_letters[currentRow * ANSWER_LENGTH + i].classList.add("close")
                map[guessParts[i]]--;
            } else {
                board_letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong")
            }
        }

        currentRow++
        if (currentGuess === word) {
            // win
            alert("You win!")
            document.querySelector('.brand').classList.add("winner")
            done = true
            return
        } else if (currentRow === ROUNDS) {
            alert(`You lose, the word was ${word}`)
            done = true
        }
        currentGuess = ""
    }

    function markInvalidWord() {
        // alert("not a valid word")
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            board_letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid")
            
            setTimeout(function () {
                board_letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid")

            }, 10)
        }
    }
 
    document.addEventListener("keydown", function handleKeyPress(event) {
        if (done || isLoading) {
            // do nothing
            return
        }


        const keyPressed = event.key

        if (isLetter(keyPressed)) {
            addLetter(keyPressed.toUpperCase())
        } else if (keyPressed === "Enter") {
            // console.log("You pressed Enter")            
            commitGuess()
        } else if (keyPressed === "Backspace") {
            // console.log("You pressed the Backspace key")
            backspace()
        } else {
            // do nothing
        }
    })
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
    loadingDiv.classList.toggle('show', isLoading)
}

function makeMap (array) {
    const obj = {}
    for (let i = 0; i < array.length; i++) {
        const letter = array[i]
        if (obj[letter]) {
            obj[letter]++
        } else {
            obj[letter] = 1
        }
    }
    return obj
}
start()