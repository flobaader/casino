import React, {useState} from "react";
import Wheel from "./Wheel";
import "./App.css";
import {ConfigProvider, Typography, theme, Layout, Card, Flex, Badge} from "antd";
import mixed from "./content/mixed.js";
import alk from "./content/alk";
import {useHotkeys} from "react-hotkeys-hook";
import Gamepad from 'react-gamepad'
import ConfettiExplosion from "react-confetti-explosion";

const {Title, Paragraph, Text, Link} = Typography;
const {Header, Content, Footer} = Layout;


function App() {
    const [prizes, setPrizes] = useState(mixed)
    const [mode, setMode] = useState("Mixed")
    const [connected, setConnected] = useState(false)
    const [isExploding, setIsExploding] = React.useState(false);


    const setMixed = () => {
        setWinnerIndex(null);
        setPrizes(mixed)
        setMode("Mixed")
    }

    const setAlki = () => {
        setWinnerIndex(null);
        setPrizes(alk)
        setMode("Alki")
    }

    const [winnerIndex, setWinnerIndex] = useState(null);

    const onSpinComplete = (index) => {
        setWinnerIndex(index);
        const audio = new Audio('/finish.mp3');
        audio.play();
        setIsExploding(true)
    };

    return (
        <ConfigProvider theme={{
            algorithm: theme.darkAlgorithm,
        }}>
            <Gamepad
                onConnect={() => setConnected(true)}
                onDisconnect={() => setConnected(false)}
                onX={() => setAlki()}
                onY={() => setMixed()}
            >
                <Layout style={{height: "100vh"}}>
                    <Header style={{display: 'flex', alignItems: 'center'}}>
                        <Title>Caras Casino - {mode}</Title>
                    </Header>

                    <Content style={{backgroundImage: "url(background1.jpg)", backgroundSize: "cover"}}>
                        <Flex align="center">
                            <Wheel prizes={prizes} onSpinComplete={onSpinComplete}/>
                            <div>
                                {winnerIndex !== null && (
                                    <Card className="fancy-border">
                                        {isExploding &&
                                            <ConfettiExplosion force={0.7} onComplete={() => setIsExploding(false)}/>}
                                        <Title>{prizes[winnerIndex].name}</Title>
                                        <Title level={2}>{prizes[winnerIndex].idea}</Title>
                                    </Card>
                                )}

                            </div>
                        </Flex>
                    </Content>
                    <Footer>
                        <Badge status={connected ? "success" : "error"} text={connected ? "OK" : "NOK"}/>
                    </Footer>
                </Layout>
            </Gamepad>
        </ConfigProvider>
    )
}

export default App;
