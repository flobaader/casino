import React, {useState} from "react";
import Wheel from "./Wheel";
import "./App.css";
import {ConfigProvider, Typography, theme, Layout, Card, Flex} from "antd";
import mixed from "./content/mixed.js";
import alk from "./content/alk";
import {useHotkeys} from "react-hotkeys-hook";

const {Title, Paragraph, Text, Link} = Typography;
const {Header, Content, Footer} = Layout;


function App() {
    const [prizes, setPrizes] = useState(alk)

    useHotkeys("a", () => {
        setWinnerIndex(null);
        setPrizes(mixed)
    })
    useHotkeys("b", () => {
        setWinnerIndex(null);
        setPrizes(alk)
    })

    const [winnerIndex, setWinnerIndex] = useState(null);

    const onSpinComplete = (index) => {
        setWinnerIndex(index);
        const audio = new Audio('/finish.mp3');
        audio.play();
    };

    return (
        <ConfigProvider theme={{
            algorithm: theme.darkAlgorithm,
        }}>
            <Layout>
                <Header style={{display: 'flex', alignItems: 'center'}}>
                    <Title>Caras Casino</Title>
                </Header>

                <Content>
                    <Flex align="center">
                        <Wheel prizes={prizes} onSpinComplete={onSpinComplete}/>
                        <div>
                            {winnerIndex !== null && (
                                <Card>
                                    <Title>{prizes[winnerIndex].name}</Title>
                                    <Title level={2}>{prizes[winnerIndex].idea}</Title>
                                </Card>
                            )}
                        </div>
                    </Flex>
                </Content>
            </Layout>
        </ConfigProvider>
    )
        ;
}

export default App;
