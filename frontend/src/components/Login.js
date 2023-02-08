import {useRef, useState, useEffect} from 'react';
import { Button, Input } from 'semantic-ui-react';
import axios from '../api/axios';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
const LOGIN_URL = "/auth";

const Login = () => {
    const {setAuth} = useAuth;

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState("");
    const [pwd, setPwd] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, []);

    useEffect(() => {
        setErrMsg("");
    }, [user,pwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({user,pwd}),
                {
                    headers: { "Content-Type": "application/json"},
                    withCredentials: true
                }
            );
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            setAuth({user, pwd, roles, accessToken});
            setUser("");
            setPwd("");
            navigate(from, {replace: true})
            //setSuccess(true);
        } catch (err) {
            if (!err?.response) {
                setErrMsg("No Server Response");
            } else if (err.response?.status === 400) {
                setErrMsg("Missing Username or Password");
            } else if (err.response?.status === 401) {
                setErrMsg("Unauthorized");
            } else {
                setErrMsg("Login Failed");
            }
            errRef.current.focus();
        }        
    }

    return (
        <section>
            <p ref={errRef} aria-live="assertive">
                {errMsg}
            </p>
            <h1>
                Sign in
            </h1>
            <form onSubmit={handleSubmit}>
                <Input label='Benutzer' type="text" id="username" ref={userRef} autoComplete="off" onChange={(e) => setUser(e.target.value)} value={user} required/>
                <Input label='Passwort' type="password" id="password" onChange={(e) => setPwd(e.target.value)} value={pwd} required/>
                <Button>Click Here</Button>
            </form>
        </section>
    )
}

export default Login;