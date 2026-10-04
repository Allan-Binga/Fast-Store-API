const { fail } = require('../utils/http');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (amount, currency = 'usd') => escapeHtml(new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount));
function template(title, description, body = '', action) {
  const url = action ? new URL(action.path, action.baseUrl || process.env.CLIENT_URL).href : '';
  return `<!doctype html><html><body style="margin:0;background:#f2f3ff;font-family:Arial,sans-serif;color:#131b2e"><div style="display:none">${escapeHtml(description)}</div><table role="presentation" style="width:100%;padding:32px 12px"><tr><td><div style="max-width:640px;margin:auto;background:white;border:1px solid #c3c6d7;border-radius:12px;overflow:hidden"><div style="padding:28px 32px;background:#004ac6;color:white;font-size:26px;font-weight:bold">FastStore<span style="display:block;font-size:12px;font-weight:normal;margin-top:8px">Great finds. Effortless shopping.</span></div><div style="padding:32px"><h1 style="font-size:24px;margin:0 0 16px">${escapeHtml(title)}</h1><p style="line-height:1.7;color:#434655">${escapeHtml(description)}</p>${body}${action ? `<p style="margin-top:28px"><a href="${escapeHtml(url)}" style="display:inline-block;background:#004ac6;color:white;text-decoration:none;padding:14px 22px;border-radius:6px;font-weight:bold">${escapeHtml(action.label)}</a></p><p style="font-size:11px;word-break:break-all;color:#737686">Or open: ${escapeHtml(url)}</p>` : ''}</div><div style="padding:22px 32px;background:#f2f3ff;font-size:12px;color:#737686">© ${new Date().getFullYear()} FastStore<br>Customer care · info@fast-store.skirill.org</div></div></td></tr></table></body></html>`;
}
async function sendMail(to, subject, htmlContent) {
  if (!process.env.BREVO_API_KEY || !process.env.CLIENT_URL) throw fail(503, 'Email service is not configured.');
  const sender = process.env.BREVO_SENDER_EMAIL || 'info@fast-store.skirill.org';
  if (!/^[^\s@]+@fast-store\.skirill\.org$/i.test(sender)) throw fail(503, 'Email sender must use fast-store.skirill.org.');
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ sender: { name: 'FastStore', email: sender }, to: [{ email: to }], subject, htmlContent,
      textContent: htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() }),
  });
  if (!response.ok) throw fail(503, 'Email delivery is temporarily unavailable.');
  return response.json();
}
module.exports = { sendMail, template, escapeHtml, money };
