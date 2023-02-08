import { Button, Container, Grid, Header } from 'semantic-ui-react';
import axios from "../utils/axios";

const ENDPOINT_OFF= "off";
const ENDPOINT_ON = "on";

const Welcome = () => {
    const lightOff = async (e: any) => {
        try {
            await axios.get(ENDPOINT_OFF); 
        } catch (err) {
            console.log(err);
        }        
    }

    const lightOn = async (e: any) => {
        try {
            await axios.get(ENDPOINT_OFF); 
        } catch (err) {
            console.log(err);
        }        
    }

    return (
        <Container>
                <Grid centered={true} verticalAlign='middle'>
                <Grid.Row>
                    <Header as={"h1"} size="huge"> Secured Smart Home</Header>
                </Grid.Row>
                <Grid.Row>
                    <Button.Group size='large'>
                        <Button onClick={lightOff}>Aus</Button>
                        <Button.Or text="💡"/>
                        <Button onClick={lightOn} positive>An</Button>
                    </Button.Group>  
                </Grid.Row>
            </Grid>
        </Container>
        
    )
}

export default Welcome;