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
    if (!roomUrl || !containerRef.current) return;

    const roomName = roomUrl.split("/").pop();

    async function iniciarJitsi() {
      try {
        setLoading(true);
        setError("");

        await carregarScript();

        if (!window.JitsiMeetExternalAPI) {
          throw new Error("Jitsi não carregou.");
        }

        // destruir instância anterior
        if (apiRef.current) {
          apiRef.current.dispose();
          apiRef.current = null;
        }

        const api = new window.JitsiMeetExternalAPI(
          "meet.jit.si",
          {
            roomName,
            parentNode: containerRef.current,
            width: "100%",
            height: "100%",

            userInfo: {
              displayName: userName
            },

            configOverwrite: {
              prejoinPageEnabled: false,
              startWithAudioMuted: false,
              startWithVideoMuted: false
            },

            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false
            }
          }
        );

        apiRef.current = api;

        console.log("Sala:", roomName);

        // evento principal
        api.addEventListener(
          "videoConferenceJoined",
          () => {
            console.log("Entrou na call");
            setLoading(false);
          }
        );

        // fallback: remove loading quando iframe estiver pronto
        api.addEventListener(
          "participantJoined",
          () => {
            setLoading(false);
          }
        );

        // fallback extra
        setTimeout(() => {
          setLoading(false);
        }, 3000);

        api.addEventListener(
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
        apiRef.current = null;
      }
    };
  }, [roomUrl, userName]);

  function carregarScript() {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://meet.jit.si/external_api.js"]'
      );

      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://meet.jit.si/external_api.js";

      script.async = true;

      script.onload = resolve;

      script.onerror = () => {
        reject(
          new Error("Erro ao carregar Jitsi")
        );
      };

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
        position: "relative"
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
            zIndex: 999
          }}
        >
          Conectando à consulta...
        </div>
      )}

      {error && (
        <div
          style={{
            color: "red",
            padding: 30
          }}
        >
          {error}
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%"
        }}
      />
    </div>
  );
}