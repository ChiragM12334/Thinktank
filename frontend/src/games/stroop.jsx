import { useEffect, useRef, useState } from "react";
import "./Stroop.css";

const COLORS = [
  { name: "RED", value: "#ff4f5e", emoji: "●" },
  { name: "BLUE", value: "#35a7ff", emoji: "●" },
  { name: "GREEN", value: "#62d96b", emoji: "●" },
  { name: "YELLOW", value: "#ffc83d", emoji: "●" },
];

const QUESTIONS = [
  {
    id: 1,
    phase: "WARM UP",
    rule: "COLOR",
    word: "BLUE",
    displayedColor: "#ff4f5e",
    answer: "RED",
    difficulty: 1,
    timed: false,
  },
  {
    id: 2,
    phase: "WARM UP",
    rule: "COLOR",
    word: "GREEN",
    displayedColor: "#35a7ff",
    answer: "BLUE",
    difficulty: 1,
    timed: false,
  },
  {
    id: 3,
    phase: "RULE SWITCH",
    rule: "WORD",
    word: "YELLOW",
    displayedColor: "#62d96b",
    answer: "YELLOW",
    difficulty: 2,
    timed: false,
  },
  {
    id: 4,
    phase: "RULE SWITCH",
    rule: "WORD",
    word: "RED",
    displayedColor: "#35a7ff",
    answer: "RED",
    difficulty: 2,
    timed: false,
  },
  {
    id: 5,
    phase: "TRAP",
    rule: "COLOR",
    word: "YELLOW",
    displayedColor: "#62d96b",
    answer: "GREEN",
    difficulty: 3,
    timed: true,
  },
  {
    id: 6,
    phase: "TRAP",
    rule: "WORD",
    word: "BLUE",
    displayedColor: "#ffc83d",
    answer: "BLUE",
    difficulty: 3,
    timed: true,
  },
  {
    id: 7,
    phase: "FINAL PRESSURE",
    rule: "COLOR",
    word: "RED",
    displayedColor: "#ffc83d",
    answer: "YELLOW",
    difficulty: 4,
    timed: true,
  },
  {
    id: 8,
    phase: "FINAL PRESSURE",
    rule: "WORD",
    word: "GREEN",
    displayedColor: "#ff4f5e",
    answer: "GREEN",
    difficulty: 4,
    timed: true,
  },
];

function getPhaseText(phase) {
  if (phase === "WARM UP") {
    return "Get familiar with the rule.";
  }

  if (phase === "RULE SWITCH") {
    return "The rule has changed. Adapt quickly.";
  }

  if (phase === "TRAP") {
    return "Your first instinct may be wrong.";
  }

  return "Maximum pressure. Stay focused.";
}

function getPhaseClass(phase) {
  if (phase === "WARM UP") return "warm";
  if (phase === "RULE SWITCH") return "switch";
  if (phase === "TRAP") return "trap";
  return "final";
}

