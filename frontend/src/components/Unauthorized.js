import { useNavigate } from "react-router-dom";
import { Button } from 'semantic-ui-react';

const Unauthorized = () => {
    const navigate = useNavigate();

    const goBack = () => navigate(-1);

    return (
        <section>
            <Button onClick={goBack}> Go Back</Button>
        </section>
    )
}

export default Unauthorized;