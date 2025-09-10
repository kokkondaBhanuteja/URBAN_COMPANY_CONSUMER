import nodemailer from "nodemailer";

// Re-use your email configuration from your environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const sendContactMessage = async (formData: ContactFormData) => {
  const { name, email, phone, message } = formData;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: "resolve@urbancompany.com", // Your support email address
    subject: `New Contact Message from ${name}`,
    replyTo: email,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #0e0e0e;">New Inquiry from Contact Form</h2>
        <p>You have received a new message from your website's contact form.</p>
        <hr style="margin: 20px 0;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> ${phone}</p>
        <div style="background-color: #f9f9f9; border-left: 4px solid #0e0e0e; padding: 15px; margin-top: 20px;">
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Message sent successfully!" };
  } catch (error) {
    console.error("Error sending contact email:", error);
    throw new Error("Failed to send message. Please try again later.");
  }
};