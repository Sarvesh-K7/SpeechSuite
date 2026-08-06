
import { NavLink } from "react-router-dom";
import { AudioLines, Mic, History, Volume2, Info } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <AudioLines size={20} />
          <span>SpeechSuite</span>
        </div>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            <Mic size={16} />
            Record
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? "active" : "")}>
            <History size={16} />
            History
          </NavLink>
          <NavLink to="/text-to-speech" className={({ isActive }) => (isActive ? "active" : "")}>
            <Volume2 size={16} />
            Text to Speech
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            <Info size={16} />
            How It Works
          </NavLink>
        </div>
      </div>
    </nav>
  );
}