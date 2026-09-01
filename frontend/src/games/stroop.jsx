import { useEffect, useRef, useState } from "react";

function Stroop() {
  const questions = [
    {
      word: "RED",
      color: "blue",
      correctColor: "BLUE",
    },
    {
      word: "GREEN",
      color: "red",
      correctColor: "RED",
    },
    {
      word: "BLUE",
      color: "yellow",
      correctColor: "YELLOW",
    },
    {
      word: "YELLOW",
      color: "green",
      correctColor: "GREEN",
    },
    {
      word: "GREEN",
      color: "blue",
      correctColor: "BLUE",
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState(null);

  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);

  const [reactionTime, setReactionTime] = useState(null);
  const [liveTime, setLiveTime] = useState(0);

  const [finished, setFinished] = useState(false);

  const startTime = useRef(performance.now());

  const current = questions[currentQuestion];

  // --------------------------------
  // LIVE TIMER
  // --------------------------------

  useEffect(() => {
    if (answer !== null || finished) {
      return;
    }

    const timer = setInterval(() => {
      const elapsed = performance.now() - startTime.current;
      setLiveTime(elapsed);
    }, 10);

    return () => clearInterval(timer);
  }, [currentQuestion, answer, finished]);

  // --------------------------------
  // USER ANSWER
  // --------------------------------

  const handleAnswer = (selectedColor) => {
    if (answer !== null) {
      return;
    }

    const endTime = performance.now();

    const time = Math.round(
      endTime - startTime.current
    );

    const isCorrect =
      selectedColor === current.correctColor;

    setAnswer(selectedColor);
    setReactionTime(time);
    setLiveTime(time);

    if (isCorrect) {
      setScore((previousScore) => previousScore + 1);

      setCorrectAnswers(
        (previousCount) => previousCount + 1
      );
    } else {
      setWrongAnswers(
        (previousCount) => previousCount + 1
      );
    }

    // Behavioral data for later ML/backend
    console.log({
      task_type: "stroop",
      difficulty: 1,
      question_id: currentQuestion + 1,
      answer: selectedColor,
      correct: isCorrect,
      reaction_time: time,
      timestamp: new Date().toISOString(),
    });
  };

  // --------------------------------
  // NEXT QUESTION
  // --------------------------------

  const nextQuestion = () => {
    if (currentQuestion === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentQuestion(
      (previousQuestion) => previousQuestion + 1
    );

    setAnswer(null);
    setReactionTime(null);
    setLiveTime(0);

    startTime.current = performance.now();
  };

  // --------------------------------
  // FINAL RESULT
  // --------------------------------

  if (finished) {
    const accuracy =
      (correctAnswers / questions.length) * 100;

    const averageReactionTime =
      reactionTime;

    return (
      <div className="stroop-container">

        <p className="task-label">
          STROOP CHALLENGE COMPLETE
        </p>

        <h1>
          Great Job!
        </h1>

        <div className="result-box">

          <div className="result-item">
            <span>Score</span>
            <strong>
              {score} / {questions.length}
            </strong>
          </div>

          <div className="result-item">
            <span>Accuracy</span>
            <strong>
              {accuracy.toFixed(0)}%
            </strong>
          </div>

          <div className="result-item">
            <span>Correct</span>
            <strong>
              {correctAnswers}
            </strong>
          </div>

          <div className="result-item">
            <span>Wrong</span>
            <strong>
              {wrongAnswers}
            </strong>
          </div>

          <div className="result-item">
            <span>Last Reaction Time</span>
            <strong>
              {averageReactionTime} ms
            </strong>
          </div>

        </div>

        <p>
          You completed all Stroop questions.
        </p>

      </div>
    );
  }

  // --------------------------------
  // MAIN GAME SCREEN
  // --------------------------------

  return (
    <div className="stroop-container">

      <p className="task-label">
        STROOP CHALLENGE
      </p>

      <p>
        Question {currentQuestion + 1} / {questions.length}
      </p>

      {/* LIVE TIMER */}

      <div className="stroop-timer">
        Time: {(liveTime / 1000).toFixed(2)} s
      </div>

      <h2 className="stroop-instruction">
        Select the COLOR of the text
      </h2>

      <h1
        className="stroop-word"
        style={{ color: current.color }}
      >
        {current.word}
      </h1>

      <div className="color-options">

        <button
          className="color-button"
          onClick={() => handleAnswer("RED")}
          disabled={answer !== null}
        >
          RED
        </button>

        <button
          className="color-button"
          onClick={() => handleAnswer("BLUE")}
          disabled={answer !== null}
        >
          BLUE
        </button>

        <button
          className="color-button"
          onClick={() => handleAnswer("GREEN")}
          disabled={answer !== null}
        >
          GREEN
        </button>

        <button
          className="color-button"
          onClick={() => handleAnswer("YELLOW")}
          disabled={answer !== null}
        >
          YELLOW
        </button>

      </div>

      {answer && (
        <div className="stroop-result">

          {answer === current.correctColor ? (
            <p className="correct">
              Correct! 🎯
            </p>
          ) : (
            <p className="wrong">
              Wrong!
            </p>
          )}

          <p>
            Reaction Time: {reactionTime} ms
          </p>

          <button
            className="start-button"
            onClick={nextQuestion}
          >
            {currentQuestion === questions.length - 1
              ? "Finish"
              : "Next Question"}
          </button>

        </div>
      )}

    </div>
  );
}

export default Stroop;