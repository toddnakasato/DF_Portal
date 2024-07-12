const express = require('express')
const axios = require('axios')
const cors = require('cors')
const bodyParser = require('body-parser')
const FormData = require('form-data')
const multer = require('multer')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())
app.use(bodyParser.json())

/*------------------------------------------------------------------------------------------------------------------------
 *
 *  API Endpoints
 *
 ------------------------------------------------------------------------------------------------------------------------*/

// demo #1 - obtain the token
app.get('/replace_with_your_server/token', async (req, res) => {
  try {
    const tokenData = await getAccessToken()

    console.log('tokenData', JSON.stringify(tokenData))

    res.json(tokenData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// demo #2 - obtain the token, then pass authenticated email in header
app.get('/replace_with_your_server/user', async (req, res) => {
  try {
    const { accessToken, instanceUrl } = await getAccessToken()

    // important! set 1) Bearer token and 2) email in the header
    const email = req.headers['email']
    const response = await axios.get(
      `${instanceUrl}/services/apexrest/portal/user`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          email: email
        }
      }
    )

    console.log('user response', JSON.stringify(response.data))

    // for demo, pass the response from salesforce to the client
    res.status(response.status).json(response.data)
  } catch (error) {
    // for demo, pass the error response from salesforce to the client
    res.status(error.response.status).json(error.response.data)
  }
})

// demo #3 - obtain the token, then pass authenticated portalUserId in header for loan data
app.get('/replace_with_your_server/loans', async (req, res) => {
  try {
    const { accessToken, instanceUrl } = await getAccessToken()

    const portalUserId = req.headers['portaluserid']

    const response = await axios.get(
      `${instanceUrl}/services/apexrest/portal/loans`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          portaluserid: portalUserId
        }
      }
    )

    console.log('loan response', JSON.stringify(response.data))

    // for demo, pass the response from salesforce to the client
    res.status(response.status).json(response.data)
  } catch (error) {
    // for demo, pass the error response from salesforce to the client
    res.status(error.response.status).json(error.response.data)
  }
})

// demo #4 - upload files to Salesforce
app.post(
  '/replace_with_your_server/eventdata',
  upload.array('file'),
  async (req, res) => {
    try {
      const portalUserId = req.headers.portaluserid
      const files = req.files

      const salesforceResponse = await handleUploadFilesToSalesforce(
        files,
        portalUserId
      )

      console.log(
        'Salesforce upload response',
        JSON.stringify(salesforceResponse)
      )

      res.json({ message: 'Files uploaded successfully', salesforceResponse })
    } catch (error) {
      console.error('Error in file upload route:', error.message)
      res.status(400).json({ message: error.message })
    }
  }
)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

/*------------------------------------------------------------------------------------------------------------------------
 *
 *  Get Access Token
 *
 ------------------------------------------------------------------------------------------------------------------------*/
const getAccessToken = async () => {
  const form = new FormData()
  form.append('grant_type', 'password')
  form.append('client_id', process.env.CONSUMER_KEY)
  form.append('client_secret', process.env.CONSUMER_SECRET)
  form.append('username', process.env.USERNAME)
  form.append('password', process.env.PASSWORD)

  try {
    const response = await axios.post(process.env.API_URL, form, {
      headers: {
        ...form.getHeaders()
      }
    })

    return {
      accessToken: response.data.access_token,
      instanceUrl: response.data.instance_url
    }
  } catch (error) {
    console.log(
      'Error response: ',
      error.response ? error.response.data : error.message
    )
    throw new Error('Failed to fetch token')
  }
}

/*------------------------------------------------------------------------------------------------------------------------
 *
 *  Helper Methods to Upload Files to Salesforce
 *
 ------------------------------------------------------------------------------------------------------------------------*/
async function handleUploadFilesToSalesforce(files, portalUserId, eventData) {
  // Error checking for portalUserId
  if (!portalUserId) {
    throw new Error('Portal User ID is required')
  }

  // Error checking for eventData
  if (!eventData || typeof eventData !== 'object') {
    throw new Error('Event data must be a valid object')
  }

  try {
    const { accessToken, instanceUrl } = await getAccessToken()

    const formData = new FormData()

    // Append files to formData
    if (!files || !Array.isArray(files) || files.length === 0) {
      files.forEach((file, index) => {
        if (file && file.buffer && file.originalname) {
          formData.append(`file-${index}`, file.buffer, file.originalname)
        } else {
          console.warn(`Skipping invalid file at index ${index}`)
        }
      })
    }

    // Append eventData to formData
    formData.append('eventData', JSON.stringify(eventData))

    const response = await axios.post(
      `${instanceUrl}/services/apexrest/portal/eventdata`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${accessToken}`,
          portaluserid: portalUserId
        }
      }
    )

    return response.data
  } catch (error) {
    console.error('Error in handleUploadFilesToSalesforce:', error.message)
    throw new Error(`Failed to upload files to Salesforce: ${error.message}`)
  }
}
