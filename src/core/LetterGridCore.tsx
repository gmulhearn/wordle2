import { DELETE, ENTER } from "../components/Keyboard"
import { LetterBox, LetterState } from "../components/WordGrid"
import allowedWords from '../res/5letterallowedwords.json'
import words from '../res/5letterwords.json'

const allWords = allowedWords.concat(words)

const WIDTH = 5
const HEIGHT = 6

const NO_LETTER = ""

const emptyLetterBox = { letter: NO_LETTER, state: LetterState.NONE }

export const emptyGrid: LetterBox[][] = [
    Array(WIDTH).fill(emptyLetterBox),
    Array(WIDTH).fill(emptyLetterBox),
    Array(WIDTH).fill(emptyLetterBox),
    Array(WIDTH).fill(emptyLetterBox),
    Array(WIDTH).fill(emptyLetterBox),
    Array(WIDTH).fill(emptyLetterBox),
]

const emptyGridJSON: string = JSON.stringify(emptyGrid)

export const getEmptyGrid = (): LetterBox[][] => {
    const a = JSON.parse(emptyGridJSON)
    return a
}

const cloneMatrix = (matrix: any[][]): any[][] => {
    return matrix.map(function (arr) {
        return arr.slice();
    });
}

export const gridToText = (grid: LetterBox[][], colourBlind: boolean): string => {
    let text = `Wordy\n${Date().split(" ").slice(1, 4).join(" ")}\n\n`
    text += grid.map((row) => (
        row.map((lb) => (
            lb.state == LetterState.CORRECT ? (colourBlind ? "🟧" : "🟩") : (
                lb.state == LetterState.NEARLY ? (colourBlind ? "🟦" : "🟨") : (
                    lb.state == LetterState.INCORRECT ? "⬛" : ""
                )
            ))).join("")
    )).join("\n")

    text += `Play me at: ${window.location.toString()}`

    return text
}

const letterCountInWord = (letter: string, word: string): number => {
    return (word.match(new RegExp(letter, "g")) || []).length
}

export class LetterGridProcessor {
    letterPosition: { x: number, y: number } = { x: 0, y: 0 }
    currentGrid: LetterBox[][] = getEmptyGrid()
    letterGuesses: LetterBox[] = []
    foundWord: boolean = false

    correctWord
    setLetterGuesses
    onInvalidWord
    onWordFound

    constructor(correctWord: string, setLetterGuesses: React.Dispatch<React.SetStateAction<LetterBox[]>>, onInvalidWord: () => void, onWordFound: (wordGrid: LetterBox[][]) => void) {
        this.correctWord = correctWord
        this.setLetterGuesses = setLetterGuesses
        this.onInvalidWord = onInvalidWord
        this.onWordFound = onWordFound
    }

    restartFromGrid = (grid: LetterBox[][]) => {
        this.currentGrid = grid

        var y = Math.min(HEIGHT,
            grid.filter((row) =>
                (row.filter((lb) => (lb.state != LetterState.NONE)).length > 0)
            ).length
        )
        var x = y < grid.length ? grid[y].filter((lb) => (lb.letter != NO_LETTER)).length : 0

        this.letterPosition = {
            x: x,
            y: y
        }
        console.log(this.letterPosition)

        this.letterGuesses = grid.flatMap((row) => (
            row.filter((lb) => 
            (
                lb.state !== LetterState.NONE
            ))
        ))

        this.setLetterGuesses(this.letterGuesses)
    }

    calculateLetterBoxState = (index: number, letterBox: LetterBox): LetterBox => {
        if (this.correctWord.charAt(index) == letterBox.letter) {
            return { letter: letterBox.letter, state: LetterState.CORRECT }
        } else if (this.correctWord.includes(letterBox.letter)) {
            return { letter: letterBox.letter, state: LetterState.NEARLY }
        } else {
            return { letter: letterBox.letter, state: LetterState.INCORRECT }
        }
    }

    refineProcessLetterRow = (row: LetterBox[]): LetterBox[] => {
        return row.map((lb, i) => {
            if (lb.state == LetterState.NEARLY) {
                const numGreenInRowOfLetter = row.filter((lb2) => (
                    lb2.letter === lb.letter && lb2.state === LetterState.CORRECT
                )).length
                const numPriorYellowInRowOfLetter = row.slice(0, i).filter((lb2) => (
                    lb2.letter === lb.letter && lb2.state === LetterState.NEARLY
                )).length
                const numLetterInWord = letterCountInWord(lb.letter, this.correctWord)
                if ((numGreenInRowOfLetter + numPriorYellowInRowOfLetter) >= numLetterInWord) {
                    return {
                        letter: lb.letter,
                        state: LetterState.INCORRECT
                    }
                }
                return lb
            }
            return lb
        })
    }

    processInput = (input: string): LetterBox[][] => {
        if (this.foundWord) {
            return this.currentGrid
        }
        if (this.letterPosition.x == WIDTH && input != ENTER && input != DELETE) {
            // err
            throw new Error("");
        }

        if (input == ENTER) {
            if (this.letterPosition.x == WIDTH) {
                // process here
                const row = this.currentGrid[this.letterPosition.y]
                // check if valid word
                if (allWords.includes(row.map((i) => (i.letter)).join("").toLowerCase())) {
                    const newRow: LetterBox[] = this.refineProcessLetterRow(
                        row.map((letterBox, i) => (
                            this.calculateLetterBoxState(i, letterBox)
                        ))
                    )
                    this.letterGuesses = this.letterGuesses.concat(newRow)
                    this.setLetterGuesses(this.letterGuesses)
                    this.currentGrid[this.letterPosition.y] = newRow

                    this.letterPosition.x = 0
                    this.letterPosition.y += 1

                    if (newRow.length == newRow.filter((i) => i.state == LetterState.CORRECT).length) {
                        this.foundWord = true
                        this.onWordFound(this.currentGrid)
                    }
                } else {
                    this.onInvalidWord()
                }
            }
        } else if (input == DELETE) {
            if (this.letterPosition.x != 0) {
                this.letterPosition.x -= 1
                this.currentGrid[this.letterPosition.y][this.letterPosition.x] = emptyLetterBox
            }
        } else {
            this.currentGrid[this.letterPosition.y][this.letterPosition.x] = { letter: input, state: LetterState.NONE }
            this.letterPosition.x += 1
        }

        return cloneMatrix(this.currentGrid)
    }
}