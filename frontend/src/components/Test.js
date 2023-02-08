import { useNavigate } from "react-router-dom";
import { Button } from 'semantic-ui-react';
import axios from "../api/axios";

const ENDPOINT_ON = "on";

const Test = () => {
    const handleClick = async (e) => {

        try {
            const response = await axios.get(ENDPOINT_ON);
           
        } catch (err) {
            if (!err?.response) {
                console.log("No Server Response");
            } else if (err.response?.status === 400) {
                console.log("Missing Username or Password");
            } else if (err.response?.status === 401) {
                console.log("Unauthorized");
            } else {
                console.log("Login Failed");
            }
        }        
    }

    return (
        <section>
            <Button onClick={handleClick}> Licht an</Button>
        </section>
    )
}

export default Test;