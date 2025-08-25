from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

logs = []  # In-memory log storage
# Brute force tracking
bruteforce_counts = {}
bruteforce_alerted = set()

# Email config
TO_EMAIL = "shaikhminhaz1975@gmail.com"
FROM_EMAIL = "openplc23x@gmail.com"
FROM_PASSWORD = "ppqruavfrjjphirr"

from email_utils import send_bruteforce_alert

@app.route("/logs", methods=["POST"])

def receive_logs():
    data = request.get_json()
    if not data or "log" not in data:
        return jsonify({"error": "No log found"}), 400
    log_line = data["log"]
    logs.append(log_line)
    print(log_line, end="")

    # Brute force detection and alert
    if "brute force" in log_line.lower():
        import re
        match = re.search(r"SRC=([\d.]+)", log_line)
        if match:
            ip = match.group(1)
            bruteforce_counts[ip] = bruteforce_counts.get(ip, 0) + 1
            if bruteforce_counts[ip] == 50 and ip not in bruteforce_alerted:
                print(f"[ALERT] Sending brute force alert email for IP {ip} to {TO_EMAIL}")
                send_bruteforce_alert(ip, TO_EMAIL, FROM_EMAIL, FROM_PASSWORD)
                bruteforce_alerted.add(ip)
            elif bruteforce_counts[ip] == 50:
                print(f"[INFO] Alert already sent for IP {ip}, skipping email.")

    return jsonify({"status": "ok"}), 200


# SSE endpoint for real-time log streaming
from flask import Response
import time

@app.route("/stream")
def stream():
    def event_stream():
        last_index = 0
        while True:
            if last_index < len(logs):
                for log in logs[last_index:]:
                    yield f"data: {log}\n\n"
                last_index = len(logs)
            time.sleep(1)
    return Response(event_stream(), mimetype="text/event-stream")

# Web interface to display logs with live updates
@app.route("/")
def show_logs():
    return """
    <html>
    <head>
        <title>SIEM Logs</title>
        <style>
            body {{ font-family: monospace; background: #181818; color: #e0e0e0; }}
            .log {{ white-space: pre-wrap; }}
        </style>
    </head>
    <body>
        <h2>SIEM Logs (Live)</h2>
        <div id='log' class='log'></div>
        <script>
            var logDiv = document.getElementById('log');
            var evtSource = new EventSource('/stream');
            evtSource.onmessage = function(e) {{
                logDiv.innerHTML += e.data + '<br>';
                logDiv.scrollTop = logDiv.scrollHeight;
            }};
        </script>
    </body>
    </html>
    """

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
