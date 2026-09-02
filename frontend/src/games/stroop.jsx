import { useEffect, useRef, useState } from "react";

const COLORS = [
  { name: "RED", value: "#ff4d6d", emoji: "🔴" },
  { name: "BLUE", value: "#4d8dff", emoji: "🔵" },
  { name: "GREEN", value: "#35d07f", emoji: "🟢" },
  { name: "YELLOW", value: "#ffd84d", emoji: "🟡" },
];

const QUESTIONS = [
  {
    id: 1,
    phase: "WARM UP",
    rule: "COLOR",
    word: "BLUE",
    displayedColor: "#ff4d6d",
    answer: "RED",
    difficulty: 1,
    timed: false,
  },
  {
    id: 2,
    phase: "WARM UP",
    rule: "COLOR",
    word: "GREEN",
    displayedColor: "#4d8dff",
    answer: "BLUE",
    difficulty: 1,
    timed: false,
  },
  {
    id: 3,
    phase: "RULE SWITCH",
    rule: "WORD",
    word: "YELLOW",
    displayedColor: "#35d07f",
    answer: "YELLOW",
    difficulty: 2,
    timed: false,
  },
  {
    id: 4,
    phase: "RULE SWITCH",
    rule: "WORD",
    word: "RED",
    displayedColor: "#4d8dff",
    answer: "RED",
    difficulty: 2,
    timed: false,
  },
  {
    id: 5,
    phase: "TRAP",
    rule: "COLOR",
    word: "YELLOW",
    displayedColor: "#35d07f",
    answer: "GREEN",
    difficulty: 3,
    timed: true,
  },
  {
    id: 6,
    phase: "TRAP",
    rule: "WORD",
    word: "BLUE",
    displayedColor: "#ffd84d",
    answer: "BLUE",
    difficulty: 3,
    timed: true,
  },
  {
    id: 7,
    phase: "FINAL PRESSURE",
    rule: "COLOR",
    word: "RED",
    displayedColor: "#ffd84d",
    answer: "YELLOW",
    difficulty: 4,
    timed: true,
  },
  {
    id: 8,
    phase: "FINAL PRESSURE",
    rule: "WORD",
    word: "GREEN",
    displayedColor: "#ff4d6d",
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
        /*
         * IMPORTANT:
         * Do NOT call onComplete here.
         * We want the result screen to remain visible
         * until the player presses CONTINUE.
         */
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
      <div className="challenge-card result-card">
        <div className="result-kicker">
          ROUND 01 COMPLETE
        </div>

        <h1 className="challenge-title">
          COLOR TRAP
        </h1>

        <p className="challenge-description">
          You made it through the rule switches.
        </p>

        <div className="result-main-score">
          <span>{score}</span>
          <small>POINTS</small>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <span>ACCURACY</span>
            <strong>
              {Math.round(accuracy)}%
            </strong>
          </div>

          <div className="stat-box">
            <span>AVG REACTION</span>
            <strong>
              {Math.round(
                averageReaction
              )} ms
            </strong>
          </div>

          <div className="stat-box">
            <span>RULE ERRORS</span>
            <strong>
              {ruleSwitchErrors}
            </strong>
          </div>

          <div className="stat-box">
            <span>TIMEOUTS</span>
            <strong>
              {timeouts}
            </strong>
          </div>
        </div>

        <div className="result-message">
          {accuracy >= 80
            ? "Strong control under interference."
            : accuracy >= 60
            ? "Good instincts — the rule switches caught you a few times."
            : "The traps worked. Stay sharp for the next round."}
        </div>

        <button
          className="primary-button"
          onClick={handleContinue}
        >
          CONTINUE TO ROUND 02 →
        </button>
      </div>
    );
  }

  const progress =
    ((currentQuestion + 1) /
      QUESTIONS.length) *
    100;

  return (
    <div className="challenge-card">
      <div className="challenge-topbar">
        <div>
          <div className="round-label">
            ROUND 01
          </div>

          <div className="round-name">
            COLOR TRAP
          </div>
        </div>

        <div className="question-counter">
          {String(
            currentQuestion + 1
          ).padStart(2, "0")}{" "}
          /{" "}
          {String(
            QUESTIONS.length
          ).padStart(2, "0")}
        </div>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="phase-row">
        <div className="phase-pill">
          {question.phase}
        </div>

        {question.timed && (
          <div
            className={`pressure-pill ${
              timeLeft <= 1
                ? "danger"
                : ""
            }`}
          >
            ⚡ {timeLeft.toFixed(1)}s
          </div>
        )}
      </div>

      <div className="challenge-heading-block">
        <h1 className="challenge-title">
          DON'T TRUST YOUR BRAIN.
        </h1>

        <p className="challenge-description">
          {getPhaseText(
            question.phase
          )}
        </p>
      </div>

      <div className="rule-card">
        <span className="rule-label">
          CURRENT RULE
        </span>

        <strong>
          {question.rule === "COLOR"
            ? "SELECT THE COLOR"
            : "SELECT THE WORD"}
        </strong>
      </div>

      <div
        className="stroop-word"
        style={{
          color:
            question.displayedColor,
        }}
      >
        {question.word}
      </div>

      <div className="instruction-text">
        {question.rule === "COLOR"
          ? "Ignore the word. What COLOR are you seeing?"
          : "Ignore the color. What WORD are you seeing?"}
      </div>

      <div className="color-options">
        {COLORS.map((color) => {
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
              className={`color-option ${optionClass}`}
              onClick={() =>
                handleAnswer(
                  color.name
                )
              }
              disabled={
                selectedAnswer !== null
              }
            >
              <span
                className="color-dot"
                style={{
                  background:
                    color.value,
                }}
              />

              <span className="color-option-name">
                {color.name}
              </span>

              <span className="color-option-key">
                {color.emoji}
              </span>
            </button>
          );
        })}
      </div>

      <div className="micro-stats">
        <span>
          SCORE{" "}
          <strong>{score}</strong>
        </span>

        <span>
          CORRECT{" "}
          <strong>
            {correctCount}
          </strong>
        </span>

        <span>
          ERRORS{" "}
          <strong>
            {wrongCount}
          </strong>
        </span>
      </div>

      {answerState && (
        <div
          className={`answer-feedback ${
            answerState === "correct"
              ? "feedback-correct"
              : "feedback-wrong"
          }`}
        >
          {answerState ===
            "correct" &&
            "✓ CORRECT"}

          {answerState ===
            "wrong" &&
            `✕ WRONG — ${question.answer} was correct`}

          {answerState ===
            "timeout" &&
            `⌛ TOO SLOW — ${question.answer} was correct`}
        </div>
      )}
    </div>
  );
}

export default Stroop;