function Stroop({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeouts, setTimeouts] = useState(0);
  const [ruleSwitchErrors, setRuleSwitchErrors] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [sessionData, setSessionData] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);

  const startTime = useRef(null);
  const timerRef = useRef(null);
  const sessionDataRef = useRef([]);

  const question = QUESTIONS[currentQuestion];
  const phaseClass = getPhaseClass(question.phase);

  useEffect(() => {
    if (gameFinished) return;

    startTime.current = performance.now();

    setSelectedAnswer(null);
    setAnswerState(null);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (question.timed) {
      setTimeLeft(3);

      timerRef.current = setInterval(() => {
        const elapsed =
          (performance.now() - startTime.current) / 1000;

        const remaining = Math.max(0, 3 - elapsed);

        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          handleAnswer(null, true);
        }
      }, 50);
    } else {
      setTimeLeft(3);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestion, gameFinished]);

  const handleAnswer = (answer, timedOut = false) => {
    if (selectedAnswer !== null || gameFinished) {
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const reactionTime = performance.now() - startTime.current;

    const isCorrect =
      !timedOut && answer === question.answer;

    const isRuleSwitchQuestion =
      question.phase === "RULE SWITCH" ||
      question.phase === "TRAP";

    const isRuleSwitchError =
      isRuleSwitchQuestion &&
      !isCorrect &&
      !timedOut;

    const resultItem = {
      task_type: "stroop",
      challenge: "color_trap",
      question_id: question.id,
      phase: question.phase,
      difficulty: question.difficulty,
      word: question.word,
      displayed_color: question.displayedColor,
      rule: question.rule,
      answer,
      expected_answer: question.answer,
      correct: isCorrect,
      reaction_time: timedOut
        ? null
        : Math.round(reactionTime),
      timed: question.timed,
      timed_out: timedOut,
      rule_changed: question.phase !== "WARM UP",
      rule_switch_error: isRuleSwitchError,
      timestamp: new Date().toISOString(),
    };

    const updatedData = [
      ...sessionDataRef.current,
      resultItem,
    ];

    sessionDataRef.current = updatedData;

    setSessionData(updatedData);
    setSelectedAnswer(answer);
    setAnswerState(
      timedOut
        ? "timeout"
        : isCorrect
        ? "correct"
        : "wrong"
    );

    if (isCorrect) {
      setScore(
        (previous) =>
          previous + question.difficulty
      );

      setCorrectCount(
        (previous) => previous + 1
      );

      setReactionTimes(
        (previous) => [
          ...previous,
          reactionTime,
        ]
      );
    } else {
      setWrongCount(
        (previous) => previous + 1
      );

      if (timedOut) {
        setTimeouts(
          (previous) => previous + 1
        );
      }

      if (isRuleSwitchError) {
        setRuleSwitchErrors(
          (previous) => previous + 1
        );
      }
    }

    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(
          (previous) => previous + 1
        );
      } else {
        setGameFinished(true);
      }
    }, 750);
  };

  const handleContinue = () => {
    if (!onComplete) return;

    const validReactionTimes =
      sessionDataRef.current
        .filter(
          (item) =>
            item.reaction_time !== null
        )
        .map(
          (item) =>
            item.reaction_time
        );

    const averageReaction =
      validReactionTimes.length > 0
        ? validReactionTimes.reduce(
            (sum, value) => sum + value,
            0
          ) / validReactionTimes.length
        : 0;

    const finalAccuracy =
      QUESTIONS.length > 0
        ? (correctCount /
            QUESTIONS.length) *
          100
        : 0;

    onComplete({
      challenge: "color_trap",
      score,
      total_questions: QUESTIONS.length,
      correct: correctCount,
      wrong: wrongCount,
      accuracy: finalAccuracy,
      average_reaction_time:
        averageReaction,
      timeouts,
      rule_switch_errors:
        ruleSwitchErrors,
      questions:
        sessionDataRef.current,
    });
  };

  if (gameFinished) {
    const validReactionTimes =
      sessionDataRef.current
        .filter(
          (item) =>
            item.reaction_time !== null
        )
        .map(
          (item) =>
            item.reaction_time
        );

    const averageReaction =
      validReactionTimes.length > 0
        ? validReactionTimes.reduce(
            (sum, value) => sum + value,
            0
          ) / validReactionTimes.length
        : 0;

    const accuracy =
      QUESTIONS.length > 0
        ? (correctCount /
            QUESTIONS.length) *
          100
        : 0;

    return (
      <div className="stroop-shell result-mode">
        <div className="stroop-noise" />

        <div className="stroop-result-wrap">
          <div className="stroop-result-topline">
            <span>THINKTANK / SESSION RESULT</span>
            <span>MODULE 01</span>
          </div>

          <div className="result-layout">
            <section className="result-main-panel">
              <div className="result-index">
                01 — COGNITIVE INTERFERENCE
              </div>

              <h1 className="result-title">
                COLOR
                <br />
                <span>TRAP</span>
              </h1>

              <p className="result-description">
                You made it through the rule switches.
                Your response pattern has been recorded
                for the next stage of analysis.
              </p>

              <div className="result-score-block">
                <span className="result-score-label">
                  FINAL SCORE
                </span>

                <strong className="result-score">
                  {String(score).padStart(2, "0")}
                </strong>

                <span className="result-score-unit">
                  POINTS
                </span>
              </div>

              <div className="result-message">
                <span className="message-light" />

                {accuracy >= 80
                  ? "Strong control under interference."
                  : accuracy >= 60
                  ? "Good instincts — the rule switches caught you a few times."
                  : "The traps worked. Stay sharp for the next round."}
              </div>

              <button
                className="stroop-continue-btn"
                onClick={handleContinue}
              >
                <span>CONTINUE TO ROUND 02</span>
                <span className="arrow">→</span>
              </button>
            </section>

            <aside className="result-side-panel">
              <div className="panel-heading">
                SESSION METRICS
              </div>

              <div className="result-stat">
                <div className="stat-top">
                  <span>ACCURACY</span>
                  <span>01</span>
                </div>
                <strong>
                  {Math.round(accuracy)}%
                </strong>
                <div className="stat-line">
                  <span
                    style={{
                      width: `${Math.min(
                        accuracy,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="result-stat">
                <div className="stat-top">
                  <span>AVG REACTION</span>
                  <span>02</span>
                </div>
                <strong>
                  {Math.round(
                    averageReaction
                  )}{" "}
                  <small>MS</small>
                </strong>
                <div className="mini-readout">
                  RESPONSE LATENCY
                </div>
              </div>

              <div className="result-stat">
                <div className="stat-top">
                  <span>RULE ERRORS</span>
                  <span>03</span>
                </div>
                <strong>
                  {String(
                    ruleSwitchErrors
                  ).padStart(2, "0")}
                </strong>
                <div className="mini-readout">
                  SWITCH CONTROL
                </div>
              </div>

              <div className="result-stat">
                <div className="stat-top">
                  <span>TIMEOUTS</span>
                  <span>04</span>
                </div>
                <strong>
                  {String(
                    timeouts
                  ).padStart(2, "0")}
                </strong>
                <div className="mini-readout">
                  TIME PRESSURE
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  const progress =
    ((currentQuestion + 1) /
      QUESTIONS.length) *
    100;

  const questionNumber = String(
    currentQuestion + 1
  ).padStart(2, "0");

  const ruleNumber =
    question.rule === "COLOR"
      ? "01"
      : "02";

  return (
    <div
      className={`stroop-shell phase-${phaseClass}`}
      style={{
        "--stimulus-color":
          question.displayedColor,
      }}
    >
      <div className="stroop-noise" />
      <div className="stroop-grid" />

      <header className="stroop-header">
        <div className="brand-block">
          <div className="brand-name">
            THINKTANK
          </div>

          <div className="brand-sub">
            COGNITIVE TEST SYSTEM
          </div>
        </div>

        <div className="header-center">
          <span className="system-dot" />
          <span>
            MODULE 01 / COLOR TRAP
          </span>
        </div>

        <div className="round-counter">
          <span>QUESTION</span>

          <strong>
            {questionNumber}
            <em>/08</em>
          </strong>
        </div>
      </header>

      <div className="progress-strip">
        <div className="progress-meta">
          <span>SESSION PROGRESS</span>
          <span>
            {Math.round(progress)}%
          </span>
        </div>

        <div className="progress-track-new">
          {QUESTIONS.map((item, index) => (
            <span
              key={item.id}
              className={
                index <= currentQuestion
                  ? "filled"
                  : ""
              }
            />
          ))}
        </div>
      </div>

      <main className="stroop-main">
        <aside className="left-rail">
          <div className="rail-label">
            COGNITIVE
            <br />
            INTERFERENCE
          </div>

          <div className="rail-line" />

          <div className="rail-step">
            <span className="step-num">
              01
            </span>

            <span className="step-copy">
              ATTENTION
            </span>
          </div>

          <div className="rail-step active">
            <span className="step-num">
              02
            </span>

            <span className="step-copy">
              RESPONSE
            </span>
          </div>

          <div className="rail-step">
            <span className="step-num">
              03
            </span>

            <span className="step-copy">
              ADAPT
            </span>
          </div>
        </aside>

        <section className="test-stage">
          <div className="stage-header">
            <div>
              <div className="phase-tag">
                <span className="phase-dot" />
                {question.phase}
              </div>

              <h1>
                DON'T TRUST
                <br />
                <span>YOUR BRAIN.</span>
              </h1>

              <p>
                {getPhaseText(
                  question.phase
                )}
              </p>
            </div>

            <div className="pressure-block">
              <span className="pressure-label">
                {question.timed
                  ? "TIME PRESSURE"
                  : "NO LIMIT"}
              </span>

              {question.timed ? (
                <div
                  className={`timer-readout ${
                    timeLeft <= 1
                      ? "danger"
                      : ""
                  }`}
                >
                  <span>
                    {timeLeft.toFixed(1)}
                  </span>
                  <small>SEC</small>
                </div>
              ) : (
                <div className="timer-readout idle">
                  <span>∞</span>
                  <small>FREE</small>
                </div>
              )}
            </div>
          </div>

          <div className="rule-banner">
            <div className="rule-index">
              RULE {ruleNumber}
            </div>

            <div className="rule-content">
              <span>CURRENT COMMAND</span>

              <strong>
                {question.rule ===
                "COLOR"
                  ? "SELECT THE COLOR"
                  : "SELECT THE WORD"}
              </strong>
            </div>

            <div className="rule-mark">
              {question.rule ===
              "COLOR"
                ? "CLR"
                : "WRD"}
            </div>
          </div>

          <div className="stimulus-zone">
            <div className="stimulus-top">
              <span>
                VISUAL STIMULUS
              </span>

              <span>
                INPUT REQUIRED
              </span>
            </div>

            <div className="stimulus-frame">
              <div className="corner tl" />
              <div className="corner tr" />
              <div className="corner bl" />
              <div className="corner br" />

              <div
                className="stimulus-word"
                style={{
                  color:
                    question.displayedColor,
                }}
              >
                {question.word}
              </div>

              <div className="stimulus-under">
                SELECT BASED ON{" "}
                <strong>
                  {question.rule}
                </strong>
              </div>
            </div>
          </div>

          <div className="instruction-row">
            <div className="instruction-index">
              RESPONSE
            </div>

            <div className="instruction-copy">
              {question.rule ===
              "COLOR"
                ? "Ignore the word. Identify the color you are seeing."
                : "Ignore the color. Identify the word you are seeing."}
            </div>
          </div>

          <div className="answer-grid">
            {COLORS.map((color, index) => {
              const isSelected =
                selectedAnswer ===
                color.name;

              let optionClass = "";

              if (
                isSelected &&
                answerState === "correct"
              ) {
                optionClass =
                  "selected-correct";
              }

              if (
                isSelected &&
                answerState === "wrong"
              ) {
                optionClass =
                  "selected-wrong";
              }

              if (
                isSelected &&
                answerState === "timeout"
              ) {
                optionClass =
                  "selected-timeout";
              }

              return (
                <button
                  key={color.name}
                  className={`answer-button ${optionClass}`}
                  onClick={() =>
                    handleAnswer(
                      color.name
                    )
                  }
                  disabled={
                    selectedAnswer !==
                    null
                  }
                >
                  <span className="button-number">
                    0{index + 1}
                  </span>

                  <span
                    className="button-color"
                    style={{
                      background:
                        color.value,
                    }}
                  />

                  <span className="button-name">
                    {color.name}
                  </span>

                  <span className="button-arrow">
                    →
                  </span>
                </button>
              );
            })}
          </div>

          <div className="live-footer">
            <div className="live-stat">
              <span>SCORE</span>
              <strong>{score}</strong>
            </div>

            <div className="live-stat">
              <span>CORRECT</span>
              <strong>
                {String(
                  correctCount
                ).padStart(2, "0")}
              </strong>
            </div>

            <div className="live-stat error-stat">
              <span>ERRORS</span>
              <strong>
                {String(
                  wrongCount
                ).padStart(2, "0")}
              </strong>
            </div>

            <div className="live-status">
              <span className="status-pulse" />
              SESSION RECORDING
            </div>
          </div>

          {answerState && (
            <div
              className={`feedback-banner ${
                answerState ===
                "correct"
                  ? "feedback-correct"
                  : answerState ===
                    "timeout"
                  ? "feedback-timeout"
                  : "feedback-wrong"
              }`}
            >
              <span className="feedback-mark">
                {answerState ===
                "correct"
                  ? "✓"
                  : answerState ===
                    "timeout"
                  ? "!"
                  : "×"}
              </span>

              <span>
                {answerState ===
                  "correct" &&
                  "CORRECT RESPONSE — SIGNAL MATCHED"}

                {answerState ===
                  "wrong" &&
                  `WRONG RESPONSE — ${question.answer} WAS CORRECT`}

                {answerState ===
                  "timeout" &&
                  `TIMEOUT — ${question.answer} WAS CORRECT`}
              </span>
            </div>
          )}
        </section>

        <aside className="right-rail">
          <div className="rail-card">
            <span className="rail-card-label">
              PHASE
            </span>

            <strong>
              {question.phase}
            </strong>
          </div>

          <div className="rail-card">
            <span className="rail-card-label">
              DIFFICULTY
            </span>

            <div className="difficulty-bars">
              {[1, 2, 3, 4].map(
                (level) => (
                  <span
                    key={level}
                    className={
                      level <=
                      question.difficulty
                        ? "on"
                        : ""
                    }
                  />
                )
              )}
            </div>
          </div>

          <div className="rail-card">
            <span className="rail-card-label">
              MODE
            </span>

            <strong>
              {question.timed
                ? "PRESSURE"
                : "FOCUS"}
            </strong>
          </div>

          <div className="rail-card quote-card">
            <div className="quote-mark">
              //
            </div>

            <p>
              Your first answer
              is not always your
              best answer.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Stroop;