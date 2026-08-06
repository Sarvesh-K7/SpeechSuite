
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import RecordPage from "./pages/RecordPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import TextToSpeechPage from "./pages/TextToSpeechPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<RecordPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/text-to-speech" element={<TextToSpeechPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </>
  );
}