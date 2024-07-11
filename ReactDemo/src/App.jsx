import { useState } from "react";
import axios from "axios";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
    const [tokenData, setTokenData] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loanInfo, setLoanInfo] = useState(null);

    /*
    useEffect(() => {
        const fetchData = async () => {
            try {
                // demo #1 - smart ware calls to local server. local server calls to salesforce
                const response1 = await axios.get("http://localhost:5002/replace_with_your_server/token");
                // store the token data in the state
                setTokenData(response1.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);
    */

    // demo #1 - Get the access token
    const getAccessToken = async () => {
        try {
            // express app will ask for the token for each request
            const response = await axios.get("http://localhost:5002/replace_with_your_server/token");

            // store the token data in the state
            setTokenData(response.data);

            console.log("tokenData", JSON.stringify(response.data));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // demo #2 - Get the user info
    const getUserInfo = async () => {
        // !important! for authenticated users, place the email in the header
        try {
            const response = await axios.get("http://localhost:5002/replace_with_your_server/user", {
                headers: {
                    email: "todd@thedominiongroup.com", //<-- replace portal user email after authentication
                },
            });

            // store the user info in the state
            setUserInfo(response.data);

            /* important! only active portal users will return the following JSON
                "PortalUser": {
                    "email": "string",
                    "portalUserId": "string" <-- use this id for the next call
                }
            */

            console.log("userInfo", JSON.stringify(response.data));
        } catch (error) {
            console.log("Error status", error.response.status);
            console.log("error message", error.response.data);
        }
    };

    // demo #3 - Get the loan info
    const getLoanInfo = async () => {
        if (!userInfo) {
            console.error("User data is not available");
            return;
        }

        try {
            const response = await axios.get("http://localhost:5002/replace_with_your_server/loans", {
                headers: {
                    portaluserid: userInfo.portalUserId, //<-- use the portalUserId from the previous call
                },
            });

            // store loan info in the state
            setLoanInfo(response.data);

            /* important! only viewable loans will return the following JSON
            {
                "user": {
                    "email": "string",
                    "portalUserId": "string"
                },
                "loans": [
                    {
                        "loanId": "string",
                        "loanName": "string",
                        "dfsLoanNumber": "string",
                        "originalLoanBalance": "number",
                        "repairReserveAmount": "number",
                        "interestMethod": "string",
                        "remainingRepairReserveBalance": "number",
                        "currentUnpaidBalance": "number",
                        "mdpBalance": "number",
                        "mdpSchedule": "string",
                        "originalMaturityDate": "string",
                        "revisedMaturityDate": "string",
                        "properties": [
                            {
                                "propertyId": "string",
                                "address": "string",
                                "city": "string",
                                "state": "string",
                                "zip": "string"
                            }
                        ]
                    }
                ]
            }
            */

            console.log("loanInfo", JSON.stringify(response.data));
        } catch (error) {
            console.log("Error status", error.response.status);
            console.log("error message", error.response.data);
        }
    };

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>DFS Portal REST API Demo + OAuth</h1>
            <div className="card">
                <button onClick={() => getAccessToken()}>Demo Get Token</button>
                <button onClick={() => getUserInfo()}>Demo Get User Info</button>
                <button onClick={() => getLoanInfo()}>Demo Get Loan Info</button>
            </div>
        </>
    );
}

export default App;
