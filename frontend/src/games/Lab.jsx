import { useEffect, useMemo, useState } from "react";
import "./Lab.css";

const INITIAL_TIME = 8 * 60;

const CLUES = [
  {
    id: "server",
    title: "SERVER LOGS",
    icon: "▣",
    short: "System activity",
    detail:
      "Authentication requests suddenly increased 4× at 10:42 AM. The server itself is still online.",
    signal: "HIGH",
  },
  {
    id: "network",
    title: "NETWORK STATUS",
    icon: "⌁",
    short: "Connectivity",
    detail:
      "Campus network latency is elevated, but core connectivity is still available.",
    signal: "MEDIUM",
  },
  {
    id: "update",
    title: "RECENT UPDATE",
    icon: "↻",
    short: "Last system change",
    detail:
      "A new authentication update was deployed 18 minutes before the outage began.",
    signal: "HIGH",
  },
  {
    id: "reports",
    title: "USER REPORTS",
    icon: "◌",
    short: "What users are seeing",
    detail:
      "Most users report successful page loading followed by login failure.",
    signal: "HIGH",
  },
  {
    id: "load",
    title: "SYSTEM LOAD",
    icon: "△",
    short: "Current load",
    detail:
      "CPU and memory usage are within normal range. The system does not appear overloaded.",
    signal: "LOW",
  },
];

const ACTIONS = [
  {
    id: "logs",
    title: "Review authentication logs",
    reason: "Identify the failure pattern.",
  },
  {
    id: "network-test",
    title: "Run network test",
    reason: "Verify connectivity before changing services.",
  },
  {
    id: "auth",
    title: "Check authentication service",
    reason: "Investigate the most likely failure point.",
  },
  {
    id: "workaround",
    title: "Enable temporary login workaround",
    reason: "Restore access while the root cause is investigated.",
  },
  {
    id: "rollback",
    title: "Rollback recent authentication update",
    reason: "Reverse the most recent relevant change.",
  },
  {
    id: "test",
    title: "Test with a small user group",
    reason: "Validate the fix before wider recovery.",
  },
  {
    id: "notify",
    title: "Notify affected users",
    reason: "Reduce confusion while recovery is underway.",
  },
  {
    id: "monitor",
    title: "Monitor the system",
    reason: "Confirm that the recovery remains stable.",
  },
];

