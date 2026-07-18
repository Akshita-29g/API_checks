// /**
//  * whatsapp.js — WhatsApp Cloud API helper
//  * =========================================
//  * Sends text messages via Meta's WhatsApp Cloud API.
//  * Credentials are read from environment variables.
//  */

// const axios = require("axios");

// const GRAPH_API_VERSION = "v25.0";

// /**
//  * Send a text message to the configured recipient via WhatsApp.
//  * @param {string} text - The message body to send.
//  * @returns {Promise<object>} - The API response data.
//  * @throws {Error} - If credentials are missing or API call fails.
//  */
// async function sendMessage(text) {
//   const accessToken = process.env.WA_ACCESS_TOKEN;
//   const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
//   const recipientPhone = process.env.WA_RECIPIENT_PHONE;

//   // Validate that all credentials are configured
//   if (!accessToken || !phoneNumberId || !recipientPhone) {
//     throw new Error(
//       "WhatsApp credentials are not configured. Please set WA_ACCESS_TOKEN, WA_PHONE_NUMBER_ID, and WA_RECIPIENT_PHONE in your .env file."
//     );
//   }

//   const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

//   const payload = {
//     messaging_product: "whatsapp",
//     to: recipientPhone,
//     type: "text",
//     text: {
//       body: text,
//     },
//   };

//   // const response = await axios.post(url, payload, {
//   //   headers: {
//   //     Authorization: `Bearer ${accessToken}`,
//   //     "Content-Type": "application/json",
//   //   },
//   // });

//   // return response.data;
//   {
//   const response = await axios.post(url, payload, {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//       "Content-Type": "application/json",
//     },
//   });

//   console.log("✅ Meta Success:");
//   console.log(response.data);

//   return response.data;

// } catch (error) {
//   console.log("❌ Meta Error:");
//   console.log(error.response?.data);

//   throw error;
// }
// } 

// module.exports = { sendMessage };
const axios = require("axios");

const GRAPH_API_VERSION = "v25.0";

async function sendMessage(text) {
  const accessToken = process.env.WA_ACCESS_TOKEN;
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
  const recipientPhone = process.env.WA_RECIPIENT_PHONE;

  if (!accessToken || !phoneNumberId || !recipientPhone) {
    throw new Error("WhatsApp credentials are not configured.");
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: recipientPhone,
    type: "text",
    text: {
      body: text,
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Meta Success:");
    console.log(response.data);

    return response.data;

  } catch (error) {
    console.log("❌ Meta Error:");
    console.log(error.response?.data);

    throw error;
  }
}

module.exports = { sendMessage };
