import './App.css';
import 'semantic-ui-css/semantic.min.css'
import Login from "./components/Login"
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Unauthorized from './components/Unauthorized';
import Test from './components/Test';


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login/>}></Route>
      <Route path="/unauthorized" element={<Unauthorized/>}></Route>
      <Route path="/test" element={<Test/>}></Route>

      <Route path="/" element={<Layout/>}>
        <Route element={<RequireAuth allowedRoles={[]}/>}>
          <Route path="login" element={<Login/>}/>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
