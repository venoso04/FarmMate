//sendEmail.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // or any other email service
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

const sendEmail = async ({ to, subject, message }) => {
    try {
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject,
            html: message
        });
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

export default sendEmail;
