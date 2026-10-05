import { useEffect, useState } from "react";
import "./App.css";
import "./AppDecor.css";
import Stroop from "./games/Stroop";
import Memory from "./games/Memory";
import Pattern from "./games/Pattern";
import Lab from "./games/Lab";
import Trust from "./games/Trust";
import Nova from "./components/Nova";
import { extractBehaviorFeatures, getNumericFeatureVector, } from "./ml/featureExtractor";
import { predictBehaviorProfile } from "./ml/mlApi";

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
    const [behaviorProfile, setBehaviorProfile] = useState(null);
    const [nova, setNova] = useState({
        message: "Hey. I'm Nova. Ready to see how your mind handles the unexpected?",
        expression: "happy",
        visible: true,
        mode: "screen",
    });

    /* =========================================================
       NOVA — DEFAULT SCREEN MESSAGES
    ========================================================= */

    const defaultNovaMessages = {
        home: {
            message: "Hey. I'm Nova. Ready to see how your mind handles the unexpected?",
            expression: "happy",
        },
        name: {
            message: "Nice. I should know what to call you before we begin.",
            expression: "thinking",
        },
        mindset: {
            message: "Interesting choice. Let's see whether it matches how you play.",
            expression: "thinking",
        },
        briefing: {
            message: "Five challenges. Different ways of thinking. Try not to predict what comes next.",
            expression: "neutral",
        },
        game: {
            message: "Round one. Don't rush. The obvious answer may not be the right one.",
            expression: "thinking",
        },
        challenge: {
            message: "Stay focused. I'm watching how you react when the rule changes.",
            expression: "neutral",
        },
        "memory-intro": {
            message: "Five seconds. You don't need to remember everything. Remember what matters.",
            expression: "thinking",
        },
        memory: {
            message: "Your memory is working. Now let's make it harder.",
            expression: "neutral",
        },
        "pattern-intro": {
            message: "Think you've found the rule? Let's see if it survives.",
            expression: "thinking",
        },
        pattern: {
            message: "Don't assume the pattern stays the same.",
            expression: "alert",
        },
        "lab-intro": {
            message: "Something went wrong. You won't get all the information at once.",
            expression: "alert",
        },
        lab: {
            message: "Take a breath. Look at the system before you decide what to do.",
            expression: "thinking",
        },
        "lab-complete": {
            message: "Interesting. You changed your plan when the situation changed.",
            expression: "happy",
        },
        "trust-intro": {
            message: "Five people. Five stories. Don't decide too quickly.",
            expression: "thinking",
        },
        trust: {
            message: "Listen carefully. Confidence isn't the same thing as credibility.",
            expression: "neutral",
        },
        "trust-complete": {
            message: "I've finished collecting your session data. Now I'm sending it to my analysis engine.",
            expression: "thinking",
        },
        analysis: {
            message: "I've processed your gameplay. These are observed patterns, not labels.",
            expression: "thinking",
        },
    };

    /* =========================================================
       NOVA — SCREEN AWARENESS
    ========================================================= */

    useEffect(() => {
        if (nova.mode !== "screen") {
            return;
        }

        const currentNova = defaultNovaMessages[screen];

        if (!currentNova) {
            return;
        }

        setNova({
            ...currentNova,
            visible: true,
            mode: "screen",
        });
    }, [screen, nova.mode]);

    /* =========================================================
       NOVA — OBSERVATION
    ========================================================= */

    const showNovaObservation = (message, expression = "thinking") => {
        setNova({
            message,
            expression,
            visible: true,
            mode: "observation",
        });

        setTimeout(() => {
            setNova((previous) => ({
                ...previous,
                mode: "screen",
            }));
        }, 4000);
    };

    /* =========================================================
       ROUND ANALYSIS HELPER
    ========================================================= */

    const getArrayStats = (data) => {
        if (!Array.isArray(data) || data.length === 0) {
            return null;
        }

        const correctCount = data.filter(
            (item) => item?.correct === true
        ).length;

        const reactionTimes = data
            .map(
                (item) =>
                    Number(
                        item?.reaction_time ??
                        item?.reactionTime
                    )
            )
            .filter(
                (value) =>
                    Number.isFinite(value) && value > 0
            );

        const accuracy =
            (correctCount / data.length) * 100;

        const averageReaction =
            reactionTimes.length > 0
                ? reactionTimes.reduce(
                    (sum, value) => sum + value,
                    0
                ) / reactionTimes.length
                : 0;

        return {
            total: data.length,
            correct: correctCount,
            accuracy,
            averageReaction,
        };
    };

    /* =========================================================
       FEATURE ENGINE
    ========================================================= */

    const buildBehaviorProfile = (sessionData) => {
        const rawFeatures =
            extractBehaviorFeatures(sessionData);

        const numericFeatures =
            getNumericFeatureVector(rawFeatures);

        const profile = {
            raw: rawFeatures,
            numeric: numericFeatures,
            ml: null,
        };

        console.log(
            "=========================================="
        );

        console.log(
            "THINKTANK — BEHAVIOR FEATURE VECTOR"
        );

        console.log(
            "=========================================="
        );

        console.log(
            "RAW FEATURES:",
            rawFeatures
        );

        console.log(
            "NUMERIC ML FEATURES:",
            numericFeatures
        );

        console.table(
            numericFeatures
        );

        return profile;
    };

    /* =========================================================
       SAVE LOCAL DATASET
    ========================================================= */

    const saveBehaviorRecord = (
        featureData,
        mlResult = null
    ) => {
        try {
            const existing =
                JSON.parse(
                    localStorage.getItem(
                        "thinktank_behavior_dataset"
                    ) || "[]"
                );

            const record = {
                session_id:
                    `session_${Date.now()}`,

                timestamp:
                    new Date().toISOString(),

                features:
                    featureData.numeric,

                ml_prediction:
                    mlResult || null,
            };

            existing.push(record);

            localStorage.setItem(
                "thinktank_behavior_dataset",
                JSON.stringify(existing)
            );

            console.log(
                "THINKTANK DATASET:",
                existing
            );
        } catch (error) {
            console.error(
                "Could not save ThinkTank behavior record:",
                error
            );
        }
    };

    /* =========================================================
       HUMAN-READABLE ANALYSIS
    ========================================================= */

    const buildAnalysisSummary = (profile) => {
        if (!profile?.numeric) {
            return null;
        }

        const data =
            profile.numeric;

        const accuracyValues = [
            data.color_accuracy,
            data.memory_accuracy,
            data.pattern_accuracy,
        ].filter(
            (value) =>
                Number.isFinite(value) &&
                value > 0
        );

        const overallAccuracy =
            accuracyValues.length > 0
                ? accuracyValues.reduce(
                    (sum, value) => sum + value,
                    0
                ) / accuracyValues.length
                : 0;

        const reactionValues = [
            data.color_avg_reaction_ms,
            data.memory_avg_reaction_ms,
            data.pattern_avg_reaction_ms,
        ].filter(
            (value) =>
                Number.isFinite(value) &&
                value > 0
        );

        const averageReaction =
            reactionValues.length > 0
                ? reactionValues.reduce(
                    (sum, value) => sum + value,
                    0
                ) / reactionValues.length
                : 0;

        const speedScore =
            averageReaction > 0
                ? Math.max(
                    0,
                    Math.min(
                        100,
                        100 -
                        (
                            (averageReaction - 500) /
                            2000
                        ) *
                        100
                    )
                )
                : 0;

        const adaptationSignals =
            Number(
                data.pattern_rule_change_events
            ) +
            Number(
                data.lab_revisions
            ) +
            Number(
                data.trust_revisions
            );

        const adaptationScore =
            Math.min(
                100,
                45 +
                adaptationSignals * 18
            );

        const evidenceScore =
            Math.min(
                100,
                35 +
                Number(
                    data.lab_clues_checked
                ) *
                10 +
                Number(
                    data.trust_clues_checked
                ) *
                8
            );

        const revisionScore =
            Math.min(
                100,
                25 +
                Number(
                    data.lab_revisions
                ) *
                20 +
                Number(
                    data.trust_revisions
                ) *
                15
            );

        let observation;

        if (
            adaptationScore >= 75 &&
            overallAccuracy >= 75
        ) {
            observation =
                "You stayed accurate while adapting when the task structure changed.";
        } else if (
            evidenceScore >= 70 &&
            revisionScore >= 60
        ) {
            observation =
                "You showed a tendency to gather information and revise decisions when the situation changed.";
        } else if (
            speedScore >= 70 &&
            overallAccuracy < 65
        ) {
            observation =
                "You responded quickly, but faster decisions sometimes came with reduced accuracy.";
        } else if (
            overallAccuracy >= 80
        ) {
            observation =
                "Your responses stayed consistently accurate across several different challenge types.";
        } else {
            observation =
                "Your gameplay showed different decision patterns across attention, memory, logic and uncertainty.";
        }

        return {
            overallAccuracy,
            averageReaction,
            speedScore,
            adaptationScore,
            evidenceScore,
            revisionScore,
            observation,
            ml: profile.ml,
        };
    };

    /* =========================================================
       SESSION HANDLERS
    ========================================================= */

    const handleNameSubmit = (name) => {
        setGameSession((previous) => ({
            ...previous,
            playerName: name,
        }));

        setScreen("mindset");
    };

    const handleMindset = (mindset) => {
        setGameSession((previous) => ({
            ...previous,
            mindset,
        }));

        setScreen("briefing");
    };

    /* =========================================================
       ROUND 1
    ========================================================= */

    const handleStroopComplete = (data) => {
        console.log(
            "COLOR TRAP DATA:",
            data
        );

        setGameSession((previous) => ({
            ...previous,
            stroop: data || [],
        }));

        const stats =
            getArrayStats(data);

        if (stats) {
            if (
                stats.accuracy >= 80 &&
                stats.averageReaction < 900
            ) {
                showNovaObservation(
                    "Interesting. You were both quick and accurate. The pressure didn't slow you down.",
                    "happy"
                );
            } else if (
                stats.accuracy < 60
            ) {
                showNovaObservation(
                    "You moved fast, but the rule changes cost you some accuracy.",
                    "alert"
                );
            } else if (
                stats.averageReaction > 1500
            ) {
                showNovaObservation(
                    "You took your time before committing. Accuracy seemed more important than speed.",
                    "thinking"
                );
            } else {
                showNovaObservation(
                    "I noticed how your response speed changed when the rules became less predictable.",
                    "thinking"
                );
            }
        }

        setScreen("memory-intro");
    };

    /* =========================================================
       ROUND 2
    ========================================================= */

    const handleMemoryComplete = (data) => {
        console.log(
            "MEMORY TRAP DATA:",
            data
        );

        setGameSession((previous) => ({
            ...previous,
            memory: data || [],
        }));

        const stats =
            getArrayStats(data);

        if (stats) {
            if (
                stats.accuracy >= 80
            ) {
                showNovaObservation(
                    "Your recall stayed stable across different memory demands.",
                    "happy"
                );
            } else if (
                stats.accuracy < 60
            ) {
                showNovaObservation(
                    "The interference got to you. You remembered some things, but not consistently.",
                    "thinking"
                );
            } else {
                showNovaObservation(
                    "Interesting trade-off between recall speed and accuracy.",
                    "neutral"
                );
            }
        }

        setScreen("pattern-intro");
    };

    /* =========================================================
       ROUND 3
    ========================================================= */

    const handlePatternComplete = (data) => {
        console.log(
            "LOGIC SHIFT DATA:",
            data
        );

        setGameSession((previous) => ({
            ...previous,
            pattern: data || [],
        }));

        const stats =
            getArrayStats(data);

        if (stats) {
            if (
                stats.accuracy >= 80
            ) {
                showNovaObservation(
                    "You adapted well when the pattern changed.",
                    "happy"
                );
            } else if (
                stats.accuracy < 60
            ) {
                showNovaObservation(
                    "Once you found a rule, letting go of it became harder.",
                    "thinking"
                );
            } else {
                showNovaObservation(
                    "You found the pattern, but the rule change made you hesitate.",
                    "alert"
                );
            }
        }

        setScreen("lab-intro");
    };

    /* =========================================================
       ROUND 4
    ========================================================= */

    const handleLabComplete = (data) => {
        console.log(
            "THE LAB DATA:",
            data
        );

        setGameSession((previous) => ({
            ...previous,
            lab: data || [],
        }));

        if (
            data &&
            typeof data === "object"
        ) {
            const revisions =
                Number(
                    data.planRevisions ??
                    data.plan_revisions ??
                    data.revisions
                ) || 0;

            const clues =
                Number(
                    data.cluesChecked ??
                    data.clues_checked ??
                    data.cluesReviewed
                ) || 0;

            if (
                revisions > 0
            ) {
                showNovaObservation(
                    "You didn't cling to the first plan. New information changed your approach.",
                    "happy"
                );
            } else if (
                clues >= 4
            ) {
                showNovaObservation(
                    "You explored the system thoroughly before committing.",
                    "thinking"
                );
            } else {
                showNovaObservation(
                    "You reached a decision with limited investigation. Interesting.",
                    "thinking"
                );
            }
        }

        setScreen("lab-complete");
    };

    /* =========================================================
       ROUND 5 — CONNECT TO PYTHON ML
    ========================================================= */

    const handleTrustComplete = async (data) => {
        console.log(
            "TRUST DATA:",
            data
        );

        const updatedSession = {
            ...gameSession,
            trust: data || {},
        };

        setGameSession(updatedSession);

        /*
          STEP 1
          Convert raw gameplay into numerical features.
        */

        const profile =
            buildBehaviorProfile(
                updatedSession
            );

        /*
          STEP 2
          Send those features to FastAPI.
        */

        showNovaObservation(
            "I've collected enough data. Give me a second to process the session.",
            "thinking"
        );

        const mlResult =
            await predictBehaviorProfile(
                profile.numeric
            );

        /*
          STEP 3
          Store ML result together with the
          gameplay feature vector.
        */

        const completeProfile = {
            ...profile,
            ml: mlResult,
        };

        setBehaviorProfile(
            completeProfile
        );

        saveBehaviorRecord(
            profile,
            mlResult
        );

        console.log(
            "=========================================="
        );

        console.log(
            "THINKTANK — FINAL ML RESULT"
        );

        console.log(
            "=========================================="
        );

        console.log(
            completeProfile
        );

        /*
          NOVA reacts to actual ML output.
        */

        if (
            mlResult &&
            mlResult.success !== false
        ) {
            showNovaObservation(
                `I've got it. Your current gameplay profile is "${mlResult.profile}".`,
                "happy"
            );
        } else {
            showNovaObservation(
                "I recorded your behaviour, but my analysis engine needs another moment.",
                "thinking"
            );
        }

        setScreen("trust-complete");
    };

    /* =========================================================
       RESPONSE COUNT
    ========================================================= */

    const getResponseCount = (data) => {
        if (
            Array.isArray(data)
        ) {
            return data.length;
        }

        if (
            data &&
            Array.isArray(
                data.questions
            )
        ) {
            return data.questions.length;
        }

        return 0;
    };

    /* =========================================================
       ANALYSIS DATA
    ========================================================= */

    const analysis =
        buildAnalysisSummary(
            behaviorProfile
        );

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <main className={`app app-${screen}`}>

            {/* HOME */}

            {screen === "home" && (
                <section className="landing-screen">

                    <div className="landing-content">

                        <p className="eyebrow">
                            AN EXPERIMENT IN HUMAN THINKING
                        </p>

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

            {/* NAME */}

            {screen === "name" && (
                <section className="onboarding-screen">

                    <div className="onboarding-card">

                        <p className="eyebrow">
                            BEFORE WE BEGIN
                        </p>

                        <h1 className="section-title">
                            What should we call you?
                        </h1>

                        <p className="section-subtitle">
                            Your name is only used to personalize this session.
                        </p>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();

                                const input =
                                    event.target.elements.playerName.value.trim();

                                if (!input) {
                                    return;
                                }

                                handleNameSubmit(
                                    input
                                );
                            }}
                        >

                            <input
                                name="playerName"
                                type="text"
                                className="text-input"
                                placeholder="Enter your name"
                                autoComplete="off"
                            />

                            <button
                                type="submit"
                                className="primary-button"
                            >
                                CONTINUE →
                            </button>

                        </form>

                    </div>

                </section>
            )}

            {/* MINDSET */}

            {screen === "mindset" && (
                <section className="onboarding-screen">

                    <div className="onboarding-card">

                        <p className="eyebrow">
                            SET YOUR MINDSET
                        </p>

                        <h1 className="section-title">
                            How are you approaching this?
                        </h1>

                        <p className="section-subtitle">
                            There is no correct choice. Pick what feels closest right now.
                        </p>

                        <div className="mindset-grid">

                            <button
                                className="mindset-card"
                                onClick={() =>
                                    handleMindset(
                                        "curious"
                                    )
                                }
                            >
                                <span className="mindset-number">
                                    01
                                </span>

                                <strong>
                                    CURIOUS
                                </strong>

                                <span>
                                    Let’s see what happens.
                                </span>
                            </button>

                            <button
                                className="mindset-card"
                                onClick={() =>
                                    handleMindset(
                                        "competitive"
                                    )
                                }
                            >
                                <span className="mindset-number">
                                    02
                                </span>

                                <strong>
                                    COMPETITIVE
                                </strong>

                                <span>
                                    I want to perform.
                                </span>
                            </button>

                            <button
                                className="mindset-card"
                                onClick={() =>
                                    handleMindset(
                                        "calm"
                                    )
                                }
                            >
                                <span className="mindset-number">
                                    03
                                </span>

                                <strong>
                                    CALM
                                </strong>

                                <span>
                                    I’ll take my time.
                                </span>
                            </button>

                            <button
                                className="mindset-card"
                                onClick={() =>
                                    handleMindset(
                                        "unpredictable"
                                    )
                                }
                            >
                                <span className="mindset-number">
                                    04
                                </span>

                                <strong>
                                    UNPREDICTABLE
                                </strong>

                                <span>
                                    Keep me guessing.
                                </span>
                            </button>

                        </div>

                    </div>

                </section>
            )}

            {/* BRIEFING */}

            {screen === "briefing" && (
                <section className="onboarding-screen">

                    <div className="briefing-container">

                        <p className="eyebrow">
                            SESSION BRIEFING
                        </p>

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
                                    <strong>
                                        COLOR TRAP
                                    </strong>

                                    <p>
                                        Attention, inhibition and rule switching.
                                    </p>
                                </div>
                            </div>

                            <div className="briefing-item">
                                <span>02</span>

                                <div>
                                    <strong>
                                        MEMORY TRAP
                                    </strong>

                                    <p>
                                        Recall, interference and information retention.
                                    </p>
                                </div>
                            </div>

                            <div className="briefing-item">
                                <span>03</span>

                                <div>
                                    <strong>
                                        LOGIC SHIFT
                                    </strong>

                                    <p>
                                        Pattern recognition and adapting to hidden rules.
                                    </p>
                                </div>
                            </div>

                            <div className="briefing-item">
                                <span>04</span>

                                <div>
                                    <strong>
                                        THE LAB
                                    </strong>

                                    <p>
                                        Investigation, planning and adaptation.
                                    </p>
                                </div>
                            </div>

                            <div className="briefing-item">
                                <span>05</span>

                                <div>
                                    <strong>
                                        TRUST
                                    </strong>

                                    <p>
                                        Social deduction, influence and changing suspicion.
                                    </p>
                                </div>
                            </div>

                            <div className="briefing-item">
                                <span>06</span>

                                <div>
                                    <strong>
                                        FINAL DECISION
                                    </strong>

                                    <p>
                                        The final challenge comes later.
                                    </p>
                                </div>
                            </div>

                        </div>

                        <button
                            className="primary-button"
                            onClick={() =>
                                setScreen("game")
                            }
                        >
                            BEGIN ROUND 01 →
                        </button>

                    </div>

                </section>
            )}

            {/* ROUND 1 INTRO */}

            {screen === "game" && (
                <section className="round-screen">

                    <div className="round-intro-card">

                        <p className="eyebrow">
                            ROUND 01 / 06
                        </p>

                        <h1 className="section-title">
                            COLOR TRAP
                        </h1>

                        <p className="section-subtitle">
                            Your task looks simple.
                            <br />
                            Your brain may disagree.
                        </p>

                        <button
                            className="primary-button"
                            onClick={() =>
                                setScreen("challenge")
                            }
                        >
                            START ROUND →
                        </button>

                    </div>

                </section>
            )}

            {/* ROUND 1 */}

            {screen === "challenge" && (
                <Stroop
                    onComplete={
                        handleStroopComplete
                    }
                />
            )}

            {/* ROUND 2 INTRO */}

            {screen === "memory-intro" && (
                <section className="round-screen">

                    <div className="round-intro-card">

                        <p className="eyebrow">
                            ROUND 02 / 06
                        </p>

                        <h1 className="section-title">
                            MEMORY TRAP
                        </h1>

                        <p className="section-subtitle">
                            Memory is not a recording.
                            <br />
                            Let’s see what your mind keeps.
                        </p>

                        <button
                            className="primary-button"
                            onClick={() =>
                                setScreen("memory")
                            }
                        >
                            START ROUND →
                        </button>

                    </div>

                </section>
            )}

            {/* ROUND 2 */}

            {screen === "memory" && (
                <Memory
                    onComplete={
                        handleMemoryComplete
                    }
                />
            )}

            {/* ROUND 3 INTRO */}

            {screen === "pattern-intro" && (
                <section className="round-screen">

                    <div className="round-intro-card">

                        <p className="eyebrow">
                            ROUND 03 / 06
                        </p>

                        <h1 className="section-title">
                            LOGIC SHIFT
                        </h1>

                        <p className="section-subtitle">
                            Find the pattern.
                            <br />
                            Then find out when the pattern changes.
                        </p>

                        <button
                            className="primary-button"
                            onClick={() =>
                                setScreen("pattern")
                            }
                        >
                            START ROUND →
                        </button>

                    </div>

                </section>
            )}

            {/* ROUND 3 */}

            {screen === "pattern" && (
                <Pattern
                    onComplete={
                        handlePatternComplete
                    }
                />
            )}

            {/* ROUND 4 INTRO */}

            {screen === "lab-intro" && (
                <section className="round-screen">

                    <div className="round-intro-card">

                        <p className="eyebrow">
                            ROUND 04 / 06
                        </p>

                        <h1 className="section-title">
                            THE LAB
                        </h1>

                        <p className="section-subtitle">
                            Something has gone wrong.
                            <br />
                            Investigate first. Decide later.
                        </p>

                        <button
                            className="primary-button"
                            onClick={() =>
                                setScreen("lab")
                            }
                        >
                            ENTER THE LAB →
                        </button>

                    </div>

                </section>
            )}

            {/* ROUND 4 */}

            {screen === "lab" && (
                <Lab
                    onComplete={
                        handleLabComplete
                    }
                />
            )}

            {/* ROUND 4 COMPLETE */}

            {screen === "lab-complete" && (
                <section className="round-screen">

                    <div className="round-intro-card">

                        <p className="eyebrow">
                            ROUND 04 COMPLETE
                        </p>

                        <h1 className="section-title">
                            PLAN CHANGED.
                        </h1>

                        <p className="section-subtitle">
                            You investigated the system, formed a plan and adapted when new
                            information appeared.
                        </p>

                        <button
                            className="primary-button"
                            onClick={() =>
                                setScreen("trust-intro")
                            }
                        >
                            CONTINUE TO ROUND 05 →
                        </button>

                    </div>

                </section>
            )}

            {/* ROUND 5 INTRO */}

            {screen === "trust-intro" && (
                <section className="round-screen">

                    <div className="round-intro-card">

                        <p className="eyebrow">
                            ROUND 05 / 06
                        </p>

                        <h1 className="section-title">
                            TRUST
                        </h1>

                        <p className="section-subtitle">
                            Five people.
                            <br />
                            Conflicting stories.
                            <br />
                            One of them is hiding something.
                        </p>

                        <button
                            className="primary-button"
                            onClick={() =>
                                setScreen("trust")
                            }
                        >
                            ENTER THE INVESTIGATION →
                        </button>

                    </div>

                </section>
            )}

            {/* ROUND 5 */}

            {screen === "trust" && (
                <Trust
                    onComplete={
                        handleTrustComplete
                    }
                />
            )}

            {/* ROUND 5 COMPLETE */}

            {screen === "trust-complete" && (
                <section className="round-screen">

                    <div className="round-intro-card">

                        <p className="eyebrow">
                            SESSION DATA CAPTURED
                        </p>

                        <h1 className="section-title">
                            NOVA HAS FINISHED ANALYZING.
                        </h1>

                        <p className="section-subtitle">
                            Five rounds complete.
                            <br />
                            Your gameplay has been sent through the ML analysis engine.
                        </p>

                        <button
                            className="primary-button"
                            onClick={() =>
                                setScreen("analysis")
                            }
                        >
                            VIEW ANALYSIS →
                        </button>

                    </div>

                </section>
            )}

            {/* ANALYSIS */}

            {screen === "analysis" && (
                <section className="round-screen">

                    <div
                        className="round-intro-card"
                        style={{
                            width:
                                "min(980px, 100%)",
                            minHeight:
                                "auto",
                            padding:
                                "56px",
                        }}
                    >

                        <p className="eyebrow">
                            THINKTANK // BEHAVIORAL ANALYSIS
                        </p>

                        <h1 className="section-title">
                            Your session,
                            <br />
                            decoded.
                        </h1>

                        <p className="section-subtitle">
                            These signals come directly from your gameplay.
                            They describe what you did—not who you are.
                        </p>

                        {analysis ? (
                            <>

                                {/* ML PROFILE */}

                                {analysis.ml &&
                                    analysis.ml.success !== false && (
                                        <div
                                            style={{
                                                marginTop:
                                                    "28px",
                                                padding:
                                                    "24px",
                                                borderRadius:
                                                    "22px",
                                                border:
                                                    "1px solid rgba(143, 131, 255, 0.28)",
                                                background:
                                                    "linear-gradient(145deg, rgba(143,131,255,0.12), rgba(255,255,255,0.025))",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display:
                                                        "block",
                                                    color:
                                                        "#969dad",
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        800,
                                                    letterSpacing:
                                                        "0.14em",
                                                    marginBottom:
                                                        "9px",
                                                }}
                                            >
                                                ML BEHAVIOR PROFILE
                                            </span>

                                            <strong
                                                style={{
                                                    display:
                                                        "block",
                                                    color:
                                                        "#f6f7fb",
                                                    fontSize:
                                                        "32px",
                                                    letterSpacing:
                                                        "-0.04em",
                                                }}
                                            >
                                                {
                                                    analysis.ml.profile
                                                }
                                            </strong>

                                            <p
                                                style={{
                                                    margin:
                                                        "9px 0 0",
                                                    color:
                                                        "#a7abb6",
                                                    fontSize:
                                                        "13px",
                                                    lineHeight:
                                                        1.6,
                                                }}
                                            >
                                                Cluster confidence:{" "}
                                                <strong>
                                                    {
                                                        analysis.ml.confidence
                                                    }
                                                    %
                                                </strong>
                                            </p>

                                            <small
                                                style={{
                                                    display:
                                                        "block",
                                                    marginTop:
                                                        "9px",
                                                    color:
                                                        "#747985",
                                                    fontSize:
                                                        "10px",
                                                }}
                                            >
                                                Based on observed
                                                gameplay features using
                                                K-Means clustering.
                                            </small>

                                        </div>
                                    )}

                                {/* TOP METRICS */}

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "repeat(4, minmax(0, 1fr))",
                                        gap:
                                            "12px",
                                        marginTop:
                                            "22px",
                                    }}
                                >

                                    <AnalysisMetric
                                        label="ACCURACY"
                                        value={`${analysis.overallAccuracy.toFixed(
                                            0
                                        )}%`}
                                        note="Across response-based rounds"
                                    />

                                    <AnalysisMetric
                                        label="AVG RESPONSE"
                                        value={`${Math.round(
                                            analysis.averageReaction
                                        )} ms`}
                                        note="Across timed responses"
                                    />

                                    <AnalysisMetric
                                        label="ADAPTATION"
                                        value={`${Math.round(
                                            analysis.adaptationScore
                                        )}%`}
                                        note="Observed change signals"
                                    />

                                    <AnalysisMetric
                                        label="EVIDENCE USE"
                                        value={`${Math.round(
                                            analysis.evidenceScore
                                        )}%`}
                                        note="Clues and information explored"
                                    />

                                </div>

                                {/* BARS */}

                                <div
                                    style={{
                                        marginTop:
                                            "22px",
                                        display:
                                            "grid",
                                        gap:
                                            "12px",
                                    }}
                                >

                                    <AnalysisBar
                                        label="RESPONSE SPEED"
                                        value={
                                            analysis.speedScore
                                        }
                                    />

                                    <AnalysisBar
                                        label="ADAPTATION SIGNAL"
                                        value={
                                            analysis.adaptationScore
                                        }
                                    />

                                    <AnalysisBar
                                        label="EVIDENCE EXPLORATION"
                                        value={
                                            analysis.evidenceScore
                                        }
                                    />

                                    <AnalysisBar
                                        label="DECISION REVISION"
                                        value={
                                            analysis.revisionScore
                                        }
                                    />

                                </div>

                                {/* NOVA OBSERVATION */}

                                <div
                                    style={{
                                        marginTop:
                                            "30px",
                                        padding:
                                            "22px",
                                        borderRadius:
                                            "20px",
                                        border:
                                            "1px solid rgba(143, 131, 255, 0.18)",
                                        background:
                                            "rgba(143, 131, 255, 0.06)",
                                    }}
                                >

                                    <span
                                        style={{
                                            display:
                                                "block",
                                            marginBottom:
                                                "9px",
                                            color:
                                                "#969dad",
                                            fontSize:
                                                "10px",
                                            fontWeight:
                                                800,
                                            letterSpacing:
                                                "0.14em",
                                        }}
                                    >
                                        NOVA OBSERVATION
                                    </span>

                                    <p
                                        style={{
                                            margin:
                                                0,
                                            color:
                                                "#f6f7fb",
                                            fontSize:
                                                "16px",
                                            lineHeight:
                                                1.6,
                                        }}
                                    >
                                        {
                                            analysis.observation
                                        }
                                    </p>

                                </div>

                                {/* PIPELINE */}

                                <div
                                    style={{
                                        marginTop:
                                            "14px",
                                        padding:
                                            "18px 20px",
                                        borderRadius:
                                            "16px",
                                        border:
                                            "1px solid rgba(255, 255, 255, 0.08)",
                                        background:
                                            "rgba(255, 255, 255, 0.03)",
                                    }}
                                >

                                    <span
                                        style={{
                                            display:
                                                "block",
                                            color:
                                                "#8f83ff",
                                            fontSize:
                                                "10px",
                                            fontWeight:
                                                800,
                                            letterSpacing:
                                                "0.14em",
                                            marginBottom:
                                                "8px",
                                        }}
                                    >
                                        APPLIED ML PIPELINE
                                    </span>

                                    <p
                                        style={{
                                            margin:
                                                0,
                                            color:
                                                "#b1b5bf",
                                            fontSize:
                                                "13px",
                                            lineHeight:
                                                1.6,
                                        }}
                                    >
                                        Gameplay → feature extraction → numerical behaviour
                                        vector → FastAPI → K-Means → observed gameplay profile.
                                    </p>

                                </div>

                                <button
                                    className="primary-button"
                                    style={{
                                        marginTop:
                                            "28px",
                                    }}
                                    onClick={() =>
                                        console.log(
                                            "FINAL THINKTANK BEHAVIOR PROFILE:",
                                            behaviorProfile
                                        )
                                    }
                                >
                                    VIEW RAW ML DATA →
                                </button>

                            </>
                        ) : (
                            <div
                                style={{
                                    marginTop:
                                        "35px",
                                    padding:
                                        "30px",
                                    borderRadius:
                                        "20px",
                                    border:
                                        "1px solid rgba(255,255,255,0.08)",
                                    background:
                                        "rgba(255,255,255,0.03)",
                                }}
                            >

                                <p
                                    style={{
                                        margin:
                                            0,
                                        color:
                                            "#969dad",
                                    }}
                                >
                                    No analysis data is available yet.
                                </p>

                            </div>
                        )}

                    </div>

                </section>
            )}

            {/* NOVA */}

            <Nova
                message={
                    nova.message
                }
                expression={
                    nova.expression
                }
                visible={
                    nova.visible
                }
            />

        </main>
    );
}

