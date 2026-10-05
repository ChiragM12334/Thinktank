const ML_API_URL =
  import.meta.env.VITE_ML_API_URL ||
  "http://127.0.0.1:8000";

export const predictBehaviorProfile = async (
  numericFeatures
) => {
  try {
    const response = await fetch(
      `${ML_API_URL}/predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          features: numericFeatures,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `ML API returned ${response.status}`
      );
    }

    const result = await response.json();

    console.log(
      "THINKTANK ML PREDICTION:",
      result
    );

    return result;
  } catch (error) {
    console.error(
      "THINKTANK ML CONNECTION ERROR:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};