import { useEffect, useRef, useState } from "react";

const QUESTIONS = [
  {
    type: "ALTERNATING",
    difficulty: 1,
    sequence: ["▲", "●", "▲", "●", "?"],
    question: "What comes next?",
    options: ["▲", "●", "■", "★"],
    correctAnswer: "▲",
    rule: "The symbols alternate between ▲ and ●.",
  },

  {
    type: "INCREMENT",
    difficulty: 1,
    sequence: ["2", "4", "6", "8", "?"],
    question: "What comes next?",
    options: ["9", "10", "12", "14"],
    correctAnswer: "10",
    rule: "Each number increases by 2.",
  },

  {
    type: "SQUARE",
    difficulty: 2,
    sequence: ["1", "4", "9", "16", "?"],
    question: "What comes next?",
    options: ["20", "24", "25", "36"],
    correctAnswer: "25",
    rule: "These are consecutive square numbers: 1², 2², 3², 4², 5².",
  },

  {
    type: "HIDDEN RULE",
    difficulty: 3,
    sequence: ["2", "5", "10", "17", "?"],
    question: "Find the hidden pattern.",
    options: ["24", "26", "27", "29"],
    correctAnswer: "26",
    rule: "The gaps are +3, +5, +7, +9.",
  },

  {
    type: "RULE SHIFT",
    difficulty: 4,
    sequence: ["2", "6", "7", "21", "22", "66", "?"],
    question: "The rule keeps switching. What comes next?",
    options: ["67", "68", "88", "99"],
    correctAnswer: "67",
    rule: "The pattern alternates ×3 and +1.",
  },
];

const COLORS = {
  bg: "#090d17",
  card: "#101728",
  cardLight: "#151e32",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(139,124,255,0.42)",
  text: "#f5f7ff",
  muted: "#8f98ab",
  accent: "#9b8fff",
  accentSoft: "rgba(139,124,255,0.10)",
  success: "#35d07f",
  successSoft: "rgba(53,208,127,0.10)",
  danger: "#ff607d",
  dangerSoft: "rgba(255,96,125,0.10)",
};