/* =========================================================
   ANALYSIS COMPONENTS
========================================================= */

function AnalysisMetric({
    label,
    value,
    note,
}) {
    return (
        <div
            style={{
                padding:
                    "20px",
                borderRadius:
                    "18px",
                border:
                    "1px solid rgba(255,255,255,0.08)",
                background:
                    "rgba(255,255,255,0.035)",
            }}
        >

            <span
                style={{
                    display:
                        "block",
                    color:
                        "#969dad",
                    fontSize:
                        "9px",
                    fontWeight:
                        800,
                    letterSpacing:
                        "0.13em",
                    marginBottom:
                        "10px",
                }}
            >
                {label}
            </span>

            <strong
                style={{
                    display:
                        "block",
                    color:
                        "#f6f7fb",
                    fontSize:
                        "26px",
                    letterSpacing:
                        "-0.03em",
                }}
            >
                {value}
            </strong>

            <small
                style={{
                    display:
                        "block",
                    marginTop:
                        "7px",
                    color:
                        "#747985",
                    fontSize:
                        "10px",
                    lineHeight:
                        1.5,
                }}
            >
                {note}
            </small>

        </div>
    );
}

function AnalysisBar({
    label,
    value,
}) {
    const safeValue =
        Math.max(
            0,
            Math.min(
                100,
                Number(value) || 0
            )
        );

    return (
        <div
            style={{
                padding:
                    "16px 18px",
                borderRadius:
                    "15px",
                border:
                    "1px solid rgba(255,255,255,0.07)",
                background:
                    "rgba(255,255,255,0.025)",
            }}
        >

            <div
                style={{
                    display:
                        "flex",
                    justifyContent:
                        "space-between",
                    alignItems:
                        "center",
                    marginBottom:
                        "8px",
                }}
            >

                <span
                    style={{
                        color:
                            "#a7abb6",
                        fontSize:
                            "10px",
                        fontWeight:
                            800,
                        letterSpacing:
                            "0.1em",
                    }}
                >
                    {label}
                </span>

                <strong
                    style={{
                        color:
                            "#f6f7fb",
                        fontSize:
                            "11px",
                    }}
                >
                    {Math.round(
                        safeValue
                    )}
                </strong>

            </div>

            <div
                style={{
                    width:
                        "100%",
                    height:
                        "7px",
                    borderRadius:
                        "999px",
                    background:
                        "rgba(255,255,255,0.06)",
                    overflow:
                        "hidden",
                }}
            >

                <div
                    style={{
                        width:
                            `${safeValue}%`,
                        height:
                            "100%",
                        borderRadius:
                            "999px",
                        background:
                            "linear-gradient(90deg, #665bd8, #9b92ff)",
                        transition:
                            "width 0.8s ease",
                    }}
                />

            </div>

        </div>
    );
}

export default App;