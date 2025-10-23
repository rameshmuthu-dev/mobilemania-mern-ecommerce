const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, message, attachments = []) => {

    const validAttachments = attachments.filter(att =>
        att.content &&
        typeof att.content === 'string' &&
        att.content.length > 0
    );

    const msg = {
        to: to,
        from: process.env.EMAIL_USER,
        subject: subject,
        html: message,
        attachments: validAttachments
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error("SendGrid Email Error:", error.response?.body || error.message);
        throw new Error("Email service failed. Check SendGrid configuration.");
    }
};

module.exports = { sendEmail };