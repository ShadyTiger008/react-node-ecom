import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { mailTypes } from "../constants/index.js";

dotenv.config();

export const sendEmail = async ({
  mail_type,
  email,
  subject,
  title,
  otp,
  name,
}) => {
  const emailTemplate =
    mail_type === mailTypes[1]
      ? `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chota Packet Bada Dhamaka - ${title}</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }

            .header {
                background-color: #4CAF50; /* Green */
                color: #ffffff;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }

            .content {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            .footer {
                text-align: center;
                margin-top: 20px;
                color: #888888;
            }

            .otp {
                font-size: 24px;
                font-weight: bold;
                color: #4CAF50; /* Green */
                margin-bottom: 20px;
            }

            .cta-button {
                display: inline-block;
                background-color: #4CAF50; /* Green */
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
        </head>
    <body>
        <div class="container">
        <body>
            <div class="container">
                <div class="header">
                    <h1>Chota Packet Bada Dhamaka</h1>
                    <p>${title}</p>
                </div>
                <div class="content">
                    <p>Hello!, ${name}</p>
                    <p class="otp">Your One Time Password (OTP) is: </p>
                    <div class="otp">${otp}</div>
                    <p>If you did not request this OTP, please ignore this email.</p>
                    <p>Thank you for using Chota Packet Bada Dhamaka!</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Chota Packet Bada Dhamaka. All rights reserved.</p>
                </div>
            </div>
        </body>
    </html>
`
      : `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chota Packet Bada Dhamaka - Email Verified</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }

                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .header {
                    background-color: #4CAF50; /* Green */
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }

                .content {
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 0 0 8px 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }

                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #888888;
                }

                .success-message {
                    font-size: 20px;
                    color: #4CAF50; /* Green */
                    text-align: center;
                    margin-bottom: 20px;
                }

                .cta-button {
                    display: inline-block;
                    background-color: #4CAF50; /* Green */
                    color: #ffffff;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Chota Packet Bada Dhamaka</h1>
                    <p>${title}</p>
                </div>
                <div class="content">
                    <p>Hello, ${name}</p>
                    <p class="success-message">Your email has been successfully verified!</p>
                    <p>You can now continue to enjoy using Chota Packet Bada Dhamaka.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Chota Packet Bada Dhamaka. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || "chatterjeesoumyajeet@gmail.com",
        pass: process.env.EMAIL_PASSWORD || "mgnm wynx zafz iopc",
      },
    });

    const mailOptions = {
      from: `"Chota Packet Bada Dhamaka" <${
        process.env.EMAIL_USER || "chatterjeesoumyajeet@gmail.com"
      }>`,
      to: email,
      subject: subject,
      html: emailTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);

    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};
