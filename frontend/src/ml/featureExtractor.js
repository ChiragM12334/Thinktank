/* =========================================================
   THINKTANK — BEHAVIOR FEATURE EXTRACTOR

   Converts raw round data into a consistent numerical
   feature vector for the Applied ML layer.

   Important:
   These are observed gameplay features.
   They are NOT psychological diagnoses.
========================================================= */

/* =========================================================
   BASIC HELPERS
========================================================= */

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const clamp = (value, min = 0, max = 100) => {
  return Math.min(
    max,
    Math.max(min, toNumber(value))
  );
};

const average = (values) => {
  const validValues = values
    .map((value) => Number(value))
    .filter(
      (value) =>
        Number.isFinite(value) &&
        value > 0
    );

  if (!validValues.length) {
    return 0;
  }

  return (
    validValues.reduce(
      (sum, value) => sum + value,
      0
    ) / validValues.length
  );
};

const getArrayFromData = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const possibleArrays = [
    data.questions,
    data.responses,
    data.sessionData,
    data.session_data,
    data.results,
    data.answers,
  ];

  for (const candidate of possibleArrays) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

/* =========================================================
   ROUND ARRAY STATS
========================================================= */

const getRoundStats = (data) => {
  const rows = getArrayFromData(data);

  if (!rows.length) {
    return {
      accuracy: 0,
      averageReaction: 0,
      correct: 0,
      total: 0,
    };
  }

  const correct = rows.filter(
    (item) => item?.correct === true
  ).length;

  const reactionTimes = rows
    .map(
      (item) =>
        item?.reaction_time ??
        item?.reactionTime
    )
    .filter(
      (value) =>
        Number.isFinite(Number(value)) &&
        Number(value) > 0
    );

  return {
    accuracy: clamp(
      (correct / rows.length) * 100
    ),

    averageReaction: Math.round(
      average(reactionTimes)
    ),

    correct,

    total: rows.length,
  };
};

/* =========================================================
   ROUND 01 — COLOR TRAP
========================================================= */

const extractColorTrap = (data) => {
  const stats = getRoundStats(data);

  const rows = getArrayFromData(data);

  const timeouts = rows.filter(
    (item) =>
      item?.timeout === true ||
      item?.timed_out === true
  ).length;

  const ruleSwitchErrors = rows.filter(
    (item) =>
      item?.rule_switch_error === true ||
      item?.ruleSwitchError === true
  ).length;

  return {
    color_accuracy: Number(
      stats.accuracy.toFixed(2)
    ),

    color_avg_reaction_ms:
      stats.averageReaction,

    color_timeouts: timeouts,

    color_rule_switch_errors:
      ruleSwitchErrors,

    color_response_count: stats.total,
  };
};

/* =========================================================
   ROUND 02 — MEMORY TRAP
========================================================= */

const extractMemory = (data) => {
  const stats = getRoundStats(data);

  const rows = getArrayFromData(data);

  const modeChanges = new Set(
    rows
      .map(
        (item) =>
          item?.mode ||
          item?.mode_label
      )
      .filter(Boolean)
  ).size;

  return {
    memory_accuracy: Number(
      stats.accuracy.toFixed(2)
    ),

    memory_avg_reaction_ms:
      stats.averageReaction,

    memory_modes_tested:
      modeChanges,

    memory_response_count:
      stats.total,
  };
};

/* =========================================================
   ROUND 03 — LOGIC SHIFT
========================================================= */

const extractPattern = (data) => {
  const stats = getRoundStats(data);

  const rows = getArrayFromData(data);

  const ruleChanges = rows.filter(
    (item) =>
      item?.rule_changed === true ||
      item?.ruleChange === true ||
      item?.pattern_type === "rule_shift"
  ).length;

  return {
    pattern_accuracy: Number(
      stats.accuracy.toFixed(2)
    ),

    pattern_avg_reaction_ms:
      stats.averageReaction,

    pattern_rule_change_events:
      ruleChanges,

    pattern_response_count:
      stats.total,
  };
};

/* =========================================================
   ROUND 04 — THE LAB
========================================================= */

const extractLab = (data) => {
  if (!data || typeof data !== "object") {
    return {
      lab_revisions: 0,
      lab_clues_checked: 0,
      lab_time_used_seconds: 0,
      lab_action_count: 0,
    };
  }

  const revisions = toNumber(
    data.planRevisions ??
      data.plan_revisions ??
      data.revisions
  );

  const cluesChecked = toNumber(
    data.cluesChecked ??
      data.clues_checked ??
      data.cluesReviewed ??
      data.clues_reviewed
  );

  const timeUsed = toNumber(
    data.timeUsed ??
      data.time_used_seconds ??
      data.totalTime ??
      data.total_time_seconds
  );

  const actionSource =
    data.actions ??
    data.selectedActions ??
    data.selected_actions;

  const actionCount = Array.isArray(
    actionSource
  )
    ? actionSource.length
    : 0;

  return {
    lab_revisions: revisions,

    lab_clues_checked:
      cluesChecked,

    lab_time_used_seconds:
      timeUsed,

    lab_action_count:
      actionCount,
  };
};

