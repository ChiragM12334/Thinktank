import { useMemo, useState } from "react";
import "./Trust.css";
import "./TrustVisuals.css";

const AGENTS = [
  {
    id: "alex",
    name: "ALEX",
    role: "OPERATIONS",
    avatar: "A",
    image: "/assets/trust/alex.png",
    color: "#8f83ff",
  },
  {
    id: "maya",
    name: "MAYA",
    role: "FINANCE",
    avatar: "M",
    image: "/assets/trust/maya.png",
    color: "#63b3ff",
  },
  {
    id: "noah",
    name: "NOAH",
    role: "ENGINEERING",
    avatar: "N",
    image: "/assets/trust/noah.png",
    color: "#35d07f",
  },
  {
    id: "riley",
    name: "RILEY",
    role: "SECURITY",
    avatar: "R",
    image: "/assets/trust/riley.png",
    color: "#ff6d87",
  },
  {
    id: "zane",
    name: "ZANE",
    role: "PRODUCT",
    avatar: "Z",
    image: "/assets/trust/zane.png",
    color: "#ffd84d",
  },
];

const STATEMENTS = [
  {
    agent: "alex",
    text: "I was in the operations room when the alert appeared.",
  },
  {
    agent: "maya",
    text: "Alex wasn't in the operations room. I was there.",
  },
  {
    agent: "noah",
    text: "The system alert was already active before I opened the dashboard.",
  },
  {
    agent: "riley",
    text: "I checked the security feed. One access event doesn't match the others.",
  },
  {
    agent: "zane",
    text: "I didn't touch the system after the alert started.",
  },
];

const CLUES = [
  {
    id: "timeline",
    title: "CHECK TIMELINE",
    icon: "◷",
    detail:
      "The access event occurred at 10:41. The first system alert appeared at 10:43.",
  },
  {
    id: "access",
    title: "CHECK ACCESS LOG",
    icon: "⌁",
    detail:
      "Riley's security badge opened the restricted door at 10:40. No other badge was recorded there.",
  },
  {
    id: "dashboard",
    title: "CHECK DASHBOARD",
    icon: "▣",
    detail:
      "No engineering changes were deployed between 10:35 and 10:45.",
  },
  {
    id: "camera",
    title: "CHECK CAMERA",
    icon: "◉",
    detail:
      "The camera shows someone entering the restricted room, but the image is partially obscured.",
  },
];

const HIDDEN_OUTLIER = "zane";

const GROUP_VOTES = {
  alex: "riley",
  maya: "riley",
  noah: "zane",
  riley: "maya",
  zane: "noah",
};

