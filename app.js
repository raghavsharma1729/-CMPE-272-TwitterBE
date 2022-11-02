import express from "express";
import { Client, auth } from "twitter-api-sdk";
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import cors from 'cors';
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
const URL = process.env.URL || 'http://localhost';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

/**
 * Author: Raghav Sharma
*/
const authClient = new auth.OAuth2User({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    callback: `${URL}:8000/callback`,
    scopes: ["tweet.read", "tweet.write", "users.read"],
});
const client = new Client(authClient);

const STATE = "my-state";

app.get("/callback", async function (req, res) {
    try {
        const { code, state } = req.query;
        if (state !== STATE) return res.status(500).send("State isn't matching");
        await authClient.requestAccessToken(code);
        console.log(code);
        res.redirect(`${URL}:3000/create-tweet`);
    } catch (error) {
        console.log(error);
    }
});

app.get("/login", async function (req, res) {
    const authUrl = authClient.generateAuthURL({
        state: STATE,
        code_challenge_method: "s256",
    });
    res.send(authUrl);
});

app.get("/revoke", async function (req, res) {
    try {
        const response = await authClient.revokeAccessToken();
        res.send(response);
    } catch (error) {
        console.log(error);
    }
});

app.post("/tweets", async function (req, res) {
    try {
        const msg = req.body.text;
        console.log(msg);
        const response = await client.tweets.createTweet({
            "text": msg
        });
        console.log("response", JSON.stringify(response, null, 2));
        res.status(201).send(response);
    } catch (error) {
        console.log("tweets error", error);
    }
});
/**
 * Author: Sakshi Kekre
*/
app.delete("/tweets/:id", async function (req, res) {
    try {
        const id = req.params.id;
        console.log(msg);
        const response = await client.tweets.deleteTweetById(id,)
        console.log("response", JSON.stringify(response, null, 2));
        res.status(200).send(response);
    } catch (error) {
        console.log("tweets error", error);
    }
});

app.get("/tweets", async function (req, res) {
    try {
        const response = await client.tweets.tweetsRecentSearch({
            "query": "elon",
            "tweet.fields": [
                "author_id"
            ],
            "user.fields": [
                "name"
            ]
        });
        console.log("response", JSON.stringify(response, null, 2));
        res.send(response);
    } catch (error) {
        console.log("tweets error", error);
    }
});

app.listen(PORT, () => {
    console.log(`Go here to login: ${URL}:${PORT}/login`);
});
