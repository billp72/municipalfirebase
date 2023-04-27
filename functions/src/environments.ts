require("dotenv").config();

const config = {
//   apiKey: process.env.VONNAGEAPIKEY,
//   apiSecret: process.env.VONNAGESECRET,
//   applicationId: process.env.VONNAGEAPPLICATIONID,
  accountSid: process.env.ACCOUNTSIDTWILIO,
  authToken: process.env.AUTHTOKENTWILIO,
  //revenuecat_webhook_auth: process.env.REVENUECATAUTHTOKEN,
  projectId: process.env.PROJECTID,
  //mixedpanel: process.env.MIXEDPANEL,
  email: {
    user: process.env.EMAILUSER, // generated ethereal user
    pass: process.env.EMAILPASSWORD, // generated ethereal password
  }
};

export default config;