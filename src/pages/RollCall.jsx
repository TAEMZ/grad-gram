import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import confetti from "canvas-confetti";
import "./RollCall.css";

function RollCall({ roomId, gradYear = "2026" }) {
  const [names, setNames] = useState([]);

  useEffect(() => {
    async function fetchNames() {
      try {
        const memberCol = collection(db, "rooms", roomId, "members");
        const memberSnap = await getDocs(memberCol);
        const loadedNames = await Promise.all(
          memberSnap.docs.map(async (d) => {
            const userSnap = await getDoc(doc(db, "users", d.id));
            return userSnap.data()?.displayName || "Anonymous Graduate";
          })
        );
        setNames(loadedNames);
      } catch (e) {
        console.error("Error fetching roll call names:", e);
      }
    }
    if (roomId) fetchNames();
  }, [roomId]);

  useEffect(() => {
    // Trigger confetti burst on mount
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rollcall-container animate-fade-in">
      <div className="rollcall-header">
        <h1>Class of {gradYear}</h1>
        <p>The Leaders, The Scholars, The Graduates.</p>
      </div>

      <div className="credits-wrapper">
        <div className="credits-scroll">
          {names.map((name, index) => (
            <div key={index} className="credit-item">
              {name}
            </div>
          ))}
          <div className="credit-item highlight">AND YOU</div>
        </div>
      </div>
    </div>
  );
}

export default RollCall;
