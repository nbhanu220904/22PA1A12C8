import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ShortenerForm from "./components/shortenerform";
import StatisticsPage from "./components/StatisticsPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<ShortenerForm />} />
          <Route path="/stats" element={<StatisticsPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
