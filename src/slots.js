import React, {useState, useEffect} from 'react';
import './SlotMachine.css'; // Your custom CSS
import {Card, Flex, Typography} from 'antd';
import Gamepad from "react-gamepad";

const symbols = ['🍺', '🍷', '🍸', '🥃', '🍾'];
const Spinner = ({onFinish, timer, spinning}) => {
    const [position, setPosition] = useState(0);
    const iconHeight = 188; // Adjust based on your sprite sheet
    const totalSymbols = symbols.length;
    const rotations = 10; // Number of times the spinner will rotate

    useEffect(() => {
        if (spinning) {
            // Set a random starting position
            const startPos = -(Math.floor(Math.random() * totalSymbols) * iconHeight);
            setPosition(startPos);

            const interval = setInterval(() => {
                setPosition(prev => {
                    let nextPos = prev - iconHeight;
                    if (nextPos <= -iconHeight * totalSymbols * rotations) {
                        clearInterval(interval);
                        nextPos = -(Math.floor(Math.random() * totalSymbols) * iconHeight);
                        const finalSymbolIndex = Math.abs(startPos / iconHeight) % totalSymbols;
                        onFinish(symbols[finalSymbolIndex]);
                        return nextPos;
                    }
                    return nextPos;
                });
            }, 75); // Faster spin speed

            return () => {
                clearInterval(interval);
            };
        }
    }, [spinning, timer, onFinish]);

    return (
        <div style={{backgroundPosition: '0px ' + position + 'px'}} className="icons"/>
    );
};


function SlotMachine() {
    const [results, setResults] = useState([]);
    const [winner, setWinner] = useState(null);
    const [spinning, setSpinning] = useState(false);

    const finishHandler = symbol => {
        results.push(symbol);
        console.log("got result" + symbol)
        if (results.length === 3) {
            setSpinning(false);
            setWinner(results[0] === results[1] && results[1] === results[2]);
            results.current = []; // Reset for next spin
        }
    };

    const handleClick = () => {
        setWinner(null);
        setSpinning(true);
        setResults([]);
        const audio = new Audio('/schauen-was-wird.mp3');
        audio.play();
    };

    return (
        <Gamepad onDown={handleClick}>
            <div>
                <Typography.Title>ShotSlots</Typography.Title>
                <Flex>
                    <div className="spinner-container">
                        <Spinner onFinish={finishHandler} timer="1000" spinning={spinning}/>
                        <Spinner onFinish={finishHandler} timer="2500" spinning={spinning}/>
                        <Spinner onFinish={finishHandler} timer="3000" spinning={spinning}/>
                        <div className="gradient-fade"></div>
                    </div>
                    <div>
                        {(!spinning && results.length > 0) && <Card>
                            <Typography.Title>Du hast {winner ? "gewonnen 🏆" : "verloren ❌"}</Typography.Title>
                            <Typography.Title>{winner ? "Verteile 1 Shot und 2 Schlücke" : "Trink 3 schlücke"}</Typography.Title>
                        </Card>}
                    </div>
                </Flex>
            </div>
        </Gamepad>
    );
}

export default SlotMachine;
