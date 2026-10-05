import { useEffect, useRef, useState } from "react";
import "./Nova.css";

/* =========================================================
   NOVA — MICRO SOUND ENGINE
========================================================= */

const playNovaSound = (expression = "neutral") => {
  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    const context = new AudioContext();

    const playTone = (
      frequency,
      startOffset,
      duration,
      volume
    ) => {
      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        frequency,
        context.currentTime + startOffset
      );

      gain.gain.setValueAtTime(
        0,
        context.currentTime + startOffset
      );

      gain.gain.linearRampToValueAtTime(
        volume,
        context.currentTime +
          startOffset +
          0.025
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime +
          startOffset +
          duration
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(
        context.currentTime + startOffset
      );

      oscillator.stop(
        context.currentTime +
          startOffset +
          duration +
          0.05
      );
    };

    const startAudio = async () => {
      try {
        if (context.state === "suspended") {
          await context.resume();
        }

        switch (expression) {
          case "happy":
            playTone(
              620,
              0,
              0.13,
              0.13
            );

            playTone(
              820,
              0.09,
              0.16,
              0.11
            );
            break;

          case "thinking":
            playTone(
              390,
              0,
              0.16,
              0.10
            );

            playTone(
              500,
              0.14,
              0.20,
              0.08
            );
            break;

          case "alert":
            playTone(
              300,
              0,
              0.12,
              0.13
            );

            playTone(
              235,
              0.12,
              0.16,
              0.10
            );
            break;

          default:
            playTone(
              480,
              0,
              0.10,
              0.08
            );
            break;
        }

        setTimeout(() => {
          context.close();
        }, 850);
      } catch (error) {
        console.debug(
          "Nova audio unavailable:",
          error
        );

        try {
          context.close();
        } catch {
          // Ignore audio cleanup errors.
        }
      }
    };

    startAudio();
  } catch (error) {
    console.debug(
      "Nova sound engine unavailable:",
      error
    );
  }
};

function Nova({
  message = "Ready?",
  expression = "neutral",
  visible = true,
  typing = false,
}) {
  const [isBlinking, setIsBlinking] =
    useState(false);

  const firstMessage = useRef(true);

  /* =========================================================
     BLINK
  ========================================================= */

  useEffect(() => {
    if (!visible) {
      return;
    }

    const blinkTimer = setInterval(() => {
      setIsBlinking(true);

      setTimeout(() => {
        setIsBlinking(false);
      }, 140);
    }, 3600);

    return () => clearInterval(blinkTimer);
  }, [visible]);

  /* =========================================================
     SOUND
  ========================================================= */

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (firstMessage.current) {
      firstMessage.current = false;
      return;
    }

    playNovaSound(expression);
  }, [message, expression, visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="nova-wrapper">

      {/* MESSAGE */}

      <div className="nova-message">
        <span className="nova-message-dot" />

        <div className="nova-message-text">
          {typing ? (
            <span className="nova-typing">
              <i />
              <i />
              <i />
            </span>
          ) : (
            message
          )}
        </div>
      </div>

      {/* CHARACTER */}

      <div
        className={`nova-character nova-${expression}`}
      >
        <div className="nova-glow" />

        <div className="nova-body">

          {/* HEAD */}

          <div className="nova-head">

            <div className="nova-face">

              <div className="nova-brow nova-brow-left" />
              <div className="nova-brow nova-brow-right" />

              <div
                className={`nova-eye nova-eye-left ${
                  isBlinking
                    ? "nova-blink"
                    : ""
                }`}
              >
                <span className="nova-pupil" />
              </div>

              <div
                className={`nova-eye nova-eye-right ${
                  isBlinking
                    ? "nova-blink"
                    : ""
                }`}
              >
                <span className="nova-pupil" />
              </div>

              <div className="nova-mouth" />

            </div>

            <div className="nova-head-line" />

          </div>

          {/* NECK */}

          <div className="nova-neck" />

          {/* CORE */}

          <div className="nova-core">
            <div className="nova-core-ring" />
            <div className="nova-core-dot" />
          </div>

          {/* ARMS */}

          <div className="nova-arm nova-arm-left" />
          <div className="nova-arm nova-arm-right" />

          {/* BASE */}

          <div className="nova-base">
            <div className="nova-base-light" />
          </div>

        </div>

        <div className="nova-shadow" />

      </div>

      {/* NAME */}

      <div className="nova-nameplate">
        <span>NOVA</span>
        <small>ADAPTIVE GUIDE</small>
      </div>

    </div>
  );
}

export default Nova;