function Pattern({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [answerState, setAnswerState] =
    useState(null);

  const [reactionTime, setReactionTime] =
    useState(null);

  const [reactionTimes, setReactionTimes] =
    useState([]);

  const [correctCount, setCorrectCount] =
    useState(0);

  const [wrongCount, setWrongCount] =
    useState(0);

  const [score, setScore] =
    useState(0);

  const [sessionData, setSessionData] =
    useState([]);

  const [finished, setFinished] =
    useState(false);

  const [liveTime, setLiveTime] =
    useState(0);

  const startTime =
    useRef(performance.now());

  const sessionDataRef =
    useRef([]);

  const question =
    QUESTIONS[currentQuestion];

  /* ==========================================
     TIMER
  ========================================== */

  useEffect(() => {
    if (finished) {
      return;
    }

    startTime.current =
      performance.now();

    setLiveTime(0);
    setSelectedAnswer(null);
    setAnswerState(null);
    setReactionTime(null);

    const timer = setInterval(() => {
      setLiveTime(
        performance.now() -
          startTime.current
      );
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, [currentQuestion, finished]);

  /* ==========================================
     ANSWER
  ========================================== */

  const handleAnswer = (
    selected
  ) => {
    if (selectedAnswer !== null) {
      return;
    }

    const reaction =
      performance.now() -
      startTime.current;

    const isCorrect =
      selected ===
      question.correctAnswer;

    const response = {
      task_type: "pattern",

      challenge: "logic_shift",

      difficulty:
        question.difficulty,

      question_id:
        currentQuestion + 1,

      pattern_type:
        question.type,

      sequence:
        question.sequence,

      question:
        question.question,

      rule:
        question.rule,

      answer:
        selected,

      correct:
        isCorrect,

      reaction_time:
        Math.round(reaction),

      timestamp:
        new Date().toISOString(),
    };

    const updatedData = [
      ...sessionDataRef.current,
      response,
    ];

    sessionDataRef.current =
      updatedData;

    setSessionData(
      updatedData
    );

    setSelectedAnswer(
      selected
    );

    setReactionTime(
      Math.round(reaction)
    );

    setAnswerState(
      isCorrect
        ? "correct"
        : "wrong"
    );

    setReactionTimes(
      (previous) => [
        ...previous,
        reaction,
      ]
    );

    if (isCorrect) {
      setCorrectCount(
        (previous) =>
          previous + 1
      );

      setScore(
        (previous) =>
          previous +
          question.difficulty
      );
    } else {
      setWrongCount(
        (previous) =>
          previous + 1
      );
    }

    console.log(
      "Logic Shift response:",
      response
    );
  };

  /* ==========================================
     NEXT QUESTION
  ========================================== */

  const nextQuestion = () => {
    if (
      currentQuestion ===
      QUESTIONS.length - 1
    ) {
      setFinished(true);
      return;
    }

    setCurrentQuestion(
      (previous) =>
        previous + 1
    );
  };

  /* ==========================================
     CONTINUE
  ========================================== */

  const handleContinue = () => {
    const validTimes =
      sessionDataRef.current
        .filter(
          (item) =>
            item.reaction_time !==
            null
        )
        .map(
          (item) =>
            item.reaction_time
        );

    const averageReaction =
      validTimes.length > 0
        ? validTimes.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          validTimes.length
        : 0;

    const accuracy =
      QUESTIONS.length > 0
        ? (correctCount /
            QUESTIONS.length) *
          100
        : 0;

    const finalResult = {
      challenge:
        "logic_shift",

      score,

      total_questions:
        QUESTIONS.length,

      correct:
        correctCount,

      wrong:
        wrongCount,

      accuracy,

      average_reaction_time:
        Math.round(
          averageReaction
        ),

      questions:
        sessionDataRef.current,
    };

    console.log(
      "COMPLETE LOGIC SHIFT SESSION:",
      finalResult
    );

    if (onComplete) {
      onComplete(
        finalResult
      );
    }
  };

  /* ==========================================
     FINAL RESULT
  ========================================== */

  if (finished) {
    const validTimes =
      reactionTimes;

    const averageReaction =
      validTimes.length > 0
        ? validTimes.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          validTimes.length
        : 0;

    const accuracy =
      QUESTIONS.length > 0
        ? (correctCount /
            QUESTIONS.length) *
          100
        : 0;

    return (
      <div
        style={{
          minHeight: "560px",
          padding: "38px",
          color: COLORS.text,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: COLORS.accent,
            fontSize: "10px",
            fontWeight: "900",
            letterSpacing: "0.18em",
          }}
        >
          ROUND 03 COMPLETE
        </div>

        <h1
          style={{
            margin:
              "14px 0 0",
            fontSize:
              "clamp(40px, 6vw, 64px)",
            lineHeight: "0.95",
            letterSpacing:
              "-0.055em",
            fontWeight: "950",
          }}
        >
          You found the pattern.
        </h1>

        <p
          style={{
            maxWidth: "560px",
            marginTop: "15px",
            color: COLORS.muted,
            fontSize: "13px",
            lineHeight: "1.65",
          }}
        >
          Five different reasoning
          patterns tested how quickly
          you could discover the rule.
        </p>

        {/* SCORE */}

        <div
          style={{
            marginTop: "28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize:
                "clamp(68px, 11vw, 105px)",
              lineHeight: "0.9",
              fontWeight: "950",
              letterSpacing:
                "-0.07em",
            }}
          >
            {score}
          </div>

          <div
            style={{
              marginTop: "8px",
              color:
                COLORS.muted,
              fontSize: "9px",
              fontWeight: "900",
              letterSpacing:
                "0.18em",
            }}
          >
            TOTAL POINTS
          </div>
        </div>

        {/* STATS */}

        <div
          style={{
            width: "100%",
            maxWidth: "680px",
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "10px",
            marginTop: "30px",
          }}
        >
          <ResultBox
            label="ACCURACY"
            value={`${Math.round(
              accuracy
            )}%`}
          />

          <ResultBox
            label="CORRECT"
            value={correctCount}
          />

          <ResultBox
            label="WRONG"
            value={wrongCount}
          />

          <ResultBox
            label="AVG REACTION"
            value={`${Math.round(
              averageReaction
            )} ms`}
          />
        </div>

        {/* PATTERN TYPES */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent:
              "center",
            gap: "8px",
            marginTop: "22px",
          }}
        >
          {QUESTIONS.map(
            (item) => (
              <div
                key={item.type}
                style={{
                  padding:
                    "7px 10px",
                  border:
                    `1px solid ${COLORS.border}`,
                  borderRadius:
                    "999px",
                  background:
                    "rgba(255,255,255,0.025)",
                  color:
                    COLORS.muted,
                  fontSize:
                    "8px",
                  fontWeight:
                    "800",
                  letterSpacing:
                    "0.08em",
                }}
              >
                {item.type}
              </div>
            )
          )}
        </div>

        {/* MESSAGE */}

        <div
          style={{
            maxWidth: "560px",
            marginTop: "22px",
            padding:
              "14px 17px",
            border:
              `1px solid ${COLORS.border}`,
            borderRadius:
              "14px",
            background:
              "rgba(255,255,255,0.025)",
            color:
              COLORS.muted,
            fontSize:
              "12px",
            lineHeight:
              "1.6",
          }}
        >
          {accuracy >= 80
            ? "Strong pattern recognition. You adapted quickly when the rules became less obvious."
            : accuracy >= 60
            ? "Good reasoning. The hidden-rule questions added some friction."
            : "The obvious patterns were easy. The hidden rules were a different story."}
        </div>

        <button
          onClick={
            handleContinue
          }
          style={{
            marginTop: "24px",
            padding:
              "14px 23px",
            border: "none",
            borderRadius:
              "13px",
            background:
              "linear-gradient(135deg, #9d91ff, #725fff)",
            color: "white",
            fontSize:
              "11px",
            fontWeight:
              "900",
            letterSpacing:
              "0.09em",
            cursor:
              "pointer",
            boxShadow:
              "0 14px 30px rgba(114,95,255,0.25)",
          }}
        >
          CONTINUE TO ROUND 04 →
        </button>
      </div>
    );
  }

  /* ==========================================
     MAIN GAME UI
  ========================================== */

  const progress =
    ((currentQuestion + 1) /
      QUESTIONS.length) *
    100;

  return (
    <div
      style={{
        padding: "32px",
        color: COLORS.text,
      }}
    >
      {/* TOP */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
        }}
      >
        <div>
          <div
            style={{
              color:
                COLORS.muted,
              fontSize:
                "9px",
              fontWeight:
                "900",
              letterSpacing:
                "0.18em",
            }}
          >
            ROUND 03
          </div>

          <div
            style={{
              marginTop:
                "5px",
              fontSize:
                "20px",
              fontWeight:
                "900",
              letterSpacing:
                "0.03em",
            }}
          >
            LOGIC SHIFT
          </div>
        </div>

        <div
          style={{
            color:
              COLORS.muted,
            fontSize:
              "11px",
            fontWeight:
              "800",
            letterSpacing:
              "0.1em",
          }}
        >
          {String(
            currentQuestion + 1
          ).padStart(
            2,
            "0"
          )}{" "}
          /{" "}
          {String(
            QUESTIONS.length
          ).padStart(
            2,
            "0"
          )}
        </div>
      </div>

      {/* PROGRESS */}

      <div
        style={{
          width: "100%",
          height: "4px",
          marginTop:
            "18px",
          borderRadius:
            "999px",
          overflow:
            "hidden",
          background:
            "rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius:
              "999px",
            background:
              "linear-gradient(90deg, #7565ff, #aaa0ff)",
            transition:
              "width 0.3s ease",
          }}
        />
      </div>

      {/* TYPE + TIMER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          marginTop:
            "20px",
        }}
      >
        <div
          style={{
            display:
              "inline-flex",
            padding:
              "8px 11px",
            border:
              `1px solid ${COLORS.border}`,
            borderRadius:
              "999px",
            background:
              COLORS.accentSoft,
            color:
              COLORS.accent,
            fontSize:
              "9px",
            fontWeight:
              "900",
            letterSpacing:
              "0.11em",
          }}
        >
          {question.type}
        </div>

        <div
          style={{
            color:
              COLORS.muted,
            fontSize:
              "12px",
            fontWeight:
              "800",
            fontVariantNumeric:
              "tabular-nums",
          }}
        >
          {(liveTime / 1000).toFixed(
            2
          )}
          s
        </div>
      </div>

      {/* HEADING */}

      <div
        style={{
          textAlign:
            "center",
          marginTop:
            "32px",
        }}
      >
        <div
          style={{
            color:
              COLORS.muted,
            fontSize:
              "9px",
            fontWeight:
              "900",
            letterSpacing:
              "0.14em",
          }}
        >
          FIND THE RULE
        </div>

        <h1
          style={{
            margin:
              "12px 0 0",
            fontSize:
              "clamp(28px, 5vw, 45px)",
            lineHeight:
              "1",
            letterSpacing:
              "-0.05em",
            fontWeight:
              "950",
          }}
        >
          {question.question}
        </h1>
      </div>

      {/* SEQUENCE */}

      <div
        style={{
          marginTop:
            "34px",
          display:
            "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          gap:
            "10px",
          flexWrap:
            "wrap",
        }}
      >
        {question.sequence.map(
          (item, index) => {
            const isQuestion =
              item === "?";

            return (
              <div
                key={`${item}-${index}`}
                style={{
                  width:
                    "74px",
                  height:
                    "74px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  border:
                    isQuestion
                      ? `1px dashed ${COLORS.borderStrong}`
                      : `1px solid ${COLORS.border}`,
                  borderRadius:
                    "17px",
                  background:
                    isQuestion
                      ? COLORS.accentSoft
                      : COLORS.card,
                  color:
                    isQuestion
                      ? COLORS.accent
                      : COLORS.text,
                  fontSize:
                    "28px",
                  fontWeight:
                    "900",
                  boxShadow:
                    isQuestion
                      ? "0 0 28px rgba(139,124,255,0.08)"
                      : "none",
                }}
              >
                {item}
              </div>
            );
          }
        )}
      </div>

      {/* OPTIONS */}

      <div
        style={{
          width:
            "min(500px, 100%)",
          margin:
            "30px auto 0",
          display:
            "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap:
            "12px",
        }}
      >
        {question.options.map(
          (option, index) => {
            const isSelected =
              selectedAnswer ===
              option;

            const isCorrect =
              option ===
              question.correctAnswer;

            let borderColor =
              COLORS.border;

            let backgroundColor =
              "rgba(255,255,255,0.025)";

            if (
              isSelected &&
              answerState ===
                "correct"
            ) {
              borderColor =
                "rgba(53,208,127,0.65)";

              backgroundColor =
                COLORS.successSoft;
            }

            if (
              isSelected &&
              answerState ===
                "wrong"
            ) {
              borderColor =
                "rgba(255,96,125,0.65)";

              backgroundColor =
                COLORS.dangerSoft;
            }

            return (
              <button
                key={option}
                onClick={() =>
                  handleAnswer(
                    option
                  )
                }
                disabled={
                  selectedAnswer !==
                  null
                }
                style={{
                  minHeight:
                    "66px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "13px",
                  padding:
                    "14px 16px",
                  border:
                    `1px solid ${borderColor}`,
                  borderRadius:
                    "15px",
                  background:
                    backgroundColor,
                  color:
                    COLORS.text,
                  cursor:
                    selectedAnswer ===
                    null
                      ? "pointer"
                      : "default",
                  transition:
                    "0.18s ease",
                }}
              >
                <span
                  style={{
                    color:
                      COLORS.muted,
                    fontSize:
                      "9px",
                    fontWeight:
                      "900",
                  }}
                >
                  0{index + 1}
                </span>

                <span
                  style={{
                    fontSize:
                      "22px",
                    fontWeight:
                      "850",
                  }}
                >
                  {option}
                </span>

                {selectedAnswer !==
                  null &&
                  isCorrect && (
                    <span
                      style={{
                        marginLeft:
                          "auto",
                        color:
                          COLORS.success,
                        fontSize:
                          "14px",
                      }}
                    >
                      ✓
                    </span>
                  )}
              </button>
            );
          }
        )}
      </div>

      {/* ANSWER FEEDBACK */}

      {answerState && (
        <div
          style={{
            margin:
              "22px auto 0",
            maxWidth:
              "500px",
            padding:
              "15px 17px",
            border:
              `1px solid ${
                answerState ===
                "correct"
                  ? "rgba(53,208,127,0.25)"
                  : "rgba(255,96,125,0.25)"
              }`,
            borderRadius:
              "14px",
            background:
              answerState ===
              "correct"
                ? COLORS.successSoft
                : COLORS.dangerSoft,
            textAlign:
              "center",
          }}
        >
          <div
            style={{
              color:
                answerState ===
                "correct"
                  ? COLORS.success
                  : COLORS.danger,
              fontSize:
                "11px",
              fontWeight:
                "900",
              letterSpacing:
                "0.09em",
            }}
          >
            {answerState ===
            "correct"
              ? "✓ CORRECT"
              : `✕ WRONG — ${question.correctAnswer} WAS CORRECT`}
          </div>

          <div
            style={{
              marginTop:
                "7px",
              color:
                COLORS.muted,
              fontSize:
                "11px",
            }}
          >
            Reaction:{" "}
            {reactionTime} ms
          </div>

          <div
            style={{
              marginTop:
                "10px",
              color:
                COLORS.muted,
              fontSize:
                "11px",
              lineHeight:
                "1.5",
            }}
          >
            Rule:{" "}
            <span
              style={{
                color:
                  "#c7c4df",
              }}
            >
              {question.rule}
            </span>
          </div>

          <button
            onClick={
              nextQuestion
            }
            style={{
              marginTop:
                "15px",
              padding:
                "11px 17px",
              border:
                `1px solid ${COLORS.border}`,
              borderRadius:
                "11px",
              background:
                COLORS.cardLight,
              color:
                COLORS.text,
              fontSize:
                "10px",
              fontWeight:
                "850",
              letterSpacing:
                "0.08em",
              cursor:
                "pointer",
            }}
          >
            {currentQuestion ===
            QUESTIONS.length -
              1
              ? "VIEW RESULT →"
              : "NEXT PATTERN →"}
          </button>
        </div>
      )}

      {/* BOTTOM STATS */}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "center",
          gap:
            "22px",
          flexWrap:
            "wrap",
          marginTop:
            "25px",
          color:
            COLORS.muted,
          fontSize:
            "9px",
          fontWeight:
            "850",
          letterSpacing:
            "0.1em",
        }}
      >
        <span>
          SCORE{" "}
          <strong
            style={{
              color:
                COLORS.text,
            }}
          >
            {score}
          </strong>
        </span>

        <span>
          CORRECT{" "}
          <strong
            style={{
              color:
                COLORS.text,
            }}
          >
            {correctCount}
          </strong>
        </span>

        <span>
          WRONG{" "}
          <strong
            style={{
              color:
                COLORS.text,
            }}
          >
            {wrongCount}
          </strong>
        </span>
      </div>
    </div>
  );
}

/* ==========================================
   RESULT BOX
========================================== */

function ResultBox({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding:
          "16px 12px",
        border:
          "1px solid rgba(255,255,255,0.09)",
        borderRadius:
          "15px",
        background:
          "rgba(255,255,255,0.025)",
      }}
    >
      <span
        style={{
          display:
            "block",
          color:
            "#687084",
          fontSize:
            "8px",
          fontWeight:
            "900",
          letterSpacing:
            "0.09em",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          display:
            "block",
          marginTop:
            "7px",
          color:
            "#f1f2f7",
          fontSize:
            "18px",
          fontWeight:
            "900",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

export default Pattern;