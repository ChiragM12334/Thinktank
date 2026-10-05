import { useEffect, useRef, useState } from "react";

function Memory({ onComplete }) {
  const questions = [
    {
      mode: "recall",
      label: "OBJECT RECALL",
      items: ["🍎", "🚗", "🐶", "⭐", "🎸"],
      question: "Which object was shown?",
      options: ["🍎", "🐱", "🚲", "🌙"],
      correctAnswer: "🍎",
      hint: "Trust what you actually saw.",
    },
    {
      mode: "order",
      label: "ORDER RECALL",
      items: ["🌙", "🍕", "🐼", "🎧", "🚀"],
      question: "Which object was 3rd?",
      options: ["🌙", "🍕", "🐼", "🚀"],
      correctAnswer: "🐼",
      hint: "Position matters.",
    },
    {
      mode: "missing",
      label: "MISSING OBJECT",
      items: ["🍉", "🚗", "⭐", "🐱", "🎸"],
      secondItems: ["🍉", "⭐", "🐱", "🎸"],
      question: "Which object disappeared?",
      options: ["🍉", "🚗", "🐱", "🎸"],
      correctAnswer: "🚗",
      hint: "Notice what changed.",
    },
    {
      mode: "position",
      label: "POSITION MEMORY",
      items: ["🦁", "🍔", "✈️", "🌈", "🎯", "🏠"],
      question: "Which object was in position 4?",
      options: ["🦁", "🌈", "🎯", "🏠"],
      correctAnswer: "🌈",
      hint: "Your memory has coordinates.",
    },
    {
      mode: "sequence",
      label: "SEQUENCE TRAP",
      items: ["🔵", "🟢", "🔴", "🟡", "🟣"],
      question: "What came after 🔴?",
      options: ["🔵", "🟢", "🟡", "🟣"],
      correctAnswer: "🟡",
      hint: "Recall the order, not just the objects.",
    },
  ];

  const totalQuestions =
    questions.length;

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [phase, setPhase] =
    useState("memorize");

  const [countdown, setCountdown] =
    useState(3);

  const [answer, setAnswer] =
    useState(null);

  const [reactionTime, setReactionTime] =
    useState(null);

  const [reactionTimes, setReactionTimes] =
    useState([]);

  const [correctAnswers, setCorrectAnswers] =
    useState(0);

  const [wrongAnswers, setWrongAnswers] =
    useState(0);

  const [sessionData, setSessionData] =
    useState([]);

  const [elapsedTime, setElapsedTime] =
    useState(0);

  const sessionDataRef =
    useRef([]);

  const startTime =
    useRef(performance.now());

  const current =
    questions[currentQuestion];

  /* =========================================
     MEMORIZE TIMER
     ========================================= */

  useEffect(() => {
    if (phase !== "memorize") {
      return;
    }

    if (countdown === 0) {
      if (current.mode === "missing") {
        setPhase("interference");
      } else {
        setPhase("question");
        startTime.current =
          performance.now();
      }

      return;
    }

    const timer = setTimeout(() => {
      setCountdown(
        (value) => value - 1
      );
    }, 1000);

    return () =>
      clearTimeout(timer);
  }, [
    phase,
    countdown,
    current,
  ]);

  /* =========================================
     INTERFERENCE
     ========================================= */

  useEffect(() => {
    if (phase !== "interference") {
      return;
    }

    const timer = setTimeout(() => {
      setPhase("question");

      startTime.current =
        performance.now();
    }, 1800);

    return () =>
      clearTimeout(timer);
  }, [phase]);

  /* =========================================
     LIVE REACTION TIMER
     ========================================= */

  useEffect(() => {
    if (phase !== "question") {
      return;
    }

    const timer = setInterval(() => {
      setElapsedTime(
        performance.now() -
          startTime.current
      );
    }, 50);

    return () =>
      clearInterval(timer);
  }, [phase, currentQuestion]);

  /* =========================================
     ANSWER
     ========================================= */

  const handleAnswer = (
    selectedAnswer
  ) => {
    if (answer !== null) {
      return;
    }

    const time = Math.round(
      performance.now() -
        startTime.current
    );

    const isCorrect =
      selectedAnswer ===
      current.correctAnswer;

    const response = {
      task_type: "memory",
      challenge: "memory_trap",
      difficulty: 2,
      mode: current.mode,
      mode_label: current.label,
      question_id:
        currentQuestion + 1,
      memorized_items:
        current.items,
      answer: selectedAnswer,
      expected_answer:
        current.correctAnswer,
      correct: isCorrect,
      reaction_time: time,
      timestamp:
        new Date().toISOString(),
    };

    sessionDataRef.current = [
      ...sessionDataRef.current,
      response,
    ];

    setSessionData(
      sessionDataRef.current
    );

    setAnswer(selectedAnswer);
    setReactionTime(time);
    setElapsedTime(time);

    setReactionTimes(
      (previous) => [
        ...previous,
        time,
      ]
    );

    if (isCorrect) {
      setCorrectAnswers(
        (value) => value + 1
      );
    } else {
      setWrongAnswers(
        (value) => value + 1
      );
    }

    console.log(
      "Memory Trap response:",
      response
    );
  };

  /* =========================================
     NEXT QUESTION
     ========================================= */

  const nextQuestion = () => {
    if (
      currentQuestion ===
      questions.length - 1
    ) {
      setPhase("finished");
      return;
    }

    setCurrentQuestion(
      (value) => value + 1
    );

    setPhase("memorize");
    setCountdown(3);
    setAnswer(null);
    setReactionTime(null);
    setElapsedTime(0);

    startTime.current =
      performance.now();
  };

  /* =========================================
     CONTINUE AFTER RESULT
     ========================================= */

  const handleContinue = () => {
    if (!onComplete) {
      return;
    }

    onComplete(
      sessionDataRef.current
    );
  };

  /* =========================================
     RESULT
     ========================================= */

  if (phase === "finished") {
    const accuracy =
      (correctAnswers /
        totalQuestions) *
      100;

    const average =
      reactionTimes.length > 0
        ? reactionTimes.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          reactionTimes.length
        : 0;

    return (
      <div className="challenge-inner memory-result">
        <div className="task-label">
          ROUND 02 COMPLETE
        </div>

        <h1 className="memory-result-title">
          Your memory left a trace.
        </h1>

        <p className="memory-result-subtext">
          Five different memory traps.
          One snapshot of how you recall
          information under changing conditions.
        </p>

        <div className="result-box">
          <div className="result-item">
            <span>SCORE</span>
            <strong>
              {correctAnswers}/
              {totalQuestions}
            </strong>
          </div>

          <div className="result-item">
            <span>ACCURACY</span>
            <strong>
              {accuracy.toFixed(0)}%
            </strong>
          </div>

          <div className="result-item">
            <span>AVG REACTION</span>
            <strong>
              {average.toFixed(0)} ms
            </strong>
          </div>

          <div className="result-item">
            <span>MODES TESTED</span>
            <strong>
              {totalQuestions}
            </strong>
          </div>
        </div>

        <div className="memory-mode-summary">
          <span>RECALL</span>
          <span>ORDER</span>
          <span>MISSING</span>
          <span>POSITION</span>
          <span>SEQUENCE</span>
        </div>

        <div className="memory-result-message">
          {accuracy >= 80
            ? "Excellent recall. You stayed accurate across different memory demands."
            : accuracy >= 60
            ? "Good memory, but the traps exposed a few weak spots."
            : "The traps worked. Your memory had to switch strategies."}
        </div>

        <button
          className="primary-button"
          onClick={handleContinue}
        >
          CONTINUE TO ROUND 03 →
        </button>
      </div>
    );
  }

  /* =========================================
     INTERFERENCE
     ========================================= */

  if (phase === "interference") {
    return (
      <div className="challenge-inner memory-game">
        <div className="memory-topbar">
          <div>
            <div className="task-label">
              ROUND 02
            </div>

            <div className="memory-round-name">
              MEMORY TRAP
            </div>
          </div>

          <div className="question-counter">
            {String(
              currentQuestion + 1
            ).padStart(2, "0")}{" "}
            /{" "}
            {String(
              totalQuestions
            ).padStart(2, "0")}
          </div>
        </div>

        <div className="memory-progress">
          <div
            className="memory-progress-fill"
            style={{
              width: `${
                ((currentQuestion + 1) /
                  totalQuestions) *
                100
              }%`,
            }}
          />
        </div>

        <div className="memory-mode-pill">
          {current.label}
        </div>

        <h2 className="memory-heading">
          Something changed.
        </h2>

        <p className="memory-subtext">
          The arrangement changed.
          Hold the original pattern in mind.
        </p>

        <div className="memory-items">
          {current.secondItems.map(
            (item, index) => (
              <div
                className="memory-item"
                key={index}
              >
                {item}
              </div>
            )
          )}
        </div>

        <div className="interference-warning">
          ⚠ INTERFERENCE DETECTED
        </div>
      </div>
    );
  }

  /* =========================================
     MEMORIZE
     ========================================= */

  if (phase === "memorize") {
    return (
      <div className="challenge-inner memory-game">
        <div className="memory-topbar">
          <div>
            <div className="task-label">
              ROUND 02
            </div>

            <div className="memory-round-name">
              MEMORY TRAP
            </div>
          </div>

          <div className="question-counter">
            {String(
              currentQuestion + 1
            ).padStart(2, "0")}{" "}
            /{" "}
            {String(
              totalQuestions
            ).padStart(2, "0")}
          </div>
        </div>

        <div className="memory-progress">
          <div
            className="memory-progress-fill"
            style={{
              width: `${
                ((currentQuestion + 1) /
                  totalQuestions) *
                100
              }%`,
            }}
          />
        </div>

        <div className="memory-mode-pill">
          {current.label}
        </div>

        <h2 className="memory-heading">
          Remember this.
        </h2>

        <p className="memory-subtext">
          You only get a few seconds.
          Don't overthink it.
        </p>

        <div className="memory-items">
          {current.items.map(
            (item, index) => (
              <div
                className="memory-item"
                key={index}
              >
                {item}
              </div>
            )
          )}
        </div>

        <div className="memory-countdown">
          {countdown}
        </div>

        <div className="memory-countdown-label">
          MEMORIZE
        </div>
      </div>
    );
  }

  /* =========================================
     QUESTION
     ========================================= */

  return (
    <div className="challenge-inner memory-game">
      <div className="memory-topbar">
        <div>
          <div className="task-label">
            ROUND 02
          </div>

          <div className="memory-round-name">
            MEMORY TRAP
          </div>
        </div>

        <div className="question-counter">
          {String(
            currentQuestion + 1
          ).padStart(2, "0")}{" "}
          /{" "}
          {String(
            totalQuestions
          ).padStart(2, "0")}
        </div>
      </div>

      <div className="memory-progress">
        <div
          className="memory-progress-fill"
          style={{
            width: `${
              ((currentQuestion + 1) /
                totalQuestions) *
              100
            }%`,
          }}
        />
      </div>

      <div className="memory-mode-pill">
        {current.label}
      </div>

      <div className="live-timer memory-live-timer">
        {(elapsedTime / 1000).toFixed(
          2
        )}
        s
      </div>

      <h2 className="memory-heading question-heading">
        {current.question}
      </h2>

      <p className="memory-subtext">
        {current.hint}
      </p>

      <div className="memory-options">
        {current.options.map(
          (option, index) => {
            const selected =
              answer === option;

            const isCorrect =
              option ===
              current.correctAnswer;

            let stateClass = "";

            if (selected) {
              stateClass = isCorrect
                ? "memory-correct"
                : "memory-wrong";
            }

            return (
              <button
                key={index}
                className={`memory-option ${stateClass}`}
                onClick={() =>
                  handleAnswer(
                    option
                  )
                }
                disabled={
                  answer !== null
                }
              >
                <span className="memory-option-number">
                  0{index + 1}
                </span>

                <span className="memory-option-value">
                  {option}
                </span>
              </button>
            );
          }
        )}
      </div>

      {answer && (
        <div className="answer-feedback">
          {answer ===
          current.correctAnswer ? (
            <p className="correct">
              ✓ CORRECT
            </p>
          ) : (
            <p className="wrong">
              ✕ WRONG — correct answer:{" "}
              {current.correctAnswer}
            </p>
          )}

          <p>
            Reaction:{" "}
            {reactionTime} ms
          </p>

          <button
            className="secondary-button"
            onClick={() => {
              if (
                currentQuestion ===
                questions.length - 1
              ) {
                setPhase("finished");
              } else {
                nextQuestion();
              }
            }}
          >
            {currentQuestion ===
            questions.length - 1
              ? "VIEW RESULT →"
              : "NEXT →"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Memory;