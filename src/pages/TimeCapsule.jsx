import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../firebase";
import {
  Lock,
  Unlock,
  Sparkles,
  Clock,
  Shield,
  Send,
  X,
  Plus,
  Compass,
} from "lucide-react";
import "./timecapsule.css";

export default function TimeCapsule({ roomId, gradYear = "2026" }) {
  const [predictions, setPredictions] = useState([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [careerPrediction, setCareerPrediction] = useState("");
  const [lifeWish, setLifeWish] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Calculate 5-year reunion date (e.g. May 30, 2031)
  const baseYear = parseInt(gradYear, 10) || 2026;
  const reunionDate = new Date(`${baseYear + 5}-05-30T00:00:00`);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });

  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = reunionDate.getTime() - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft({ days, hours });
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [reunionDate]);

  // Subscribe to predictions
  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, "rooms", roomId, "timecapsule"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPredictions(data);
    });
    return () => unsub();
  }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!careerPrediction.trim() || submitting || !uid) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "rooms", roomId, "timecapsule"), {
        authorId: uid,
        authorName: currentUser.displayName || "Classmate",
        careerPrediction: careerPrediction.trim(),
        lifeWish: lifeWish.trim(),
        createdAt: serverTimestamp(),
      });

      setCareerPrediction("");
      setLifeWish("");
      setIsComposerOpen(false);
    } catch (err) {
      alert("Failed to seal prediction: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasSubmitted = predictions.some((p) => p.authorId === uid);

  return (
    <div className="timecapsule-container animate-fade-in">
      {/* Vault Hero Card */}
      <div className="vault-hero-card">
        <div className="vault-seal-icon">
          <Lock size={32} />
        </div>
        <h2>Class of {gradYear} Reunion Vault</h2>
        <p>
          Senior predictions and cherished memories sealed in time until our official <strong>5-Year Reunion ({baseYear + 5})</strong>.
        </p>

        <div className="reunion-countdown-strip">
          <div className="reunion-time-unit">
            <div className="reunion-val">{timeLeft.days}</div>
            <div className="reunion-lbl">Days Left</div>
          </div>
          <div className="reunion-time-unit">
            <div className="reunion-val">{timeLeft.hours}</div>
            <div className="reunion-lbl">Hours</div>
          </div>
          <div className="reunion-time-unit">
            <div className="reunion-val">{baseYear + 5}</div>
            <div className="reunion-lbl">Unlock Year</div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsComposerOpen(true)}
        >
          <Sparkles size={16} />
          <span>{hasSubmitted ? "Update Sealed Prediction" : "Seal a 5-Year Prediction"}</span>
        </button>
      </div>

      {/* Predictions Stream */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: "1.25rem", color: "#fff", marginBottom: 4 }}>
          Sealed Senior Predictions ({predictions.length})
        </h3>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
          Future hopes, career ambitions, and promises to our future selves.
        </p>
      </div>

      {predictions.length === 0 ? (
        <div className="empty-cohort-state">
          <Clock className="empty-cohort-icon" color="var(--gold-primary)" />
          <h4>The vault is awaiting its first entry</h4>
          <p>Write your 5-year prediction to seal the first memory into the reunion vault.</p>
        </div>
      ) : (
        <motion.div className="predictions-grid" layout>
          <AnimatePresence>
            {predictions.map((p) => {
              const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
                p.authorName || p.authorId
              )}&backgroundColor=141924`;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="prediction-card"
                >
                  <div className="prediction-header">
                    <img src={avatarUrl} alt={p.authorName} className="prediction-avatar" />
                    <div>
                      <h4 style={{ color: "#fff", fontSize: "0.9375rem", margin: 0 }}>
                        {p.authorName}
                      </h4>
                      <span className="badge-titanium" style={{ marginTop: 4 }}>
                        <Shield size={10} />
                        <span>Sealed Vault Record</span>
                      </span>
                    </div>
                  </div>

                  <div className="prediction-quote">
                    "{p.careerPrediction}"
                  </div>

                  {p.lifeWish && (
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      Message to future self: "{p.lifeWish}"
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Composer Modal */}
      {isComposerOpen && (
        <div className="autograph-composer-overlay animate-fade-in" onClick={() => setIsComposerOpen(false)}>
          <div className="autograph-composer-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: "1.2rem", color: "#fff", margin: 0 }}>
                Seal Your 5-Year Prediction
              </h3>
              <button className="btn-ghost btn-sm" onClick={() => setIsComposerOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Where do you predict you will be in 5 years ({baseYear + 5})?
                </label>
                <textarea
                  className="input-base"
                  style={{ minHeight: "100px", resize: "vertical" }}
                  placeholder="e.g. Leading an AI startup in San Francisco, married, and travelling the Mediterranean..."
                  value={careerPrediction}
                  onChange={(e) => setCareerPrediction(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  One promise or message to your future self (Optional)
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="e.g. Remember to stay curious and always call mom."
                  value={lifeWish}
                  onChange={(e) => setLifeWish(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsComposerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !careerPrediction.trim()}>
                  <Lock size={14} />
                  <span>{submitting ? "Sealing..." : "Seal into Vault"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
