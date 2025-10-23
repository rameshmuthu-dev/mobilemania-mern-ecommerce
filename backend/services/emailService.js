const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
    const msg = {
        to: options.to || options.email, 
        from: process.env.EMAIL_USER, 
        subject: options.subject, 
        html: options.message, 
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error("SendGrid Email Error:", error.response?.body || error.message);
        throw new Error("Email service failed. Check SendGrid configuration.");
    }
};

module.exports = { sendEmail };