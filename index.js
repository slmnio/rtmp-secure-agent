require("dotenv").config()
const fetch = require("node-fetch");
const express = require("express");
const app = express();
const cors = require("cors");

let agentStreams = [];

async function loadData() {
    const data = await fetch(process.env.BASE_URL + "/api/v1/streams").then(res => res.json());
    if (data.code) {
        return console.error(data);
    }
    agentStreams = (data.streams || []).filter(stream => (stream.video || stream.frames)).map(stream => {
        let streamName = stream.name;

        if (streamName.startsWith("live_")) {
            // this is a stream key - redact
            streamName = "relay_" + stream.name.split("_")?.[1];
        }

        const allowedKeys = [
            "app",
            "audio",
            "clients",
            "frames",
            "kpbs",
            "publish",
            "recv_bytes",
            "send_bytes",
            "video"
        ]

        const allowedData = { name: streamName }
        allowedKeys.forEach(key => allowedData[key] = stream[key])
        return allowedData
    })
}

setInterval(() => loadData(), 500);

app.get("/", (req, res) => res.send("data on /streams"))

app.get("/streams", cors(), async (req, res) => {
    return res.json(agentStreams)
})

app.listen(process.env.HTTP_PORT, () => {
    console.log(`Secure agent listening on :${process.env.HTTP_PORT}`)
})
