const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

const sendEmail = asyncHandler(async (email, subject, text, attachments = []) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 10000,
        socketTimeout: 10000,
    });

    const mailOptions = {
        from: `No-reply Mobile Mania <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: text,
        text: text.replace(/<[^>]*>?/gm, ''),
        attachments: attachments,
    };

    await transporter.sendMail(mailOptions);

});

module.exports = { sendEmail };