import { useState } from "react";
import "./App.css";

import Stroop from "./games/Stroop";
import Memory from "./games/Memory";
import Pattern from "./games/Pattern";
import Lab from "./games/Lab";
import Trust from "./games/Trust";

function App() {
  const [screen, setScreen] = useState("home");

  const [gameSession, setGameSession] = useState({
    playerName: "",
    mindset: "",
    stroop: [],
    memory: [],
    pattern: [],
    lab: [],
    trust: {},
  });

  const handleNameSubmit = (name) => {
    setGameSession((prev) => ({
      ...prev,
      playerName: name,
    }));

    setScreen("mindset");
  };

  const handleMindset = (mindset) => {
    setGameSession((prev) => ({
      ...prev,
      mindset,
    }));

    setScreen("briefing");
  };

  const handleStroopComplete = (data) => {
    console.log("COLOR TRAP DATA:", data);

    setGameSession((prev) => ({
      ...prev,
      stroop: data || [],
    }));

    setScreen("memory-intro");
  };

  const handleMemoryComplete = (data) => {
    console.log("MEMORY TRAP DATA:", data);

    setGameSession((prev) => ({
      ...prev,
      memory: data || [],
    }));

    setScreen("pattern-intro");
  };

  const handlePatternComplete = (data) => {
    console.log("LOGIC SHIFT DATA:", data);

    setGameSession((prev) => ({
      ...prev,
      pattern: data || [],
    }));

    setScreen("lab-intro");
  };

  const handleLabComplete = (data) => {
    console.log("THE LAB DATA:", data);

    setGameSession((prev) => ({
      ...prev,
      lab: data || [],
    }));

    setScreen("lab-complete");
  };

  const handleTrustComplete = (data) => {
    console.log("TRUST DATA:", data);

    setGameSession((prev) => ({
      ...prev,
      trust: data || {},
    }));

    setScreen("trust-complete");
  };

  const getResponseCount = (data) => {
    if (Array.isArray(data)) {
      return data.length;
    }

    if (data && Array.isArray(data.questions)) {
      return data.questions.length;
    }

    return 0;
  };

  return (
    <main className="app">
      {/* =========================
          LANDING
      ========================== */}
      {screen === "home" && (
        <section className="landing-screen">
          <div className="landing-content">
            <p className="eyebrow">AN EXPERIMENT IN HUMAN THINKING</p>

            <h1 className="main-title">
              Think<span>Tank</span>
            </h1>

            <p className="hero-line">
              Your decisions reveal more than your answers.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("name")}
            >
              ENTER THE EXPERIENCE →
            </button>
          </div>
        </section>
      )}

      {/* =========================
          NAME
      ========================== */}
      {screen === "name" && (
        <section className="onboarding-screen">
          <div className="onboarding-card">
            <p className="eyebrow">BEFORE WE BEGIN</p>

            <h1 className="section-title">What should we call you?</h1>

            <p className="section-subtitle">
              Your name is only used to personalize this session.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                const input = e.target.elements.playerName.value.trim();

                if (!input) return;

                handleNameSubmit(input);
              }}
            >
              <input
                name="playerName"
                type="text"
                className="text-input"
                placeholder="Enter your name"
                autoComplete="off"
              />

              <button type="submit" className="primary-button">
                CONTINUE →
              </button>
            </form>
          </div>
        </section>
      )}

      {/* =========================
          MINDSET
      ========================== */}
      {screen === "mindset" && (
        <section className="onboarding-screen">
          <div className="onboarding-card">
            <p className="eyebrow">SET YOUR MINDSET</p>

            <h1 className="section-title">
              How are you approaching this?
            </h1>

            <p className="section-subtitle">
              There is no correct choice. Pick what feels closest right now.
            </p>

            <div className="mindset-grid">
              <button
                className="mindset-card"
                onClick={() => handleMindset("curious")}
              >
                <span className="mindset-number">01</span>
                <strong>CURIOUS</strong>
                <span>Let’s see what happens.</span>
              </button>

              <button
                className="mindset-card"
                onClick={() => handleMindset("competitive")}
              >
                <span className="mindset-number">02</span>
                <strong>COMPETITIVE</strong>
                <span>I want to perform.</span>
              </button>

              <button
                className="mindset-card"
                onClick={() => handleMindset("calm")}
              >
                <span className="mindset-number">03</span>
                <strong>CALM</strong>
                <span>I’ll take my time.</span>
              </button>

              <button
                className="mindset-card"
                onClick={() => handleMindset("unpredictable")}
              >
                <span className="mindset-number">04</span>
                <strong>UNPREDICTABLE</strong>
                <span>Keep me guessing.</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========================
          BRIEFING
      ========================== */}
      {screen === "briefing" && (
        <section className="onboarding-screen">
          <div className="briefing-container">
            <p className="eyebrow">SESSION BRIEFING</p>

            <h1 className="section-title">
              Six rounds.
              <br />
              One evolving session.
            </h1>

            <p className="section-subtitle">
              The challenges measure how you react to changing information,
              pressure, uncertainty and other people.
            </p>

            <div className="briefing-list">
              <div className="briefing-item">
                <span>01</span>

                <div>
                  <strong>COLOR TRAP</strong>
                  <p>Attention, inhibition and rule switching.</p>
                </div>
              </div>

              <div className="briefing-item">
                <span>02</span>

                <div>
                  <strong>MEMORY TRAP</strong>
                  <p>Recall, interference and information retention.</p>
                </div>
              </div>

              <div className="briefing-item">
                <span>03</span>

                <div>
                  <strong>LOGIC SHIFT</strong>
                  <p>Pattern recognition and adapting to hidden rules.</p>
                </div>
              </div>

              <div className="briefing-item">
                <span>04</span>

                <div>
                  <strong>THE LAB</strong>
                  <p>Investigation, planning and adaptation.</p>
                </div>
              </div>

              <div className="briefing-item">
                <span>05</span>

                <div>
                  <strong>TRUST</strong>
                  <p>Social deduction, influence and changing suspicion.</p>
                </div>
              </div>

              <div className="briefing-item">
                <span>06</span>

                <div>
                  <strong>FINAL DECISION</strong>
                  <p>The final challenge comes later.</p>
                </div>
              </div>
            </div>

            <button
              className="primary-button"
              onClick={() => setScreen("game")}
            >
              BEGIN ROUND 01 →
            </button>
          </div>
        </section>
      )}

      {/* =========================
          ROUND 1 INTRO
      ========================== */}
      {screen === "game" && (
        <section className="round-screen">
          <div className="round-intro-card">
            <p className="eyebrow">ROUND 01 / 06</p>

            <h1 className="section-title">COLOR TRAP</h1>

            <p className="section-subtitle">
              Your task looks simple.
              <br />
              Your brain may disagree.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("challenge")}
            >
              START ROUND →
            </button>
          </div>
        </section>
      )}

      {/* =========================
          ROUND 1
      ========================== */}
      {screen === "challenge" && (
        <Stroop onComplete={handleStroopComplete} />
      )}

      {/* =========================
          ROUND 2 INTRO
      ========================== */}
      {screen === "memory-intro" && (
        <section className="round-screen">
          <div className="round-intro-card">
            <p className="eyebrow">ROUND 02 / 06</p>

            <h1 className="section-title">MEMORY TRAP</h1>

            <p className="section-subtitle">
              Memory is not a recording.
              <br />
              Let’s see what your mind keeps.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("memory")}
            >
              START ROUND →
            </button>
          </div>
        </section>
      )}

      {/* =========================
          ROUND 2
      ========================== */}
      {screen === "memory" && (
        <Memory onComplete={handleMemoryComplete} />
      )}

      {/* =========================
          ROUND 3 INTRO
      ========================== */}
      {screen === "pattern-intro" && (
        <section className="round-screen">
          <div className="round-intro-card">
            <p className="eyebrow">ROUND 03 / 06</p>

            <h1 className="section-title">LOGIC SHIFT</h1>

            <p className="section-subtitle">
              Find the pattern.
              <br />
              Then find out when the pattern changes.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("pattern")}
            >
              START ROUND →
            </button>
          </div>
        </section>
      )}

      {/* =========================
          ROUND 3
      ========================== */}
      {screen === "pattern" && (
        <Pattern onComplete={handlePatternComplete} />
      )}

      {/* =========================
          ROUND 4 INTRO
      ========================== */}
      {screen === "lab-intro" && (
        <section className="round-screen">
          <div className="round-intro-card">
            <p className="eyebrow">ROUND 04 / 06</p>

            <h1 className="section-title">THE LAB</h1>

            <p className="section-subtitle">
              Something has gone wrong.
              <br />
              Investigate first. Decide later.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("lab")}
            >
              ENTER THE LAB →
            </button>
          </div>
        </section>
      )}

      {/* =========================
          ROUND 4
      ========================== */}
      {screen === "lab" && (
        <Lab onComplete={handleLabComplete} />
      )}

      {/* =========================
          ROUND 4 COMPLETE
      ========================== */}
      {screen === "lab-complete" && (
        <section className="round-screen">
          <div className="round-intro-card">
            <p className="eyebrow">ROUND 04 COMPLETE</p>

            <h1 className="section-title">PLAN CHANGED.</h1>

            <p className="section-subtitle">
              You investigated the system, formed a plan and adapted when new
              information appeared.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("trust-intro")}
            >
              CONTINUE TO ROUND 05 →
            </button>
          </div>
        </section>
      )}

      {/* =========================
          ROUND 5 INTRO
      ========================== */}
      {screen === "trust-intro" && (
        <section className="round-screen">
          <div className="round-intro-card">
            <p className="eyebrow">ROUND 05 / 06</p>

            <h1 className="section-title">TRUST</h1>

            <p className="section-subtitle">
              Five people.
              <br />
              Conflicting stories.
              <br />
              One of them is hiding something.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("trust")}
            >
              ENTER THE INVESTIGATION →
            </button>
          </div>
        </section>
      )}

      {/* =========================
          ROUND 5
      ========================== */}
      {screen === "trust" && (
        <Trust onComplete={handleTrustComplete} />
      )}

      {/* =========================
          ROUND 5 COMPLETE
      ========================== */}
      {screen === "trust-complete" && (
        <section className="round-screen">
          <div className="round-intro-card">
            <p className="eyebrow">ROUND 05 COMPLETE</p>

            <h1 className="section-title">WHO DID YOU TRUST?</h1>

            <p className="section-subtitle">
              You had statements, evidence and group influence to work with.
              <br />
              Your final decision was your own.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("future")}
            >
              CONTINUE →
            </button>
          </div>
        </section>
      )}

      {/* =========================
          TEMPORARY ROUND 6
      ========================== */}
      {screen === "future" && (
        <section className="round-screen">
          <div className="round-intro-card">
            <p className="eyebrow">SESSION PROGRESS</p>

            <h1 className="section-title">
              FIVE ROUNDS COMPLETE.
            </h1>

            <p className="section-subtitle">
              Nice work, {gameSession.playerName || "Player"}.
              <br />
              Round 06 is the final decision challenge.
            </p>

            <div className="session-summary">
              <div>
                <span>COLOR TRAP</span>
                <strong>
                  {getResponseCount(gameSession.stroop)} responses
                </strong>
              </div>

              <div>
                <span>MEMORY TRAP</span>
                <strong>
                  {getResponseCount(gameSession.memory)} responses
                </strong>
              </div>

              <div>
                <span>LOGIC SHIFT</span>
                <strong>
                  {getResponseCount(gameSession.pattern)} responses
                </strong>
              </div>

              <div>
                <span>THE LAB</span>
                <strong>Completed</strong>
              </div>

              <div>
                <span>TRUST</span>
                <strong>Completed</strong>
              </div>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                console.log("FULL THINKTANK SESSION:", gameSession);
              }}
            >
              VIEW SESSION DATA
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;