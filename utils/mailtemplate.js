const withdrawalRequestTemplete = async (user, amount, otp, requestDate = new Date()) => {
  const formattedDate = new Date(requestDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" });
  const text = `
Hi ${user?.name || user?.username || "User"},

We have received your withdrawal request on Rain NFT Trading Platform.

Details:
- User ID: ${user.id || user._id || "-"}
- Name: ${user?.name || user?.username || "-"}
- Email: ${user.email}
- Mobile: ${user.mobile || "-"}
- Requested Amount: $${amount}
- OTP: ${otp}
- Request Date: ${formattedDate}

Please enter the OTP above to confirm your withdrawal request.

If this was not you, contact support immediately.

Warm regards,
Rain NFT Trading Team
`;

  // HTML version
  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Rain NFT Trading - Withdrawal Request</title>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; background:#f6f9fc; margin:0; padding:20px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr style="background:#0f172a; color:#ffffff;">
              <td style="padding:24px 30px; text-align:center;">
                <h1 style="margin:0; font-size:20px;">Withdrawal Request Received 💳</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#0b1220;">
                <p style="margin:0 0 16px 0; font-size:15px;">Hello <strong>${user.name || user.username || "User"}</strong>,</p>

                <p style="margin:0 0 18px 0; font-size:15px; line-height:1.6;">
                  We have received your withdrawal request on <strong>Rain NFT Trading Platform</strong>.  
                  Please review the details below:
                </p>

                <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%; font-size:14px; border-collapse:collapse; margin:16px 0;">
                  <tr>
                    <td style="padding:6px 0; width:150px; color:#6b7280;">User ID</td>
                    <td style="padding:6px 0;"><strong>${user.id || user._id || "-"}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#6b7280;">Name</td>
                    <td style="padding:6px 0;"><strong>${user.name || user.username || "-"}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#6b7280;">Email</td>
                    <td style="padding:6px 0;"><strong>${user.email}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#6b7280;">Mobile</td>
                    <td style="padding:6px 0;"><strong>${user.mobile || "-"}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#6b7280;">Requested Amount</td>
                    <td style="padding:6px 0;"><strong>$${amount}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#6b7280;">OTP</td>
                    <td style="padding:6px 0;"><strong style="font-size:16px; color:#0b84ff;">${otp}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#6b7280;">Request Date</td>
                    <td style="padding:6px 0;"><strong>${formattedDate}</strong></td>
                  </tr>
                </table>

                <p style="margin:20px 0; font-size:15px;">
                  Enter the OTP above to confirm your withdrawal request.  
                  If this request was not initiated by you, please contact our support team immediately.
                </p>

                <hr style="border:none; border-top:1px solid #eef2f7; margin:24px 0;">

                <p style="margin:0; color:#6b7280; font-size:13px;">
                  Warm regards,<br>
                  <strong>Rain NFT Trading Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr style="background:#f8fafc; color:#6b7280;">
              <td style="padding:14px 30px; font-size:12px; text-align:center;">
                © ${new Date().getFullYear()} Rain NFT Trading Platform. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  return { html, text };
};


module.exports = { withdrawalRequestTemplete };
