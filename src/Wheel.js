import React, {useRef, useEffect, useState} from "react";
import {useHotkeys} from 'react-hotkeys-hook';


// Redraw the wheel frame onto the given canvas.
function redrawFrame(canvas) {
    const r = Math.min(canvas.width, canvas.height) / 2.05;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const ctx = canvas.getContext('2d');

    // outer ring
    ctx.save();
    ctx.shadowOffsetX = r / 100;
    ctx.shadowOffsetY = r / 100;
    ctx.shadowBlur = r / 40;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.005, 0, 2 * Math.PI, true);
    ctx.arc(cx, cy, r * 0.985, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#424242';
    ctx.fill();

    // center ring
    ctx.shadowOffsetX = r / 100;
    ctx.shadowOffsetY = r / 100;
    ctx.fillStyle = '#424242';
    ctx.beginPath();
    ctx.arc(cx, cy, r / 30, 0, 2 * Math.PI, false);
    ctx.fill();

    // prize pointer
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(-r * 1.01, -r * 0.05);
    ctx.lineTo(-r * 0.935, 0);
    ctx.lineTo(-r * 1.01, r * 0.05);
    ctx.fillStyle = '#f44336';
    ctx.fill();
    ctx.restore();
}


// Redraw the wheel onto the given canvas, with the given offset angle and list of prizes.
function redrawWheel(canvas, angle, prizes) {
    const r = Math.min(canvas.width, canvas.height) / 2.05;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.1)');

    const totalFreqs = getTotalFrequency(prizes);
    let cumulative = 0;
    for (let i = 0; i < prizes.length; ++i) {
        const prize = prizes[i];
        const freq = prize.freq || DEFAULT_FREQUENCY;
        cumulative += freq;

        // calculate arc and text angles
        const arcAngle1 = angle + (2 * Math.PI * (cumulative - freq)) / totalFreqs;
        const arcAngle2 = angle + (2 * Math.PI * cumulative) / totalFreqs;
        const textAngle = angle + (2 * Math.PI * (cumulative - freq / 2)) / totalFreqs;
        const highlight = isAngleBetween((3 / 2) * Math.PI, arcAngle1, arcAngle2);

        // draw arc
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, arcAngle1, arcAngle2, false);
        ctx.fillStyle = prize.bg || getDefaultBgColor(i);
        ctx.fill();
        ctx.fillStyle = g;
        ctx.fill();
        ctx.save();

        // calculate font size
        const angleMod = Math.min(arcAngle2 - arcAngle1, 0.25);
        const lengthMod = 1 - Math.round(prize.name.length / 3) * 0.07;
        const fontMod = prize.fontMod || 1;
        const fontSize = Math.max(10, 0.4 * r * angleMod * lengthMod * fontMod);

        // draw text
        ctx.fillStyle = prize.text || DEFAULT_TEXT_COLOR;
        if (highlight) {
            ctx.shadowColor = prize.text || DEFAULT_TEXT_COLOR;
            ctx.shadowBlur = r / 15;
        }
        ctx.font = fontSize + "px 'Muli', sans-serif";
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.translate(cx, cy);
        ctx.rotate(textAngle);
        ctx.fillText(prize.name, r * 0.91, 0);
        ctx.restore();
    }
}

const DEFAULT_FREQUENCY = 4;
const DEFAULT_TEXT_COLOR = "#000";

const getTotalFrequency = (prizes) => {
    return prizes.reduce(
        (acc, prize) => acc + (prize.freq || DEFAULT_FREQUENCY),
        0
    );
};

// Returns true if the given angle is between the specified bounds.
function isAngleBetween(angle, lower, upper) {
    lower %= 2 * Math.PI;
    upper %= 2 * Math.PI;
    if (lower <= upper) {
        return lower < angle && upper >= angle;
    } else {
        return lower < angle || upper >= angle;
    }
}

// Calculate the resulting prize index given the final angle and list of prizes.
function calculateResult(angle, prizes) {
    const totalFreqs = getTotalFrequency(prizes);
    let cumulative = 0;
    let winner = -1;

    for (let i = 0; i < prizes.length; ++i) {
        const freq = prizes[i].freq || DEFAULT_FREQUENCY;
        cumulative += freq;

        const arcAngle1 = angle + (2 * Math.PI * (cumulative - freq)) / totalFreqs;
        const arcAngle2 = angle + (2 * Math.PI * cumulative) / totalFreqs;
        if (isAngleBetween((3 / 2) * Math.PI, arcAngle1, arcAngle2)) {
            winner = i;
        }
    }

    return winner;
}


function getDefaultBgColor(index) {
    const colors = [
        "#FF5733",
        "#C70039",
        "#900C3F",
        "#581845",
        "#FFC300",
        "#DAF7A6",
    ];
    return colors[index % colors.length];
}

const Wheel = ({prizes, onSpinComplete}) => {
    const [angle, setAngle] = useState(0);
    const wheelCanvasRef = useRef(null);
    const frameCanvasRef = useRef(null);

    useEffect(() => {
        redrawFrame(frameCanvasRef.current);
        redrawWheel(wheelCanvasRef.current, angle, prizes);
    }, [angle, prizes]);

    const startSpin = () => {
        const audio = new Audio('/schauen-was-wird.mp3');
        audio.play();
        let currentAngle = angle;
        let spinDuration = 3000; // Duration of the spin in milliseconds
        let startTimestamp;

        const spinStep = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = timestamp - startTimestamp;
            const rotateAngle = easeOutCubic(progress, 0, 360 * 5, spinDuration); // 5 rotations
            currentAngle += rotateAngle;
            setAngle(currentAngle);

            if (progress < spinDuration) {
                window.requestAnimationFrame(spinStep);
            } else {
                const resultIndex = calculateResult(currentAngle, prizes);
                onSpinComplete(resultIndex);
            }
        };

        window.requestAnimationFrame(spinStep);
    };

    useHotkeys('down', startSpin);

    return (
        <div style={{position: "relative"}}>
            <canvas ref={wheelCanvasRef} width="500" height="500"></canvas>
            <canvas
                ref={frameCanvasRef}
                width="500"
                height="500"
                style={{position: "absolute", top: 0, left: 0}}
            ></canvas>
            <button onClick={startSpin}>Spin the Wheel!</button>
        </div>
    );
};

const easeOutCubic = (t, b, c, d) => {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
};

export default Wheel;
