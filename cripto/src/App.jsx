import io from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import Mensaje from './Screens/mensaje';
import Home from './Screens/home';
import Users from './Screens/users';
const socket = io('/');

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/mensaje" element={<Mensaje />} />
        </Routes>
    </Router>
  );
}
export default App;