const NEW_INFORMATION = {
  title: "THE SITUATION JUST CHANGED.",
  body:
    "Rollback is unavailable for the next 5 minutes. Your current plan needs another route to restore access.",
};

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remaining
  ).padStart(2, "0")}`;
}

function signalClass(signal) {
  if (signal === "HIGH") return "high";
  if (signal === "MEDIUM") return "medium";
  return "low";
}

function Lab({ onComplete }) {
  const [phase, setPhase] = useState("briefing");

  const [timeLeft, setTimeLeft] =
    useState(INITIAL_TIME);

  const [inspectedClues, setInspectedClues] =
    useState([]);

  const [selectedClue, setSelectedClue] =
    useState(null);

  const [selectedActions, setSelectedActions] =
    useState([]);

  const [finalPlan, setFinalPlan] =
    useState([]);

  const [revisionCount, setRevisionCount] =
    useState(0);

  const [hasAdapted, setHasAdapted] =
    useState(false);

  const [startedAt, setStartedAt] =
    useState(null);

  const [completedAt, setCompletedAt] =
    useState(null);

  const [submitted, setSubmitted] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState("");

  /* =========================================
     GLOBAL TIMER
  ========================================= */

  useEffect(() => {
    if (
      phase === "briefing" ||
      phase === "complete"
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);

          if (phase !== "complete") {
            setPhase("review");
            setStatusMessage(
              "Time is up. Submit the strongest plan you have."
            );
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  /* =========================================
     START
  ========================================= */

  const startRound = () => {
    setStartedAt(Date.now());
    setPhase("investigate");
  };

  /* =========================================
     INVESTIGATE
  ========================================= */

  const inspectClue = (clue) => {
    if (!inspectedClues.includes(clue.id)) {
      setInspectedClues(
        (previous) => [
          ...previous,
          clue.id,
        ]
      );
    }

    setSelectedClue(clue.id);
  };

  const moveToBuild = () => {
    if (inspectedClues.length < 2) {
      setStatusMessage(
        "Investigate at least two clues before building a plan."
      );
      return;
    }

    setStatusMessage("");
    setPhase("build");
  };

  /* =========================================
     BUILD
  ========================================= */

  const toggleAction = (actionId) => {
    setSelectedActions((previous) => {
      if (previous.includes(actionId)) {
        return previous.filter(
          (id) => id !== actionId
        );
      }

      return [...previous, actionId];
    });
  };

  const moveAction = (
    index,
    direction
  ) => {
    const newActions = [
      ...selectedActions,
    ];

    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= newActions.length
    ) {
      return;
    }

    [
      newActions[index],
      newActions[targetIndex],
    ] = [
      newActions[targetIndex],
      newActions[index],
    ];

    setSelectedActions(newActions);

    setRevisionCount(
      (previous) => previous + 1
    );
  };

  /* =========================================
     CONTINUE FROM BUILD
     
     FIRST TIME:
       → ADAPT

     AFTER ADAPTATION:
       → FINAL REVIEW
  ========================================= */

  const continueFromBuild = () => {
    if (selectedActions.length < 3) {
      setStatusMessage(
        "Build at least three actions before continuing."
      );
      return;
    }

    setStatusMessage("");

    if (!hasAdapted) {
      setPhase("adapt");
      setRevisionCount(
        (previous) => previous + 1
      );
    } else {
      setPhase("review");
    }
  };

  /* =========================================
     ADAPT
  ========================================= */

  const revisePlan = () => {
    setShowNewInfoIfNeeded();

    setSelectedActions(
      (previous) =>
        previous.filter(
          (id) => id !== "rollback"
        )
    );

    setHasAdapted(true);

    setRevisionCount(
      (previous) => previous + 1
    );

    setStatusMessage(
      "Rollback removed. Rebuild your recovery sequence."
    );

    setPhase("build");
  };

  const setShowNewInfoIfNeeded = () => {
    // Kept as a separate function so the
    // adaptation event remains explicit.
  };

  /* =========================================
     FINAL SUBMIT
  ========================================= */

  const submitPlan = () => {
    if (selectedActions.length < 3) {
      setStatusMessage(
        "Your final plan needs at least three actions."
      );
      return;
    }

    const completed =
      Date.now();

    setCompletedAt(
      completed
    );

    setFinalPlan(
      [...selectedActions]
    );

    setSubmitted(true);
    setStatusMessage("");
    setPhase("complete");
  };

  /* =========================================
     RESULT CALCULATIONS
  ========================================= */

  const resultData = useMemo(() => {
    const totalSeconds =
      startedAt && completedAt
        ? Math.round(
            (completedAt -
              startedAt) /
              1000
          )
        : INITIAL_TIME -
          timeLeft;

    const investigationEfficiency =
      Math.round(
        (inspectedClues.length /
          CLUES.length) *
          100
      );

    const planningScore =
      Math.min(
        100,
        selectedActions.length *
          11
      );

    return {
      totalSeconds,
      investigationEfficiency,
      planningScore,
      revisions: revisionCount,
      clues: inspectedClues,
      actions: finalPlan,
    };
  }, [
    startedAt,
    completedAt,
    timeLeft,
    inspectedClues,
    selectedActions,
    finalPlan,
    revisionCount,
  ]);

  const finishRound = () => {
    if (!onComplete) {
      return;
    }

    onComplete({
      challenge: "the_lab",

      phase:
        "investigate_build_adapt",

      time_limit_seconds:
        INITIAL_TIME,

      time_used_seconds:
        resultData.totalSeconds,

      clues_inspected:
        resultData.clues,

      clues_inspected_count:
        resultData.clues.length,

      investigation_efficiency:
        resultData.investigationEfficiency,

      selected_actions:
        resultData.actions,

      selected_action_count:
        resultData.actions.length,

      plan_revisions:
        resultData.revisions,

      adaptation_required:
        true,

      adapted:
        hasAdapted,

      final_plan:
        resultData.actions,

      completed:
        submitted,

      timestamp:
        new Date().toISOString(),
    });
  };

  /* =========================================
     BRIEFING
  ========================================= */

  if (phase === "briefing") {
    return (
      <div className="lab-shell">
        <div className="lab-card lab-briefing">

          <div className="lab-eyebrow">
            ROUND 04 // THE LAB
          </div>

          <h1 className="lab-title">
            INVESTIGATE.
            <br />
            BUILD. ADAPT.
          </h1>

          <p className="lab-description">
            A system has failed.
            You have eight minutes to
            investigate what happened,
            build a recovery plan,
            and adapt when the situation
            changes.
          </p>

          <div className="lab-objectives">

            <div>
              <span>01</span>

              <strong>
                INVESTIGATE
              </strong>

              <small>
                Decide what information
                matters first.
              </small>
            </div>

            <div>
              <span>02</span>

              <strong>
                BUILD
              </strong>

              <small>
                Construct a recovery sequence.
              </small>
            </div>

            <div>
              <span>03</span>

              <strong>
                ADAPT
              </strong>

              <small>
                React when a key assumption changes.
              </small>
            </div>

          </div>

          <div className="lab-warning">
            You are not given every answer.
            Decide what to investigate.
          </div>

          <button
            className="lab-primary"
            onClick={startRound}
          >
            ENTER THE LAB →
          </button>

        </div>
      </div>
    );
  }

  /* =========================================
     COMPLETE
  ========================================= */

  if (phase === "complete") {
    return (
      <div className="lab-shell">
        <div className="lab-card lab-result">

          <div className="lab-eyebrow">
            ROUND 04 COMPLETE
          </div>

          <h1 className="lab-result-title">
            Problem solved.
          </h1>

          <p className="lab-description">
            You investigated the situation,
            built a response, and adapted
            after the constraint changed.
          </p>

          <div className="lab-result-grid">

            <div className="lab-result-box">
              <span>TIME USED</span>

              <strong>
                {formatTime(
                  resultData.totalSeconds
                )}
              </strong>
            </div>

            <div className="lab-result-box">
              <span>CLUES CHECKED</span>

              <strong>
                {resultData.clues.length}/
                {CLUES.length}
              </strong>
            </div>

            <div className="lab-result-box">
              <span>PLAN REVISIONS</span>

              <strong>
                {resultData.revisions}
              </strong>
            </div>

            <div className="lab-result-box">
              <span>ACTIONS</span>

              <strong>
                {resultData.actions.length}
              </strong>
            </div>

          </div>

          <div className="lab-observation">

            <span>
              OBSERVATION
            </span>

            <p>
              {hasAdapted
                ? "You revised your plan after the situation changed."
                : "You committed without completing the adaptation phase."}
            </p>

          </div>

          <button
            className="lab-primary"
            onClick={finishRound}
          >
            CONTINUE TO ROUND 05 →
          </button>

        </div>
      </div>
    );
  }

  /* =========================================
     MAIN LAB
  ========================================= */

  const phaseNumber =
    phase === "investigate"
      ? "01"
      : phase === "build"
      ? "02"
      : phase === "adapt"
      ? "03"
      : "04";

  return (
    <div className="lab-shell">
      <div className="lab-card lab-main">

        {/* TOP BAR */}

        <div className="lab-topbar">

          <div>
            <div className="lab-mini-label">
              ROUND 04
            </div>

            <div className="lab-name">
              THE LAB
            </div>
          </div>

          <div
            className={`lab-timer ${
              timeLeft <= 60
                ? "lab-timer-danger"
                : ""
            }`}
          >
            {formatTime(timeLeft)}
          </div>

        </div>

        {/* PROGRESS */}

        <div className="lab-progress">
          <div
            className="lab-progress-fill"
            style={{
              width: `${
                (timeLeft /
                  INITIAL_TIME) *
                100
              }%`,
            }}
          />
        </div>

        {/* PHASE */}

        <div className="lab-phase-row">

          <div>
            PHASE {phaseNumber}
          </div>

          <div>

            {phase === "investigate" &&
              "INVESTIGATE"}

            {phase === "build" &&
              "BUILD"}

            {phase === "adapt" &&
              "ADAPT"}

            {phase === "review" &&
              "FINAL REVIEW"}

          </div>

        </div>

        {/* =====================================
            INVESTIGATE
        ===================================== */}

        {phase === "investigate" && (
          <>
            <div className="lab-section-heading">

              <span>
                THE INCIDENT
              </span>

              <h1>
                Something is wrong
                with the campus system.
              </h1>

              <p>
                You don't know the cause.
                Choose what to inspect.
              </p>

            </div>

            <div className="lab-clue-grid">

              {CLUES.map((clue) => {

                const inspected =
                  inspectedClues.includes(
                    clue.id
                  );

                const selected =
                  selectedClue ===
                  clue.id;

                return (
                  <button
                    key={clue.id}
                    className={`lab-clue ${
                      selected
                        ? "lab-clue-selected"
                        : ""
                    } ${
                      inspected
                        ? "lab-clue-inspected"
                        : ""
                    }`}
                    onClick={() =>
                      inspectClue(
                        clue
                      )
                    }
                  >

                    <div className="lab-clue-top">

                      <span className="lab-clue-icon">
                        {clue.icon}
                      </span>

                      <span
                        className={`lab-signal ${signalClass(
                          clue.signal
                        )}`}
                      >
                        {clue.signal}
                      </span>

                    </div>

                    <strong>
                      {clue.title}
                    </strong>

                    <small>
                      {clue.short}
                    </small>

                    {selected && (
                      <p>
                        {clue.detail}
                      </p>
                    )}

                    {inspected && (
                      <em>
                        INSPECTED
                      </em>
                    )}

                  </button>
                );
              })}

            </div>

            <div className="lab-bottom-row">

              <div className="lab-count">
                {inspectedClues.length}
                {" "}
                / {CLUES.length} clues inspected
              </div>

              <button
                className="lab-primary"
                onClick={moveToBuild}
              >
                BUILD PLAN →
              </button>

            </div>

            {statusMessage && (
              <div className="lab-status">
                {statusMessage}
              </div>
            )}

          </>
        )}

        {/* =====================================
            BUILD
        ===================================== */}

        {phase === "build" && (
          <>
            <div className="lab-section-heading">

              <span>
                BUILD YOUR RESPONSE
              </span>

              <h1>
                What would you do first?
              </h1>

              <p>
                Select the actions you believe
                belong in your recovery plan.
                Then order them.
              </p>

              {hasAdapted && (
                <p>
                  The situation changed.
                  This is your revised plan.
                </p>
              )}

            </div>

            <div className="lab-build-layout">

              <div className="lab-action-library">

                <div className="lab-column-label">
                  AVAILABLE ACTIONS
                </div>

                <div className="lab-action-list">

                  {ACTIONS.map((action) => {

                    const active =
                      selectedActions.includes(
                        action.id
                      );

                    const unavailableAfterAdapt =
                      hasAdapted &&
                      action.id ===
                        "rollback";

                    if (
                      unavailableAfterAdapt
                    ) {
                      return null;
                    }

                    return (
                      <button
                        key={action.id}
                        className={`lab-action ${
                          active
                            ? "lab-action-active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleAction(
                            action.id
                          )
                        }
                      >

                        <span>
                          {active
                            ? "✓"
                            : "+"}
                        </span>

                        <div>
                          <strong>
                            {action.title}
                          </strong>

                          <small>
                            {action.reason}
                          </small>
                        </div>

                      </button>
                    );
                  })}

                </div>

              </div>

              <div className="lab-plan">

                <div className="lab-column-label">
                  YOUR PLAN
                </div>

                {selectedActions.length ===
                0 ? (
                  <div className="lab-empty-plan">
                    Select actions from the left
                    to build your sequence.
                  </div>
                ) : (
                  <div className="lab-selected-list">

                    {selectedActions.map(
                      (
                        actionId,
                        index
                      ) => {

                        const action =
                          ACTIONS.find(
                            (item) =>
                              item.id ===
                              actionId
                          );

                        return (
                          <div
                            className="lab-selected-action"
                            key={actionId}
                          >

                            <span className="lab-order">
                              0{index + 1}
                            </span>

                            <div>
                              <strong>
                                {action.title}
                              </strong>

                              <small>
                                {action.reason}
                              </small>
                            </div>

                            <div className="lab-move-buttons">

                              <button
                                onClick={() =>
                                  moveAction(
                                    index,
                                    "up"
                                  )
                                }
                              >
                                ↑
                              </button>

                              <button
                                onClick={() =>
                                  moveAction(
                                    index,
                                    "down"
                                  )
                                }
                              >
                                ↓
                              </button>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

            </div>

            {statusMessage && (
              <div className="lab-status">
                {statusMessage}
              </div>
            )}

            <div className="lab-bottom-row">

              <div className="lab-count">
                {selectedActions.length}
                {" "}
                actions selected
              </div>

              <button
                className="lab-primary"
                onClick={
                  continueFromBuild
                }
              >
                {hasAdapted
                  ? "FINALIZE PLAN →"
                  : "CONTINUE →"}
              </button>

            </div>

          </>
        )}

        {/* =====================================
            ADAPT
        ===================================== */}

        {phase === "adapt" && (
          <>
            <div className="lab-alert">

              <span>
                ⚠ NEW INFORMATION
              </span>

              <h1>
                {NEW_INFORMATION.title}
              </h1>

              <p>
                {NEW_INFORMATION.body}
              </p>

            </div>

            <div className="lab-current-plan">

              <div className="lab-column-label">
                YOUR CURRENT PLAN
              </div>

              {selectedActions.map(
                (actionId, index) => {

                  const action =
                    ACTIONS.find(
                      (item) =>
                        item.id ===
                        actionId
                    );

                  return (
                    <div
                      key={actionId}
                      className="lab-current-item"
                    >
                      <span>
                        0{index + 1}
                      </span>

                      <strong>
                        {action?.title}
                      </strong>
                    </div>
                  );
                }
              )}

            </div>

            <div className="lab-adapt-message">
              One assumption is no longer
              available. Your response needs
              to change.
            </div>

            <button
              className="lab-primary"
              onClick={
                revisePlan
              }
            >
              REVISE MY PLAN →
            </button>
          </>
        )}

        {/* =====================================
            FINAL REVIEW
        ===================================== */}

        {phase === "review" && (
          <>
            <div className="lab-section-heading">

              <span>
                FINAL REVIEW
              </span>

              <h1>
                Commit to your strongest plan.
              </h1>

              <p>
                The investigation is over.
                The situation has changed.
                Now make the call.
              </p>

            </div>

            <div className="lab-review-list">

              {selectedActions.map(
                (actionId, index) => {

                  const action =
                    ACTIONS.find(
                      (item) =>
                        item.id ===
                        actionId
                    );

                  return (
                    <div
                      key={actionId}
                      className="lab-review-item"
                    >

                      <span>
                        0{index + 1}
                      </span>

                      <strong>
                        {action?.title}
                      </strong>

                    </div>
                  );
                }
              )}

            </div>

            {statusMessage && (
              <div className="lab-status">
                {statusMessage}
              </div>
            )}

            <button
              className="lab-primary"
              onClick={submitPlan}
            >
              SUBMIT FINAL PLAN →
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default Lab;