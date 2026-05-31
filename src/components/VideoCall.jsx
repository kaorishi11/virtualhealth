import { useEffect, useRef, useState } from "react";

export default function VideoCall({
  roomUrl,
  userName,
  onCallEnd
}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomUrl) return;

    const roomName = roomUrl.split("/").pop();

    async function iniciarJitsi() {
      try {
        setLoading(true);

        // Esperar script carregar
        await carregarScript();

        if (!window.JitsiMeetExternalAPI) {
          throw new Error("JitsiMeetExternalAPI não carregou");
        }

        apiRef.current = new window.JitsiMeetExternalAPI(
          "meet.jit.si",
          {
            roomName,
            parentNode: containerRef.current,
            width: "100%",
            height: "100%",

            userInfo: {
              displayName: userName,
            },

            configOverwrite: {
              prejoinPageEnabled: false,
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableModeratorIndicator: true,
            },

            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
            }
          }
        );

        apiRef.current.addEventListener(
          "videoConferenceJoined",
          () => {
            console.log("Entrou na call");
            setLoading(false);
          }
        );

        apiRef.current.addEventListener(
          "readyToClose",
          () => {
            if (onCallEnd) onCallEnd();
          }
        );
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    }

    iniciarJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomUrl]);

  function carregarScript() {
    return new Promise((resolve, reject) => {
      // já carregou
      if (window.JitsiMeetExternalAPI) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://meet.jit.si/external_api.js"]'
      );

      if (existingScript) {
        existingScript.onload = resolve;
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://meet.jit.si/external_api.js";

      script.async = true;

      script.onload = () => resolve();

      script.onerror = () =>
        reject(new Error("Erro ao carregar Jitsi"));

      document.body.appendChild(script);
    });
  }

  return (
    <div
      style={{
        width: "100%",
        height: "700px",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#111",
        position: "relative",
      }}
    >
      {loading && !error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            zIndex: 10,
          }}
        >
          Conectando à consulta...
        </div>
      )}

      {error && (
        <div
          style={{
            color: "red",
            padding: 30,
          }}
        >
          ❌ {error}
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}