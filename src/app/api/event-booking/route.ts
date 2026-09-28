import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const RECIPIENT_EMAIL = 'asif@techbeeps.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      eventType,
      location,
      date,
      guests,
      message,
      locale,
    } = body;

    // Validate essential fields
    if (!firstName || !lastName || !phone || !email || !date || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const submissionDate = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Riyadh',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const emailSubject = `🎉 New Event Booking Inquiry from ${fullName} - Grass Florist`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; color: #201B18; margin: 0; padding: 24px; }
            .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #EBE3D5; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            .header { background: #2D3F33; color: #ffffff; padding: 32px 28px; text-align: center; }
            .header h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: 700; color: #ffffff; }
            .header p { margin: 0; color: #8CA841; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .content { padding: 28px; }
            .badge { display: inline-block; background: #FAF5EE; color: #435849; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: 1px solid #DDD3C6; margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 24px; }
            .table td { padding: 12px 14px; border-bottom: 1px solid #F0EAE1; font-size: 14px; }
            .table td.label { font-weight: 600; color: #685D54; width: 35%; background-color: #FCFBF9; }
            .table td.value { font-weight: 500; color: #201B18; }
            .message-box { background: #FAF5EE; border-left: 4px solid #8CA841; padding: 16px; border-radius: 8px; margin-top: 16px; font-size: 14px; color: #403630; line-height: 1.6; }
            .actions { text-align: center; margin-top: 30px; }
            .btn { display: inline-block; background: #8CA841; color: #141E18; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 700; font-size: 13px; margin: 4px 6px; }
            .footer { background: #F8F5F0; padding: 18px 24px; text-align: center; font-size: 12px; color: #8C8075; border-top: 1px solid #EBE3D5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <p>🌸 GRASS FLORIST & ATELIER</p>
              <h1>New Event Booking Inquiry</h1>
            </div>
            <div class="content">
              <div class="badge">Submitted via Web Atelier • ${submissionDate} (KSA)</div>
              
              <table class="table">
                <tr>
                  <td class="label">Client Name</td>
                  <td class="value"><strong>${fullName}</strong></td>
                </tr>
                <tr>
                  <td class="label">Phone Number</td>
                  <td class="value"><a href="tel:${phone}" style="color: #2D3F33; text-decoration: none; font-weight: 600;">${phone}</a></td>
                </tr>
                <tr>
                  <td class="label">Email Address</td>
                  <td class="value"><a href="mailto:${email}" style="color: #2D3F33; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td class="label">Event Type</td>
                  <td class="value"><strong>${eventType}</strong></td>
                </tr>
                <tr>
                  <td class="label">Event Date</td>
                  <td class="value">📅 ${date}</td>
                </tr>
                <tr>
                  <td class="label">Location / City</td>
                  <td class="value">📍 ${location}</td>
                </tr>
                <tr>
                  <td class="label">Estimated Guests</td>
                  <td class="value">👥 ${guests} Guests</td>
                </tr>
                <tr>
                  <td class="label">Submitted Language</td>
                  <td class="value">${locale === 'ar' ? 'العربية (Arabic)' : 'English'}</td>
                </tr>
              </table>

              <div style="font-size: 14px; font-weight: 600; color: #201B18; margin-top: 20px;">Client Vision & Notes:</div>
              <div class="message-box">
                ${message ? message.replace(/\n/g, '<br>') : '<em>No additional notes provided.</em>'}
              </div>

              <div class="actions">
                <a href="mailto:${email}?subject=Regarding%20your%20Event%20Booking%20at%20Grass%20Florist" class="btn">Reply via Email</a>
                <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" class="btn" style="background: #2D3F33; color: #ffffff;">Contact on WhatsApp</a>
              </div>
            </div>
            <div class="footer">
              This is an automated notification from Grass Florist Event Booking System sent to <strong>${RECIPIENT_EMAIL}</strong>.
            </div>
          </div>
        </body>
      </html>
    `;

    // Configure Nodemailer transporter if SMTP environment variables are set
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.SMTP_FROM || `"Grass Florist Events" <${smtpUser || 'events@grassflorist.com'}>`;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: fromEmail,
        to: RECIPIENT_EMAIL,
        replyTo: email,
        subject: emailSubject,
        html: emailHtml,
      });
      console.log(`[Event Booking] Email successfully dispatched to ${RECIPIENT_EMAIL}`);
    } else {
      // If SMTP is not yet configured, log cleanly to server console
      console.log('----------------------------------------------------');
      console.log(`[EVENT BOOKING INQUIRY] Target: ${RECIPIENT_EMAIL}`);
      console.log(`From: ${fullName} <${email}> | Phone: ${phone}`);
      console.log(`Type: ${eventType} | Date: ${date} | Location: ${location} | Guests: ${guests}`);
      console.log(`Notes: ${message}`);
      console.log('----------------------------------------------------');
    }

    return NextResponse.json({
      success: true,
      recipient: RECIPIENT_EMAIL,
      message: 'Event booking inquiry successfully submitted',
    });
  } catch (error) {
    console.error('Error submitting event booking form:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing booking request' },
      { status: 500 }
    );
  }
}
