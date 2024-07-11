const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

/*------------------------------------------------------------------------------------------------------------------------
 *
 *  API Endpoints
 *
 ------------------------------------------------------------------------------------------------------------------------*/

// demo #1 - obtain the token
app.get("/replace_with_your_server/token", async (req, res) => {
    try {
        const tokenData = await getAccessToken();

        console.log("tokenData", JSON.stringify(tokenData));

        res.json(tokenData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// demo #2 - obtain the token, then pass authenticated email in header
app.get("/replace_with_your_server/user", async (req, res) => {
    try {
        const { accessToken, instanceUrl } = await getAccessToken();

        // important! set 1) Bearer token and 2) email in the header
        const email = req.headers["email"];
        const response = await axios.get(`${instanceUrl}/services/apexrest/portal/user`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                email: email,
            },
        });

        console.log("user response", JSON.stringify(response.data));

        // for demo, pass the response from salesforce to the client
        res.status(response.status).json(response.data);
    } catch (error) {
        // for demo, pass the error response from salesforce to the client
        res.status(error.response.status).json(error.response.data);
    }
});

// demo #3 - obtain the token, then pass authenticated portalUserId in header for loan data
app.get("/replace_with_your_server/loans", async (req, res) => {
    try {
        const { accessToken, instanceUrl } = await getAccessToken();

        const portalUserId = req.headers["portaluserid"];

        const response = await axios.get(`${instanceUrl}/services/apexrest/portal/loans`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                portaluserid: portalUserId,
            },
        });

        console.log("loan response", JSON.stringify(response.data));

        // for demo, pass the response from salesforce to the client
        res.status(response.status).json(response.data);
    } catch (error) {
        // for demo, pass the error response from salesforce to the client
        res.status(error.response.status).json(error.response.data);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

/*------------------------------------------------------------------------------------------------------------------------
 *
 *  Get Access Token
 *
 ------------------------------------------------------------------------------------------------------------------------*/
const getAccessToken = async () => {
    const form = new FormData();
    form.append("grant_type", "password");
    form.append("client_id", process.env.CONSUMER_KEY);
    form.append("client_secret", process.env.CONSUMER_SECRET);
    form.append("username", process.env.USERNAME);
    form.append("password", process.env.PASSWORD);

    try {
        const response = await axios.post(process.env.API_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        return { accessToken: response.data.access_token, instanceUrl: response.data.instance_url };
    } catch (error) {
        console.log("Error response: ", error.response ? error.response.data : error.message);
        throw new Error("Failed to fetch token");
    }
};
