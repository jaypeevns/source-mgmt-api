import express from 'express';
import cors from "cors";
import pkg from 'body-parser';
import { SOURCE_MGMT_CLIENT_ID, SOURCE_MGMT_CLIENT_SECRET } from './repo-config.js';
import axios from 'axios';


let app = express();

const { urlencoded, json } = pkg;

app.use(urlencoded({ extended: true }));
app.use(json());

app.use(cors());

app.get("/api/repos", (req, res) => {
    const { user, token } = req.query;
    axios({
        method: "get",
        url: `https://api.github.com/users/${user}/repos`,
        headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.mercy-preview+json" // MUST ADD TO INCLUDE TOPICS
        }
    }).then(response => {
        res.send(response.data);
    }).catch(err => {
        res.send(err);
    });
});
app.get("/oauth/redirect", (req, res) => {
    const { code, user } = req.query;
    console.log('Jay Code', code)
    axios({
        method: "get",
        url: `https://github.com/login/oauth/access_token`,
        headers: {
            "Accept": "application/json" // MUST ADD TO INCLUDE TOPICS
        },
        data: {
            "client_id": SOURCE_MGMT_CLIENT_ID,
            "client_secret": SOURCE_MGMT_CLIENT_SECRET,
            "code": code
        }
    }).then(response => {
        const token_reponse = response.data;
        const access_token = token_reponse["access_token"]
        const token_type = token_reponse["token_type"]
        console.log('token_reponse', token_reponse, access_token, token_type)
        axios({
            method: "get",
            url: `https://api.github.com/user`,
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
                "Accept": "application/vnd.github.mercy-preview+json" // MUST ADD TO INCLUDE TOPICS
            }
        }).then(response => {
            res.send({"userData": response.data, "token": access_token, "tokenType": token_type});
        }).catch(err => {
            console.log('jay Err2', err)
            res.send(err);
        });
    }).catch(err => {
        console.log('jay Err', err)
        res.send(err);
    });
});

const PORT = process.env.PORT || 3001;
export default app.listen(PORT, () => {
    console.log('Server running on port %d', PORT);
})