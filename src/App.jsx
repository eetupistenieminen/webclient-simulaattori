import React, { useState, useEffect } from "react";
import mqtt from "mqtt";

// ... (same as before, shortened for clarity)
export default function App() {
  const [incoming, setIncoming] = useState([]);
  const [slot1, setSlot1] = useState([]);
  const [slot2, setSlot2] = useState([]);
  const [slot3, setSlot3] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [pickCount, setPickCount] = useState(1);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const mqttClient = mqtt.connect("wss://broker.emqx.io:8084/mqtt");
    mqttClient.on("connect", () => {
      mqttClient.subscribe("simulator/state");
      mqttClient.publish("simulator/command", JSON.stringify({ cmd: "state" }));
    });

    mqttClient.on("message", (topic, message) => {
      if (topic === "simulator/state") {
        const state = JSON.parse(message.toString());
        setIncoming(state.incoming || []);
        setSlot1(state.slot1 || []);
        setSlot2(state.slot2 || []);
        setSlot3(state.slot3 || []);
        setOutgoing(state.outgoing || []);
      }
    });

    setClient(mqttClient);
    return () => mqttClient.end();
  }, []);

  const sendCommand = (cmdObj) => {
    if (client) {
      client.publish("simulator/command", JSON.stringify(cmdObj));
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 700, margin: "auto" }}>
      <h1>📦 Varastosimulaattori</h1>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => sendCommand({ cmd: "fill" })}>Lataa varasto</button>
        <input
          type="number"
          min="1"
          max="9"
          value={pickCount}
          onChange={(e) => setPickCount(Math.max(1, Math.min(9, Number(e.target.value))))}
          style={{ margin: "0 10px", width: 40 }}
        />
        <button onClick={() => sendCommand({ cmd: "pick", count: pickCount })}>Nouda</button>
      </div>
      <BlockDisplay label="INCOMING" blocks={incoming} />
      <BlockDisplay label="SLOT 1" blocks={slot1} />
      <BlockDisplay label="SLOT 2" blocks={slot2} />
      <BlockDisplay label="SLOT 3" blocks={slot3} />
      <BlockDisplay label="OUTGOING" blocks={outgoing} />
    </div>
  );
}

function BlockDisplay({ label, blocks }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3>{label}</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {blocks.length > 0 ? (
          blocks.map((b, i) => <div key={i} style={{ background: "#eee", padding: "4px 8px", borderRadius: 4 }}>{b.id}</div>)
        ) : (
          <div style={{ fontStyle: "italic", color: "#999" }}>(tyhjä)</div>
        )}
      </div>
    </div>
  );
}