/* =========================================================
   ROUND 05 — TRUST
========================================================= */

const extractTrust = (data) => {
  if (!data || typeof data !== "object") {
    return {
      trust_correct: 0,
      trust_revisions: 0,
      trust_avg_decision_ms: 0,
      trust_shift: 0,
      trust_clues_checked: 0,
    };
  }

  return {
    trust_correct:
      data.correct === true
        ? 1
        : 0,

    trust_revisions: toNumber(
      data.revision_count
    ),

    trust_avg_decision_ms:
      toNumber(
        data.average_decision_time
      ),

    trust_shift: toNumber(
      data.trust_shift_on_hidden_agent
    ),

    trust_clues_checked:
      toNumber(
        data.clues_inspected_count
      ),
  };
};

/* =========================================================
   COMPLETE SESSION FEATURE VECTOR
========================================================= */

export const extractBehaviorFeatures = (
  gameSession
) => {
  const color = extractColorTrap(
    gameSession?.stroop
  );

  const memory = extractMemory(
    gameSession?.memory
  );

  const pattern = extractPattern(
    gameSession?.pattern
  );

  const lab = extractLab(
    gameSession?.lab
  );

  const trust = extractTrust(
    gameSession?.trust
  );

  const featureVector = {
    /* -----------------------------------------
       PLAYER CONTEXT
    ----------------------------------------- */

    mindset:
      gameSession?.mindset || "unknown",

    /* -----------------------------------------
       ROUND 01
    ----------------------------------------- */

    ...color,

    /* -----------------------------------------
       ROUND 02
    ----------------------------------------- */

    ...memory,

    /* -----------------------------------------
       ROUND 03
    ----------------------------------------- */

    ...pattern,

    /* -----------------------------------------
       ROUND 04
    ----------------------------------------- */

    ...lab,

    /* -----------------------------------------
       ROUND 05
    ----------------------------------------- */

    ...trust,
  };

  return featureVector;
};

/* =========================================================
   NUMERICAL VECTOR

   This removes categorical fields such as mindset
   and returns only numerical ML-ready values.
========================================================= */

export const getNumericFeatureVector = (
  featureVector
) => {
  return {
    color_accuracy:
      toNumber(
        featureVector.color_accuracy
      ),

    color_avg_reaction_ms:
      toNumber(
        featureVector.color_avg_reaction_ms
      ),

    color_timeouts:
      toNumber(
        featureVector.color_timeouts
      ),

    color_rule_switch_errors:
      toNumber(
        featureVector.color_rule_switch_errors
      ),

    color_response_count:
      toNumber(
        featureVector.color_response_count
      ),

    memory_accuracy:
      toNumber(
        featureVector.memory_accuracy
      ),

    memory_avg_reaction_ms:
      toNumber(
        featureVector.memory_avg_reaction_ms
      ),

    memory_modes_tested:
      toNumber(
        featureVector.memory_modes_tested
      ),

    memory_response_count:
      toNumber(
        featureVector.memory_response_count
      ),

    pattern_accuracy:
      toNumber(
        featureVector.pattern_accuracy
      ),

    pattern_avg_reaction_ms:
      toNumber(
        featureVector.pattern_avg_reaction_ms
      ),

    pattern_rule_change_events:
      toNumber(
        featureVector.pattern_rule_change_events
      ),

    pattern_response_count:
      toNumber(
        featureVector.pattern_response_count
      ),

    lab_revisions:
      toNumber(
        featureVector.lab_revisions
      ),

    lab_clues_checked:
      toNumber(
        featureVector.lab_clues_checked
      ),

    lab_time_used_seconds:
      toNumber(
        featureVector.lab_time_used_seconds
      ),

    lab_action_count:
      toNumber(
        featureVector.lab_action_count
      ),

    trust_correct:
      toNumber(
        featureVector.trust_correct
      ),

    trust_revisions:
      toNumber(
        featureVector.trust_revisions
      ),

    trust_avg_decision_ms:
      toNumber(
        featureVector.trust_avg_decision_ms
      ),

    trust_shift:
      toNumber(
        featureVector.trust_shift
      ),

    trust_clues_checked:
      toNumber(
        featureVector.trust_clues_checked
      ),
  };
};