import { NextRequest, NextResponse } from 'next/server';
import * as nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const debugLog: string[] = [];
  
  try {
    const body = await request.json();
    const { host, port, secure, user, pass, from, to, subject, text } = body;

    debugLog.push(`[${new Date().toISOString()}] Starting SMTP test`);
    debugLog.push(`Host: ${host}:${port}, Secure: ${secure}`);

    // Create transporter with debug enabled
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: secure === 'true' || secure === true,
      auth: user ? { user, pass } : undefined,
      debug: true,
      logger: {
        debug: (info: any) => debugLog.push(`[DEBUG] ${JSON.stringify(info)}`),
        info: (info: any) => debugLog.push(`[INFO] ${JSON.stringify(info)}`),
        warn: (info: any) => debugLog.push(`[WARN] ${JSON.stringify(info)}`),
        error: (info: any) => debugLog.push(`[ERROR] ${JSON.stringify(info)}`),
        log: (info: any) => debugLog.push(`[LOG] ${JSON.stringify(info)}`),
        trace: (info: any) => debugLog.push(`[TRACE] ${JSON.stringify(info)}`),
      },
      tls: {
        rejectUnauthorized: false, // For testing self-signed certs
      },
    });

    // Verify connection
    debugLog.push(`[${new Date().toISOString()}] Verifying connection...`);
    const verifyResult = await transporter.verify();
    debugLog.push(`[${new Date().toISOString()}] Verify result: ${verifyResult}`);

    // Send test email
    debugLog.push(`[${new Date().toISOString()}] Sending test email...`);
    const info = await transporter.sendMail({
      from: from || user,
      to,
      subject: subject || 'SMTP Test Email',
      text: text || 'This is a test email from SMTP Tester.',
      html: `<p>${text || 'This is a test email from SMTP Tester.'}</p>`,
    });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
      envelope: info.envelope,
      raw: info,
      debugLog,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    debugLog.push(`[${new Date().toISOString()}] Error: ${error.message}`);
    
    return NextResponse.json({
      success: false,
      duration: `${duration}ms`,
      error: {
        message: error.message,
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
        response: error.response,
        stack: error.stack,
      },
      debugLog,
    }, { status: 500 });
  }
}