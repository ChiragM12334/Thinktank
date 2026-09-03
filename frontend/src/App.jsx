import { useState } from "react";
import "./App.css";

import Stroop from "./games/Stroop";
import Memory from "./games/Memory";
import Pattern from "./games/Pattern";
import Lab from "./games/Lab";

function responseCount(data) {
  if (Array.isArray(data)) {
    return data.length;
  }

  if (data?.questions) {
    return data.questions.length;
  }

  return 0;
}

function App() {
  const [screen, setScreen] = useState("home");

  const [playerName, setPlayerName] = useState("");
  const [mindset, setMindset] = useState("");

  const [gameSession, setGameSession] = useState({
    playerName: "",
    mindset: "",
    stroop: [],
    memory: [],
    pattern: [],
    lab: [],
    risk: [],
    pressure: [],
    dilemma: [],
  });

  // =========================================
  // NAME
  // =========================================

  const handleNameSubmit = () => {
    const name = playerName.trim();

    if (!name) {
      return;
    }

    setGameSession((previous) => ({
      ...previous,
      playerName: name,
    }));

    setScreen("mindset");
  };

  // =========================================
  // MINDSET
  // =========================================

  const handleMindset = (selectedMindset) => {
    setMindset(selectedMindset);

    setGameSession((previous) => ({
      ...previous,
      mindset: selectedMindset,
    }));

    setScreen("briefing");
  };

  // =========================================
  // ROUND 1 — COLOR TRAP
  // =========================================

  const handleStroopComplete = (data) => {
    console.log("COLOR TRAP DATA:", data);

    setGameSession((previous) => ({
      ...previous,
      stroop: data?.questions || data || [],
    }));

    setScreen("memory-intro");
  };

  // =========================================
  // ROUND 2 — MEMORY TRAP
  // =========================================

  const handleMemoryComplete = (data) => {
    console.log("MEMORY TRAP DATA:", data);

    setGameSession((previous) => ({
      ...previous,
      memory: data || [],
    }));

    setScreen("pattern-intro");
  };

  // =========================================
  // ROUND 3 — LOGIC SHIFT
  // =========================================

  const handlePatternComplete = (data) => {
    console.log("LOGIC SHIFT DATA:", data);

    setGameSession((previous) => ({
      ...previous,
      pattern: data?.questions || data || [],
    }));

    setScreen("lab-intro");
  };

  // =========================================
  // ROUND 4 — THE LAB
  // =========================================

  const handleLabComplete = (data) => {
    console.log("THE LAB DATA:", data);

    setGameSession((previous) => ({
      ...previous,
      lab: data || [],
    }));

    setScreen("lab-complete");
  };

  // =========================================
  // SESSION DEBUG
  // =========================================

  const showSessionData = () => {
    console.log("================================");
    console.log("THINKTANK SESSION");
    console.log("================================");
    console.log(gameSession);
  };

  return (
    <div className="app">

      {/* ======================================
          HOME
      ====================================== */}

      {screen === "home" && (
        <div className="landing-screen">

          <div className="eyebrow">
            AI • COGNITION • ADAPTATION
          </div>

          <h1 className="main-title">
            ThinkTank
          </h1>

          <p className="hero-line">
            Every mind leaves a pattern.
          </p>

          <p className="hero-description">
            A series of challenges designed to
            see how you think, react and adapt.
          </p>

          <button
            className="primary-button"
            onClick={() => setScreen("name")}
          >
            ENTER THINKTANK →
          </button>

        </div>
      )}

      {/* ======================================
          NAME
      ====================================== */}

      {screen === "name" && (
        <div className="onboarding-screen">

          <div className="eyebrow">
            FIRST IMPRESSION
          </div>

          <h1>
            Before we begin...
          </h1>

          <p className="onboarding-text">
            Your next few minutes may reveal
            more about how you respond than you expect.
          </p>

          <p className="question-label">
            What should we call you?
          </p>

          <input
            type="text"
            className="name-input"
            placeholder="Type your name..."
            value={playerName}
            onChange={(event) =>
              setPlayerName(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleNameSubmit();
              }
            }}
          />

          <button
            className="primary-button"
            onClick={handleNameSubmit}
          >
            THAT'S ME →
          </button>

        </div>
      )}

      {/* ======================================
          MINDSET
      ====================================== */}

      {screen === "mindset" && (
        <div className="onboarding-screen">

          <div className="eyebrow">
            NICE TO MEET YOU,{" "}
            {playerName.toUpperCase()}
          </div>

          <h1>
            How are you entering ThinkTank?
          </h1>

          <p className="onboarding-text">
            No answer is better than another.
            Pick what feels most natural.
          </p>

          <div className="mindset-grid">

            <button
              className="mindset-card"
              onClick={() => handleMindset("Curious")}
            >
              <span>01</span>
              <strong>Curious</strong>
              <small>I want to explore.</small>
            </button>

            <button
              className="mindset-card"
              onClick={() => handleMindset("Competitive")}
            >
              <span>02</span>
              <strong>Competitive</strong>
              <small>I want to win.</small>
            </button>

            <button
              className="mindset-card"
              onClick={() => handleMindset("Chill")}
            >
              <span>03</span>
              <strong>Chill</strong>
              <small>Let's see what happens.</small>
            </button>

            <button
              className="mindset-card"
              onClick={() =>
                handleMindset("Unpredictable")
              }
            >
              <span>04</span>
              <strong>Unpredictable</strong>
              <small>Surprise me.</small>
            </button>

          </div>

        </div>
      )}

      {/* ======================================
          BRIEFING
      ====================================== */}

      {screen === "briefing" && (
        <div className="onboarding-screen">

          <div className="eyebrow">
            THINKTANK // INITIAL BRIEFING
          </div>

          <h1>
            Don't overthink it.
          </h1>

          <p className="onboarding-text">
            Six different ways to think.
            Speed, memory, logic, investigation and pressure.
          </p>

          <div className="briefing-list">

            <div>
              <span>01</span>
              <p>COLOR TRAP</p>
            </div>

            <div>
              <span>02</span>
              <p>MEMORY TRAP</p>
            </div>

            <div>
              <span>03</span>
              <p>LOGIC SHIFT</p>
            </div>

            <div>
              <span>04</span>
              <p>THE LAB</p>
            </div>

            <div>
              <span>05</span>
              <p>TIME PRESSURE</p>
            </div>

            <div>
              <span>06</span>
              <p>FINAL DECISION</p>
            </div>

          </div>

          <p className="warning-text">
            Some rounds change the rules.
            Pay attention.
          </p>

          <button
            className="primary-button"
            onClick={() => setScreen("game")}
          >
            ENTER THE ARENA →
          </button>

        </div>
      )}

      {/* ======================================
          ROUND 1 INTRO
      ====================================== */}

      {screen === "game" && (
        <div className="round-screen">

          <div className="round-topbar">
            <span>THINKTANK</span>
            <span>01 / 06</span>
          </div>

          <div className="round-progress">
            <div
              className="round-progress-fill"
              style={{ width: "16.66%" }}
            />
          </div>

          <div className="round-intro-card">

            <div className="round-number">
              ROUND 01
            </div>

            <h1>
              COLOR TRAP
            </h1>

            <p>
              Read carefully.
              The rules may not stay the same.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("challenge")}
            >
              START ROUND →
            </button>

          </div>

        </div>
      )}

      {/* ======================================
          ROUND 1 — COLOR TRAP
      ====================================== */}

      {screen === "challenge" && (
        <div className="round-screen">

          <div className="round-topbar">
            <span>THINKTANK</span>
            <span>01 / 06</span>
          </div>

          <div className="round-progress">
            <div
              className="round-progress-fill"
              style={{ width: "16.66%" }}
            />
          </div>

          <div className="game-card">

            <Stroop
              onComplete={handleStroopComplete}
            />

          </div>

        </div>
      )}

      {/* ======================================
          ROUND 2 INTRO
      ====================================== */}

      {screen === "memory-intro" && (
        <div className="round-screen">

          <div className="round-topbar">
            <span>THINKTANK</span>
            <span>02 / 06</span>
          </div>

          <div className="round-progress">
            <div
              className="round-progress-fill"
              style={{ width: "33.33%" }}
            />
          </div>

          <div className="round-intro-card">

            <div className="round-number">
              ROUND 02
            </div>

            <h1>
              MEMORY TRAP
            </h1>

            <p>
              Objects disappear.
              Positions shift.
              Your memory has to keep up.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("memory")}
            >
              START ROUND →
            </button>

          </div>

        </div>
      )}

      {/* ======================================
          ROUND 2 — MEMORY
      ====================================== */}

      {screen === "memory" && (
        <div className="round-screen">

          <div className="round-topbar">
            <span>THINKTANK</span>
            <span>02 / 06</span>
          </div>

          <div className="round-progress">
            <div
              className="round-progress-fill"
              style={{ width: "33.33%" }}
            />
          </div>

          <div className="game-card">

            <Memory
              onComplete={handleMemoryComplete}
            />

          </div>

        </div>
      )}

      {/* ======================================
          ROUND 3 INTRO
      ====================================== */}

      {screen === "pattern-intro" && (
        <div className="round-screen">

          <div className="round-topbar">
            <span>THINKTANK</span>
            <span>03 / 06</span>
          </div>

          <div className="round-progress">
            <div
              className="round-progress-fill"
              style={{ width: "50%" }}
            />
          </div>

          <div className="round-intro-card">

            <div className="round-number">
              ROUND 03
            </div>

            <h1>
              LOGIC SHIFT
            </h1>

            <p>
              The pattern is hiding something.
              Find the rule before it changes.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("pattern")}
            >
              START ROUND →
            </button>

          </div>

        </div>
      )}

      {/* ======================================
          ROUND 3 — LOGIC SHIFT
      ====================================== */}

      {screen === "pattern" && (
        <div className="round-screen">

          <div className="round-topbar">
            <span>THINKTANK</span>
            <span>03 / 06</span>
          </div>

          <div className="round-progress">
            <div
              className="round-progress-fill"
              style={{ width: "50%" }}
            />
          </div>

          <div className="game-card">

            <Pattern
              onComplete={handlePatternComplete}
            />

          </div>

        </div>
      )}

      {/* ======================================
          ROUND 4 INTRO — THE LAB
      ====================================== */}

      {screen === "lab-intro" && (
        <div className="round-screen">

          <div className="round-topbar">
            <span>THINKTANK</span>
            <span>04 / 06</span>
          </div>

          <div className="round-progress">
            <div
              className="round-progress-fill"
              style={{ width: "66.66%" }}
            />
          </div>

          <div className="round-intro-card">

            <div className="round-number">
              ROUND 04
            </div>

            <h1>
              THE LAB
            </h1>

            <p>
              Investigate.
              Build.
              Adapt.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("lab")}
            >
              ENTER THE LAB →
            </button>

          </div>

        </div>
      )}

      {/* ======================================
          ROUND 4 — THE LAB
      ====================================== */}

      {screen === "lab" && (
        <div className="round-screen">

          <div className="round-topbar">
            <span>THINKTANK</span>
            <span>04 / 06</span>
          </div>

          <div className="round-progress">
            <div
              className="round-progress-fill"
              style={{ width: "66.66%" }}
            />
          </div>

          <div className="game-card">

            <Lab
              onComplete={handleLabComplete}
            />

          </div>

        </div>
      )}

      {/* ======================================
          ROUND 4 COMPLETE
      ====================================== */}

      {screen === "lab-complete" && (
        <div className="round-screen">

          <div className="round-topbar">
            <span>THINKTANK</span>
            <span>04 / 06</span>
          </div>

          <div className="round-progress">
            <div
              className="round-progress-fill"
              style={{ width: "66.66%" }}
            />
          </div>

          <div className="round-intro-card">

            <div className="round-number">
              ROUND 04 COMPLETE
            </div>

            <h1>
              THE LAB
            </h1>

            <p>
              You investigated the problem,
              built a plan and adapted when
              the situation changed.
            </p>

            <button
              className="primary-button"
              onClick={() => {
                setScreen("future");
              }}
            >
              CONTINUE →
            </button>

          </div>

        </div>
      )}

      {/* ======================================
          TEMPORARY FUTURE SCREEN
      ====================================== */}

      {screen === "future" && (
        <div className="summary-screen">

          <div className="eyebrow">
            ROUND 05
          </div>

          <h1>
            More is coming.
          </h1>

          <p className="summary-text">
            The next challenge will push
            ThinkTank into a different kind
            of pressure.
          </p>

          <div className="summary-grid">

            <div className="summary-card">
              <span>01</span>
              <strong>
                COLOR TRAP
              </strong>
              <small>
                {responseCount(
                  gameSession.stroop
                )} responses
              </small>
            </div>

            <div className="summary-card">
              <span>02</span>
              <strong>
                MEMORY TRAP
              </strong>
              <small>
                {responseCount(
                  gameSession.memory
                )} responses
              </small>
            </div>

            <div className="summary-card">
              <span>03</span>
              <strong>
                LOGIC SHIFT
              </strong>
              <small>
                {responseCount(
                  gameSession.pattern
                )} responses
              </small>
            </div>

            <div className="summary-card">
              <span>04</span>
              <strong>
                THE LAB
              </strong>
              <small>
                {responseCount(
                  gameSession.lab
                ) || "Complete"} 
              </small>
            </div>

          </div>

          <div className="summary-mindset">
            Entered as:
            <strong>{mindset}</strong>
          </div>

          <button
            className="secondary-button"
            onClick={showSessionData}
          >
            VIEW DATA IN CONSOLE
          </button>

        </div>
      )}

    </div>
  );
}

export default App;