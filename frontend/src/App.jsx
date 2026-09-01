import { useState } from "react";
import "./App.css";
import Stroop from "./games/Stroop";

function App() {
  const [screen, setScreen] = useState("home");
  const [playerName, setPlayerName] = useState("");

  const handleNameSubmit = () => {
    if (playerName.trim() === "") {
      return;
    }

    setScreen("instructions");
  };

  return (
    <div className="app">

      {/* =========================
          HOME SCREEN
      ========================== */}
      {screen === "home" && (
        <div className="home-screen">

          <div className="logo">
            ThinkTank
          </div>

          <h1>
            Challenge Your Mind
          </h1>

          <p className="description">
            Test your memory, speed, pattern recognition,
            decision making and performance under pressure.
          </p>

          <button
            className="start-button"
            onClick={() => setScreen("name")}
          >
            Start Game
          </button>

        </div>
      )}

      {/* =========================
          PLAYER NAME SCREEN
      ========================== */}
      {screen === "name" && (
        <div className="home-screen">

          <div className="logo">
            ThinkTank
          </div>

          <h1>
            Enter Your Name
          </h1>

          <p className="description">
            Before we begin, tell us what we should call you.
          </p>

          <input
            type="text"
            className="name-input"
            placeholder="Your name"
            value={playerName}
            onChange={(event) => {
              setPlayerName(event.target.value);
            }}
          />

          <button
            className="start-button"
            onClick={handleNameSubmit}
          >
            Continue
          </button>

        </div>
      )}

      {/* =========================
          INSTRUCTIONS SCREEN
      ========================== */}
      {screen === "instructions" && (
        <div className="home-screen">

          <div className="logo">
            ThinkTank
          </div>

          <h1>
            How It Works
          </h1>

          <p className="description">
            Welcome, {playerName}.
            You will complete six different cognitive
            challenges. Your accuracy, reaction time
            and decisions will be observed during the game.
          </p>

          <div className="instruction-list">

            <div>
              🧠 Memory & Pattern Recognition
            </div>

            <div>
              ⚡ Reaction Speed
            </div>

            <div>
              🎯 Decision Making
            </div>

            <div>
              ⏱ Performance Under Time Pressure
            </div>

          </div>

          <button
            className="start-button"
            onClick={() => setScreen("game")}
          >
            Begin Challenge
          </button>

        </div>
      )}

      {/* =========================
          GET READY / GAME SCREEN
      ========================== */}
      {screen === "game" && (
        <div className="game-screen">

          {/* Game Header */}
          <div className="game-header">

            <span>
              ThinkTank
            </span>

            <span>
              Player: {playerName}
            </span>

            <span>
              Round 1 / 6
            </span>

          </div>

          {/* Progress Bar */}
          <div className="progress-container">

            <div className="progress-bar">

              <div className="progress-fill"></div>

            </div>

          </div>

          {/* Game Card */}
          <div className="game-card">

            <p className="task-label">
              FIRST CHALLENGE
            </p>

            <h1>
              Get Ready!
            </h1>

            <p>
              Focus carefully. Your first challenge will
              measure how quickly and accurately you respond.
            </p>

            <button
              className="start-button"
              onClick={() => setScreen("challenge")}
            >
              Start Challenge
            </button>

          </div>

        </div>
      )}

      {/* =========================
          STROOP CHALLENGE SCREEN
      ========================== */}
      {screen === "challenge" && (
        <div className="game-screen">

          {/* Game Header */}
          <div className="game-header">

            <span>
              ThinkTank
            </span>

            <span>
              Player: {playerName}
            </span>

            <span>
              Round 1 / 6
            </span>

          </div>

          {/* Progress Bar */}
          <div className="progress-container">

            <div className="progress-bar">

              <div className="progress-fill"></div>

            </div>

          </div>

          {/* Stroop Game */}
          <div className="game-card">

            <Stroop />

          </div>

        </div>
      )}

    </div>
  );
}

export default App;