from typing import Dict

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


# =========================================================
# THINKTANK — APPLIED ML BACKEND
#
# Current model:
# K-Means clustering
#
# Purpose:
# Group gameplay behaviour patterns based on
# observed numerical features.
#
# This is NOT a psychological diagnosis.
# =========================================================


app = FastAPI(
    title="ThinkTank ML API",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# FEATURE ORDER
#
# IMPORTANT:
# This order matches frontend/src/ml/featureExtractor.js
# =========================================================

FEATURE_NAMES = [
    "color_accuracy",
    "color_avg_reaction_ms",
    "color_timeouts",
    "color_rule_switch_errors",
    "color_response_count",

    "memory_accuracy",
    "memory_avg_reaction_ms",
    "memory_modes_tested",
    "memory_response_count",

    "pattern_accuracy",
    "pattern_avg_reaction_ms",
    "pattern_rule_change_events",
    "pattern_response_count",

    "lab_revisions",
    "lab_clues_checked",
    "lab_time_used_seconds",
    "lab_action_count",

    "trust_correct",
    "trust_revisions",
    "trust_avg_decision_ms",
    "trust_shift",
    "trust_clues_checked",
]


# =========================================================
# BEHAVIOR PROFILE NAMES
#
# These are interaction profiles, NOT psychological labels.
# =========================================================

PROFILE_NAMES = {
    0: "Rapid Responder",
    1: "Steady Analyst",
    2: "Adaptive Thinker",
    3: "Exploratory Decider",
}


# =========================================================
# SEED DATA
#
# This is only an initial prototype dataset so the model
# can run before we have enough real player sessions.
#
# Later we will replace/augment this with real sessions.
# =========================================================


def create_seed_dataset():
    rng = np.random.default_rng(42)

    # Feature order:
    #
    # color_accuracy
    # color_avg_reaction_ms
    # color_timeouts
    # color_rule_switch_errors
    # color_response_count
    #
    # memory_accuracy
    # memory_avg_reaction_ms
    # memory_modes_tested
    # memory_response_count
    #
    # pattern_accuracy
    # pattern_avg_reaction_ms
    # pattern_rule_change_events
    # pattern_response_count
    #
    # lab_revisions
    # lab_clues_checked
    # lab_time_used_seconds
    # lab_action_count
    #
    # trust_correct
    # trust_revisions
    # trust_avg_decision_ms
    # trust_shift
    # trust_clues_checked

    prototypes = np.array(
        [
            # Rapid Responder
            [
                88, 620, 0, 1, 8,
                72, 680, 5, 5,
                70, 720, 1, 5,
                0, 3, 220, 5,
                1, 0, 700, 4, 2,
            ],

            # Steady Analyst
            [
                82, 1250, 0, 1, 8,
                88, 1300, 5, 5,
                85, 1350, 1, 5,
                1, 5, 420, 8,
                1, 1, 1200, 8, 4,
            ],

            # Adaptive Thinker
            [
                76, 1050, 1, 2, 8,
                80, 1100, 5, 5,
                90, 980, 2, 5,
                2, 5, 470, 9,
                1, 2, 1050, -12, 4,
            ],

            # Exploratory Decider
            [
                68, 1450, 1, 3, 8,
                74, 1400, 5, 5,
                73, 1500, 2, 5,
                3, 7, 600, 11,
                0, 3, 1450, -20, 4,
            ],
        ],
        dtype=float,
    )

    rows = []

    for prototype in prototypes:
        for _ in range(20):
            noise = rng.normal(
                loc=0,
                scale=0.08,
                size=prototype.shape,
            )

            row = prototype * (1 + noise)

            rows.append(row)

    return np.array(rows, dtype=float)


# =========================================================
# TRAIN MODEL
# =========================================================

SEED_DATA = create_seed_dataset()

scaler = StandardScaler()

scaled_seed_data = scaler.fit_transform(
    SEED_DATA
)

model = KMeans(
    n_clusters=4,
    random_state=42,
    n_init=10,
)

model.fit(
    scaled_seed_data
)


# =========================================================
# REQUEST MODEL
# =========================================================

class PredictionRequest(BaseModel):
    features: Dict[str, float]


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "KMeans",
        "clusters": 4,
        "feature_count": len(
            FEATURE_NAMES
        ),
    }


# =========================================================
# PREDICT
# =========================================================

@app.post("/predict")
def predict(
    request: PredictionRequest
):
    vector = []

    for feature_name in FEATURE_NAMES:
        value = request.features.get(
            feature_name,
            0,
        )

        try:
            value = float(value)
        except (TypeError, ValueError):
            value = 0.0

        vector.append(value)

    input_vector = np.array(
        [vector],
        dtype=float,
    )

    scaled_vector = scaler.transform(
        input_vector
    )

    cluster = int(
        model.predict(
            scaled_vector
        )[0]
    )

    distances = model.transform(
        scaled_vector
    )[0]

    selected_distance = float(
        distances[cluster]
    )

    max_distance = float(
        np.max(distances)
    )

    if max_distance == 0:
        confidence = 100.0
    else:
        confidence = (
            1
            -
            selected_distance
            / max_distance
        ) * 100

        confidence = max(
            0,
            min(100, confidence),
        )

    return {
        "cluster": cluster,
        "profile": PROFILE_NAMES.get(
            cluster,
            "Observed Pattern",
        ),
        "confidence": round(
            confidence,
            2,
        ),
        "model": "KMeans",
        "message": (
            "Profile based on observed "
            "gameplay behaviour."
        ),
    }