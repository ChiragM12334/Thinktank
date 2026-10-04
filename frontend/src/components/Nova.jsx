import { useEffect, useState } from "react";
import "./Nova.css";

function Nova({
  message = "Ready?",
  expression = "neutral",
  visible = true,
  typing = false,
}) {
  const [isBlinking, setIsBlinking] = useState(false);

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

  if (!visible) {
    return null;
  }

  return (
    <div className="nova-wrapper">
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

      <div className={`nova-character nova-${expression}`}>
        <div className="nova-glow" />

        <div className="nova-body">
          <div className="nova-head">
            <div className="nova-face">
              <div
                className={`nova-eye nova-eye-left ${
                  isBlinking ? "nova-blink" : ""
                }`}
              />

              <div
                className={`nova-eye nova-eye-right ${
                  isBlinking ? "nova-blink" : ""
                }`}
              />

              <div className="nova-mouth" />
            </div>

            <div className="nova-head-line" />
          </div>

          <div className="nova-neck" />

          <div className="nova-core">
            <div className="nova-core-ring" />
            <div className="nova-core-dot" />
          </div>

          <div className="nova-arm nova-arm-left" />
          <div className="nova-arm nova-arm-right" />

          <div className="nova-base">
            <div className="nova-base-light" />
          </div>
        </div>

        <div className="nova-shadow" />
      </div>

      <div className="nova-nameplate">
        <span>NOVA</span>
        <small>ADAPTIVE GUIDE</small>
      </div>
    </div>
  );
}

export default Nova;