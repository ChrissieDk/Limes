// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
// import WhyChooseLimes from './pages/WhyChooseLimes';
// import Packages from './pages/Packages';
// import WhyPartner from './pages/WhyPartner';
// import Partners from './pages/Partners';
// import Contact from './pages/Contact';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/why-choose-limes" element={<WhyChooseLimes />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/why-partner" element={<WhyPartner />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
