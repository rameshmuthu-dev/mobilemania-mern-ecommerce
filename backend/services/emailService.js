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
    });

    const mailOptions = {
        from: `No-reply Mobile Mania <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: text,
        text: text.replace(/<[^>]*>?/gm, ''),
        attachments: attachments,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email via SMTP:", error);
        throw new Error("Email service failed. Check SMTP configuration (App Password, Host, Port).");
    }
});

module.exports = { sendEmail };