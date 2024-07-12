import { useState } from 'react';
import axios from 'axios';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [tokenData, setTokenData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loanInfo, setLoanInfo] = useState(null);
  // file state
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // demo #1 - Get the access token
  const getAccessToken = async () => {
    try {
      // express app will ask for the token for each request
      const response = await axios.get(
        'http://localhost:5002/replace_with_your_server/token'
      );

      // store the token data in the state
      setTokenData(response.data);

      console.log('tokenData', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // demo #2 - Get the user info
  const getUserInfo = async () => {
    // !important! for authenticated users, place the email in the header
    try {
      const response = await axios.get(
        'http://localhost:5002/replace_with_your_server/user',
        {
          headers: {
            email: 'todd@thedominiongroup.com', //<-- replace portal user email after authentication
          },
        }
      );

      // store the user info in the state
      setUserInfo(response.data);

      /* important! only active portal users will return the following JSON
                "PortalUser": {
                    "email": "string",
                    "portalUserId": "string" <-- use this id for the next call
                }
            */

      console.log('userInfo', JSON.stringify(response.data));
    } catch (error) {
      console.log('Error status', error.response.status);
      console.log('error message', error.response.data);
    }
  };

  // demo #3 - Get the loan info
  const getLoanInfo = async () => {
    if (!userInfo) {
      console.error('User data is not available');
      return;
    }

    try {
      const response = await axios.get(
        'http://localhost:5002/replace_with_your_server/loans',
        {
          headers: {
            portaluserid: userInfo.portalUserId, //<-- use the portalUserId from the previous call
          },
        }
      );

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

      console.log('loanInfo', JSON.stringify(response.data));
    } catch (error) {
      console.log('Error status', error.response.status);
      console.log('error message', error.response.data);
    }
  };

  // demo #4 - Handle file upload
  const handleFileChange = e => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('Please select files to upload');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    try {
      const response = await axios.post(
        `/api/upload/${userInfo.portalUserId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(
        `Error uploading files: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setUploading(false);
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
      <div className="card">
        <input type="file" multiple onChange={handleFileChange} />
        {files.length > 0 && (
          <div>
            <h4>Selected Files:</h4>
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  {file.name} - {(file.size / 1024).toFixed(2)} KB
                </li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {message && <p>{message}</p>}
      </div>
    </>
  );
}

export default App;
