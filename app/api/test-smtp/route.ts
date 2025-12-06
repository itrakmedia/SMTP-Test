import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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
      logger: true,
      tls: {
        rejectUnauthorized: false,
      },
    } as nodemailer.TransportOptions);

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

  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const err = error as Record<string, unknown>;
    debugLog.push(`[${new Date().toISOString()}] Error: ${err.message}`);
    
    return NextResponse.json({
      success: false,
      duration: `${duration}ms`,
      error: {
        message: err.message,
        code: err.code,
        command: err.command,
        responseCode: err.responseCode,
        response: err.response,
        stack: err.stack,
      },
      debugLog,
    }, { status: 500 });
  }
}