function Trust({ onComplete }) {
  const [phase, setPhase] = useState("briefing");

  const [activeAgent, setActiveAgent] = useState(null);

  const [investigatedClues, setInvestigatedClues] =
    useState([]);

  const [activeClue, setActiveClue] = useState(null);

  const [trustScores, setTrustScores] = useState({
    alex: 50,
    maya: 50,
    noah: 50,
    riley: 50,
    zane: 50,
  });

  const [groupVotesVisible, setGroupVotesVisible] =
    useState(false);

  const [groupVote, setGroupVote] = useState(null);

  const [finalChoice, setFinalChoice] =
    useState(null);

  const [initialChoice, setInitialChoice] =
    useState(null);

  const [initialTrustSnapshot, setInitialTrustSnapshot] =
    useState(null);

  const [decisionTimes, setDecisionTimes] = useState([]);

  const [startedAt, setStartedAt] = useState(null);

  const [decisionStartedAt, setDecisionStartedAt] =
    useState(null);

  const [completedAt, setCompletedAt] = useState(null);

  const [investigationEvents, setInvestigationEvents] =
    useState([]);

  const [revisionCount, setRevisionCount] =
    useState(0);

  /* =========================================
     START
  ========================================= */

  const startRound = () => {
    const now = Date.now();

    setStartedAt(now);
    setDecisionStartedAt(now);
    setPhase("statements");
  };

  /* =========================================
     STATEMENTS
  ========================================= */

  const selectAgent = (agentId) => {
    setActiveAgent(agentId);

    setInvestigationEvents((previous) => [
      ...previous,
      {
        type: "agent_viewed",
        agent: agentId,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const continueToInitial = () => {
    setDecisionStartedAt(Date.now());
    setPhase("initial");
  };

  /* =========================================
     CLUES
  ========================================= */

  const inspectClue = (clue) => {
    setActiveClue(clue.id);

    if (!investigatedClues.includes(clue.id)) {
      setInvestigatedClues((previous) => [
        ...previous,
        clue.id,
      ]);
    }

    setInvestigationEvents((previous) => [
      ...previous,
      {
        type: "clue_inspected",
        clue: clue.id,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const continueToTrust = () => {
    if (investigatedClues.length < 2) {
      return;
    }

    setDecisionStartedAt(Date.now());
    setPhase("trust");
  };

  /* =========================================
     TRUST SLIDERS
  ========================================= */

  const updateTrust = (agentId, value) => {
    setTrustScores((previous) => ({
      ...previous,
      [agentId]: Number(value),
    }));
  };

  const continueToGroup = () => {
    const time =
      Date.now() -
      (decisionStartedAt || Date.now());

    setDecisionTimes((previous) => [
      ...previous,
      time,
    ]);

    setPhase("group");
  };

  /* =========================================
     GROUP
  ========================================= */

  const revealGroup = () => {
    setGroupVotesVisible(true);
  };

  const continueToFinal = () => {
    setDecisionStartedAt(Date.now());
    setPhase("final");
  };

  /* =========================================
     FINAL ACCUSATION
  ========================================= */

  const chooseFinalAgent = (agentId) => {
    if (finalChoice) {
      return;
    }

    const decisionTime =
      Date.now() -
      (decisionStartedAt || Date.now());

    setDecisionTimes((previous) => [
      ...previous,
      decisionTime,
    ]);

    setFinalChoice(agentId);

    if (
      initialChoice &&
      initialChoice !== agentId
    ) {
      setRevisionCount(
        (previous) => previous + 1
      );
    }
  };

  const lockInitialChoice = (agentId) => {
    if (initialChoice) {
      return;
    }

    setInitialChoice(agentId);

    setInitialTrustSnapshot({
      ...trustScores,
    });

    setDecisionStartedAt(Date.now());

    setPhase("investigate");
  };

  const continueAfterFinal = () => {
    const completed =
      Date.now();

    setCompletedAt(completed);
    setPhase("result");
  };

  /* =========================================
     RESULT
  ========================================= */

  const result = useMemo(() => {
    const correct =
      finalChoice ===
      HIDDEN_OUTLIER;

    const totalTime =
      startedAt && completedAt
        ? Math.round(
            (completedAt -
              startedAt) /
              1000
          )
        : 0;

    const averageDecisionTime =
      decisionTimes.length
        ? Math.round(
            decisionTimes.reduce(
              (sum, value) =>
                sum + value,
              0
            ) /
              decisionTimes.length
          )
        : 0;

    const initialTrust =
      initialTrustSnapshot?.[
        HIDDEN_OUTLIER
      ] ?? 50;

    const finalTrust =
      trustScores[HIDDEN_OUTLIER];

    const trustShift =
      finalTrust -
      initialTrust;

    return {
      correct,
      totalTime,
      averageDecisionTime,
      initialTrust,
      finalTrust,
      trustShift,
      revisionCount,
      investigatedClues:
        investigatedClues.length,
      groupVote,
    };
  }, [
    finalChoice,
    startedAt,
    completedAt,
    decisionTimes,
    initialTrustSnapshot,
    trustScores,
    revisionCount,
    investigatedClues,
    groupVote,
  ]);

  const finishRound = () => {
    if (!onComplete) {
      return;
    }

    onComplete({
      challenge: "trust",
      hidden_agent: HIDDEN_OUTLIER,
      initial_suspect: initialChoice,
      final_suspect: finalChoice,
      correct: result.correct,
      clues_inspected:
        investigatedClues,
      clues_inspected_count:
        investigatedClues.length,
      trust_scores_initial:
        initialTrustSnapshot,
      trust_scores_final:
        trustScores,
      trust_shift_on_hidden_agent:
        result.trustShift,
      group_vote:
        groupVote,
      revision_count:
        result.revisionCount,
      decision_times:
        decisionTimes,
      average_decision_time:
        result.averageDecisionTime,
      total_time_seconds:
        result.totalTime,
      investigation_events:
        investigationEvents,
      timestamp:
        new Date().toISOString(),
    });
  };

  /* =========================================
     BRIEFING
  ========================================= */

  if (phase === "briefing") {
    return (
      <div className="trust-shell">
        <div className="trust-card trust-briefing">

          <div className="trust-eyebrow">
            ROUND 05 // TRUST
          </div>

          <h1 className="trust-title">
            SOMEONE IS
            <br />
            HIDING SOMETHING.
          </h1>

          <p className="trust-description">
            Five people. One incident.
            Someone's story doesn't add up.
            Decide who you trust — then find
            out whether your instincts survived
            the evidence.
          </p>

          <div className="trust-rules">

            <div>
              <span>01</span>
              <strong>LISTEN</strong>
              <small>
                Read what everyone says.
              </small>
            </div>

            <div>
              <span>02</span>
              <strong>INVESTIGATE</strong>
              <small>
                Choose which evidence to inspect.
              </small>
            </div>

            <div>
              <span>03</span>
              <strong>TRUST</strong>
              <small>
                Decide who you believe.
              </small>
            </div>

            <div>
              <span>04</span>
              <strong>REVEAL</strong>
              <small>
                Make the final accusation.
              </small>
            </div>

          </div>

          <div className="trust-warning">
            There is no shortcut.
            Evidence can change your mind.
          </div>

          <button
            className="trust-primary"
            onClick={startRound}
          >
            ENTER THE CASE →
          </button>

        </div>
      </div>
    );
  }

  /* =========================================
     STATEMENTS
  ========================================= */

  if (phase === "statements") {
    return (
      <div className="trust-shell">
        <div className="trust-card trust-main">

          <TrustHeader
            phase="01"
            title="THE STATEMENTS"
          />

          <div className="trust-heading">
            <span>EVERYONE HAS A STORY.</span>

            <h1>
              Who do you believe first?
            </h1>

            <p>
              Read each account carefully.
              Then lock your first suspicion before seeing any evidence.
            </p>
          </div>

          <div className="agent-grid">

            {AGENTS.map((agent) => {
              const selected =
                activeAgent === agent.id;

              const statement =
                STATEMENTS.find(
                  (item) =>
                    item.agent ===
                    agent.id
                );

              return (
                <button
                  key={agent.id}
                  className={`agent-card ${
                    selected
                      ? "agent-selected"
                      : ""
                  }`}
                  onClick={() =>
                    selectAgent(
                      agent.id
                    )
                  }
                >

                  <div className="agent-top">

                    <div className="agent-portrait-wrap">
                      <img
                        className="agent-portrait"
                        src={agent.image}
                        alt={`${agent.name} portrait`}
                      />
                    </div>

                    <div
                      className="agent-avatar"
                      style={{
                        borderColor:
                          agent.color,
                        color:
                          agent.color,
                      }}
                    >
                      {agent.avatar}
                    </div>

                    <div className="agent-identity">
                      <strong>
                        {agent.name}
                      </strong>

                      <small>
                        {agent.role}
                      </small>
                    </div>

                  </div>

                  <p>
                    "{statement.text}"
                  </p>

                  {selected && (
                    <div className="agent-focus">
                      SELECTED FOR REVIEW
                    </div>
                  )}

                </button>
              );
            })}

          </div>

          <div className="trust-bottom">
            <span>
              {activeAgent
                ? "Statement selected."
                : "Read every statement before continuing."}
            </span>

            <button
              className="trust-primary"
              onClick={
                continueToInitial
              }
            >
              MAKE YOUR FIRST READ →
            </button>
          </div>

        </div>
      </div>
    );
  }

  /* =========================================
     INITIAL SUSPICION
  ========================================= */

  if (phase === "initial") {
    return (
      <div className="trust-shell">
        <div className="trust-card trust-main trust-initial-phase">
          <TrustHeader
            phase="02"
            title="FIRST READ"
          />

          <div className="trust-heading">
            <span>BEFORE THE EVIDENCE</span>

            <h1>
              Who stands out to you right now?
            </h1>

            <p>
              Choose one person using only the statements you just heard.
              This is your starting point — you can change your mind later.
            </p>
          </div>

          <div className="initial-choice-grid">
            {AGENTS.map((agent) => {
              const selected = initialChoice === agent.id;

              return (
                <button
                  key={agent.id}
                  className={`initial-choice-card ${
                    selected ? "initial-choice-selected" : ""
                  }`}
                  onClick={() => lockInitialChoice(agent.id)}
                >
                  <div className="initial-choice-image">
                    <img
                      src={agent.image}
                      alt={`${agent.name} portrait`}
                    />
                  </div>

                  <div className="initial-choice-info">
                    <strong>{agent.name}</strong>
                    <small>{agent.role}</small>
                  </div>

                  <span className="initial-choice-action">
                    {selected ? "SELECTED" : "SELECT"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="trust-note trust-initial-note">
            Your first read becomes the baseline for the rest of the case.
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     INVESTIGATION
  ========================================= */

  if (phase === "investigate") {
    return (
      <div className="trust-shell">
        <div className="trust-card trust-main">

          <TrustHeader
            phase="03"
            title="INVESTIGATION"
          />

          <div className="trust-heading">
            <span>
              LIMITED EVIDENCE
            </span>

            <h1>
              What do you want to check?
            </h1>

            <p>
              You can inspect as much as
              you want, but every investigation
              changes what you know.
            </p>
          </div>

          <div className="clue-grid">

            {CLUES.map((clue) => {
              const inspected =
                investigatedClues.includes(
                  clue.id
                );

              const selected =
                activeClue === clue.id;

              return (
                <button
                  key={clue.id}
                  className={`clue-card ${
                    selected
                      ? "clue-selected"
                      : ""
                  } ${
                    inspected
                      ? "clue-inspected"
                      : ""
                  }`}
                  onClick={() =>
                    inspectClue(clue)
                  }
                >

                  <div className="clue-icon">
                    {clue.icon}
                  </div>

                  <strong>
                    {clue.title}
                  </strong>

                  {selected && (
                    <p>
                      {clue.detail}
                    </p>
                  )}

                  {inspected && (
                    <span>
                      INSPECTED
                    </span>
                  )}

                </button>
              );
            })}

          </div>

          <div className="trust-bottom">

            <span>
              {investigatedClues.length}{" "}
              evidence sources reviewed
            </span>

            <button
              className="trust-primary"
              onClick={
                continueToTrust
              }
            >
              ASSIGN TRUST →
            </button>

          </div>

        </div>
      </div>
    );
  }

  /* =========================================
     TRUST
  ========================================= */

  if (phase === "trust") {
    return (
      <div className="trust-shell">
        <div className="trust-card trust-main">

          <TrustHeader
            phase="04"
            title="TRUST MAP"
          />

          <div className="trust-heading">
            <span>
              YOUR CURRENT BELIEF
            </span>

            <h1>
              Who feels trustworthy?
            </h1>

            <p>
              Give each person a trust level.
              0 means no trust. 100 means
              complete trust.
            </p>
          </div>

          <div className="trust-map">

            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="trust-person"
              >

                <div className="trust-person-top">

                  <div
                    className="trust-map-portrait"
                    style={{
                      borderColor:
                        agent.color,
                    }}
                  >
                    <img
                      src={agent.image}
                      alt={`${agent.name} portrait`}
                    />
                  </div>

                  <div>
                    <strong>
                      {agent.name}
                    </strong>

                    <small>
                      {agent.role}
                    </small>
                  </div>

                  <strong className="trust-value">
                    {trustScores[
                      agent.id
                    ]}
                  </strong>

                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={
                    trustScores[
                      agent.id
                    ]
                  }
                  onChange={(event) =>
                    updateTrust(
                      agent.id,
                      event.target.value
                    )
                  }
                  style={{
                    accentColor:
                      agent.color,
                  }}
                />

              </div>
            ))}

          </div>

          <div className="trust-note">
            Don't choose based only on confidence.
            Your evidence matters.
          </div>

          <div className="trust-bottom">

            <span>
              Belief map ready.
            </span>

            <button
              className="trust-primary"
              onClick={
                continueToGroup
              }
            >
              SEE THE GROUP →
            </button>

          </div>

        </div>
      </div>
    );
  }

  /* =========================================
     GROUP
  ========================================= */

  if (phase === "group") {
    return (
      <div className="trust-shell">
        <div className="trust-card trust-main">

          <TrustHeader
            phase="05"
            title="GROUP VOTE"
          />

          <div className="trust-heading">
            <span>
              WHAT DOES EVERYONE ELSE THINK?
            </span>

            <h1>
              The group has voted.
            </h1>

            <p>
              Before you make your final
              accusation, see how the others
              interpreted the evidence.
            </p>
          </div>

          {!groupVotesVisible ? (
            <div className="group-reveal">

              <div className="group-lock">
                <div>
                  ?
                </div>

                <strong>
                  GROUP VOTE SEALED
                </strong>

                <small>
                  Reveal the group's suspicion.
                </small>
              </div>

              <button
                className="trust-primary"
                onClick={revealGroup}
              >
                REVEAL VOTES →
              </button>

            </div>
          ) : (
            <>
              <div className="group-vote-grid">

                {AGENTS.map((agent) => {

                  const vote =
                    GROUP_VOTES[
                      agent.id
                    ];

                  return (
                    <div
                      key={agent.id}
                      className={`group-vote-card ${
                        vote ===
                        HIDDEN_OUTLIER
                          ? "group-vote-outlier"
                          : ""
                      }`}
                    >

                      <span>
                        {agent.name}
                      </span>

                      <small>
                        suspects
                      </small>

                      <strong>
                        {vote.toUpperCase()}
                      </strong>

                    </div>
                  );
                })}

              </div>

              <div className="majority-message">
                <span>
                  MAJORITY SUSPICION
                </span>

                <strong>
                  RILEY
                </strong>

                <small>
                  The group is leaning toward
                  a suspect that may not be the
                  real outlier.
                </small>
              </div>

              <div className="trust-bottom">

                <span>
                  Your evidence doesn't have
                  to agree with the group.
                </span>

                <button
                  className="trust-primary"
                  onClick={() => {
                    const majority = "riley";

                    setGroupVote(
                      majority
                    );

                    continueToFinal();
                  }}
                >
                  MAKE FINAL ACCUSATION →
                </button>

              </div>
            </>
          )}

        </div>
      </div>
    );
  }

  /* =========================================
     FINAL
  ========================================= */

  if (phase === "final") {
    return (
      <div className="trust-shell">
        <div className="trust-card trust-main">

          <TrustHeader
            phase="06"
            title="FINAL ACCUSATION"
          />

          <div className="trust-heading">
            <span>
              TRUST YOUR EVIDENCE
            </span>

            <h1>
              Who is the outlier?
            </h1>

            <p>
              Ignore the noise. Make your
              final call.
            </p>
          </div>

          <div className="final-agents">

            {AGENTS.map((agent) => {

              const selected =
                finalChoice ===
                agent.id;

              return (
                <button
                  key={agent.id}
                  className={`final-agent ${
                    selected
                      ? "final-agent-selected"
                      : ""
                  }`}
                  onClick={() =>
                    chooseFinalAgent(
                      agent.id
                    )
                  }
                >

                  <div
                    className="final-avatar final-avatar-image"
                    style={{
                      borderColor:
                        agent.color,
                    }}
                  >
                    <img
                      src={agent.image}
                      alt={`${agent.name} portrait`}
                    />
                  </div>

                  <strong>
                    {agent.name}
                  </strong>

                  <small>
                    {agent.role}
                  </small>

                </button>
              );
            })}

          </div>

          {finalChoice && (
            <div className="final-lock">

              <span>
                YOUR ACCUSATION
              </span>

              <strong>
                {finalChoice.toUpperCase()}
              </strong>

              <button
                className="trust-primary"
                onClick={
                  continueAfterFinal
                }
              >
                LOCK ACCUSATION →
              </button>

            </div>
          )}

        </div>
      </div>
    );
  }

  /* =========================================
     RESULT
  ========================================= */

  return (
    <div className="trust-shell">
      <div className="trust-card trust-result">

        <div className="trust-eyebrow">
          ROUND 05 COMPLETE
        </div>

        <h1 className="trust-result-title">
          {result.correct
            ? "You found the outlier."
            : "The story misled you."}
        </h1>

        <p className="trust-description">
          The outlier was{" "}
          <strong>
            {HIDDEN_OUTLIER.toUpperCase()}
          </strong>
          .
        </p>

        <div className="trust-result-grid">

          <ResultBox
            label="FINAL ACCUSATION"
            value={
              finalChoice
                ? finalChoice.toUpperCase()
                : "—"
            }
          />

          <ResultBox
            label="CLUES REVIEWED"
            value={`${result.investigatedClues}/4`}
          />

          <ResultBox
            label="BELIEF REVISIONS"
            value={result.revisionCount}
          />

          <ResultBox
            label="AVG DECISION"
            value={`${result.averageDecisionTime} ms`}
          />

        </div>

        <div className="trust-observation">

          <span>
            THINKTANK OBSERVATION
          </span>

          <p>
            {result.correct
              ? "Your final accusation matched the hidden outlier. Your belief shifted when the evidence changed."
              : "The group influence may have pulled your suspicion away from the hidden outlier."}
          </p>

        </div>

        <button
          className="trust-primary"
          onClick={finishRound}
        >
          CONTINUE TO ROUND 06 →
        </button>

      </div>
    </div>
  );
}

function TrustHeader({
  phase,
  title,
}) {
  return (
    <>
      <div className="trust-topbar">

        <div>
          <div className="trust-mini-label">
            ROUND 05
          </div>

          <div className="trust-name">
            TRUST
          </div>
        </div>

        <div className="trust-phase">
          {phase} / 05
        </div>

      </div>

      <div className="trust-top-progress">
        <div
          className="trust-top-progress-fill"
          style={{
            width: `${
              (Number(phase) / 5) * 100
            }%`,
          }}
        />
      </div>
    </>
  );
}

function ResultBox({
  label,
  value,
}) {
  return (
    <div className="trust-result-box">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}

export default Trust;