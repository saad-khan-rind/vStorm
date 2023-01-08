import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import React, {useState} from 'react';
import { Home } from './page1';
import { Chart } from './charts';


import { VetNavbar } from './Navbar';
const App = () => {
  return (
    <Router>
      <VetNavbar/>
        <Routes>
          <Route exact path="/" element={
          <Home/>
          } />
          <Route exact path="/jobsubmission" element={<Chart/>} />
          {/* <Route path="/jobsubmission">
            <h2>
              Will submit Job here
            </h2>
          </Route> */}
        </Routes>
    </Router>
  );
}

// export default App;
// function App() {
//   return (
//     <Router>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/chart" element={<Chart />} />
//         </Routes>
//     </Router>
//   );
// }

export default App;
