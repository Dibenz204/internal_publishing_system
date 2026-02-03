
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';
// import About from './pages/About';
// import Layout from './components/Layout';

// function App() {
//     return (
//         <Router>
//             <Routes>
//                 <Route path="/" element={<Layout />}>
//                     <Route index element={<Home />} />
//                     <Route path="about" element={<About />} />
//                 </Route>
//             </Routes>
//         </Router>
//     );
// }

// export default App;

import React from 'react';
import Home from './pages/Home';

function App() {
    return <Home />;
}

export default App;