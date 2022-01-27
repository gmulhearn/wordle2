import { Box, Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import Keyboard from '../../components/Keyboard';
import WordGrid, { LetterState } from '../../components/WordGrid';
import { emptyGrid, LetterGridProcessor } from '../../core/LetterGridCore';
import words from '../../res/5letterwords.json'

const styles = {
    title: {
        fontWeight: "bolder",
        textAlign: "center",
        fontSize: "32px"
    },
    main: {
        // border: 1,
        height: "100%"
    },
    keyboard: {
        // border: 1,
        // height: "30%"
    },
}

const getTodaysWord = (): string => {
    const word = words.at(Math.floor(Math.random() * words.length-1))  || "UNDEF"
    return word.toUpperCase()
}

const Main = () => {

    const [letterGrid, setLetterGrid] = useState(emptyGrid);

    const todaysWord = getTodaysWord()
    const [letterGridProcessor, setLetterGridProcessor] = useState(new LetterGridProcessor(todaysWord))


    
    const handleKeyboardInput = (input: string) => {
        console.log(input)
        const newGrid = letterGridProcessor.processInput(input)
        setLetterGrid(newGrid)
    }

    return (
        <Box display="flex" justifyContent="space-between" flexDirection="column" sx={{minHeight:"100%"}}>
            <Box sx={styles.main} display="flex" alignItems="center" justifyContent="center">
                <WordGrid letterGrid={letterGrid} />
            </Box>
            <Box sx={styles.keyboard}>
                <Keyboard onKeyboardInput={handleKeyboardInput} />
            </Box>
        </Box>

    );
};

export default Main;
