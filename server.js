require("dotenv").config();
const express = require("express");
const axios = require("axios");
const querystring = require("querystring");

const app = express();
const PORT = 5000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI; // URL de redirecionamento após login do usuário
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";

let access_token = "";
let refresh_token = "";

// 🔗 URL de login do Spotify para o usuário autorizar o app
app.get("/login", (req, res) => {
    const scope = "user-read-currently-playing user-read-playback-state user-library-read user-modify-playback-state";
    const authURL = `${SPOTIFY_AUTH_URL}?${querystring.stringify({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope,
    })}`;

    res.redirect(authURL);
});

// 🔄 Callback após o usuário logar no Spotify
app.get("/callback", async (req, res) => {
    const code = req.query.code || null;

    try {
        const response = await axios.post("https://accounts.spotify.com/api/token", 
        querystring.stringify({
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        access_token = response.data.access_token;
        refresh_token = response.data.refresh_token;

        console.log("✅ Login bem-sucedido! Tokens recebidos.");
        res.send("Login bem-sucedido! Agora você pode acessar /spotify.");
    } catch (error) {
        console.error("❌ Erro ao obter tokens:", error.response?.data || error.message);
        res.send("Erro ao obter tokens.");
    }
});

// 🔄 Função para renovar o token automaticamente
async function refreshAccessToken() {
    try {
        const response = await axios.post("https://accounts.spotify.com/api/token", 
        querystring.stringify({
            grant_type: "refresh_token",
            refresh_token,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        access_token = response.data.access_token;
        console.log("🔄 Token atualizado automaticamente.");
    } catch (error) {
        console.error("❌ Erro ao renovar token:", error.response?.data || error.message);
    }
}

// 🎵 Rota para buscar a música atual tocando no Spotify
app.get("/spotify", async (req, res) => {
    if (!access_token) {
        return res.send("⚠️ Você precisa fazer login em /login primeiro!");
    }

    try {
        const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        if (response.data && response.data.item) {
            const track = response.data.item.name;
            const artist = response.data.item.artists.map(artist => artist.name).join(", ");
            res.send(`${artist} - ${track}`);
        } else {
            res.send("Nenhuma música tocando no momento.");
        }
    } catch (error) {
        console.error("⚠️ Erro ao obter música do Spotify:", error.response?.data || error.message);
        res.status(500).send("Erro ao buscar música.");
    }
});

app.get("/spotify/previous", async (req, res) => {
    if (!access_token) {
        return res.send("⚠️ Você precisa fazer login em /login primeiro!");
    }

    try {
        await axios.post("https://api.spotify.com/v1/me/player/previous", {}, {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        res.send("⏪ Música anterior!");
    } catch (error) {
        console.error("⚠️ Erro ao voltar faixa:", error.response?.data || error.message);
        res.status(500).send("Erro ao voltar faixa.");
    }
});

app.get("/spotify/next", async (req, res) => {
    if (!access_token) {
        return res.send("⚠️ Você precisa fazer login em /login primeiro!");
    }

    try {
        await axios.post("https://api.spotify.com/v1/me/player/next", {}, {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        res.send("⏭ Próxima faixa!");
    } catch (error) {
        console.error("⚠️ Erro ao avançar faixa:", error.response?.data || error.message);
        res.status(500).send("Erro ao avançar faixa.");
    }
});


app.get("/beat", async (req, res) => {
    if (!access_token) {
        return res.send("⚠️ Você precisa fazer login em /login primeiro!");
    }

    try {
        // Obtém a música atual
        const nowPlaying = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        if (!nowPlaying.data || !nowPlaying.data.item) {
            return res.send("Nenhuma música tocando no momento.");
        }

        const track_id = nowPlaying.data.item.id;

        // Obtém a análise da música
        const analysis = await axios.get(`https://api.spotify.com/v1/audio-analysis/${track_id}`, {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const beats = analysis.data.beats; // Array de batidas
        const tempo = analysis.data.tempo; // BPM da música

        res.json({ beats, tempo });
    } catch (error) {
        console.error("⚠️ Erro ao obter análise da música:", error.response?.data || error.message);
        res.status(500).send("Erro ao buscar análise da música.");
    }
});


// 🚀 Inicia o servidor na porta 5000
app.listen(PORT, () => console.log(`🔥 Servidor rodando em http://localhost:${PORT}`));
