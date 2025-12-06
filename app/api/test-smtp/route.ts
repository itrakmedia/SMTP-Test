import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const debugLog: string[] = [];
  
  try {
    const body = await request.json();
    const { host, port, secure, user, pass, from, to, subject, text } = body;

    debugLog.push(`[${new Date().toISOString()}] Starting SMTP test`);
    debugLog.push(`Host: ${host}:${port}, Secure: ${secure}`);

    const transportOptions: SMTPTransport.Options = {
      host,
      port: parseInt(port),
      secure: secure === 'true' || secure === true,
      auth: user ? { user, pass } : undefined,
      debug: true,
      logger: {
        level: 'debug' as const,
        debug: (info: unknown) => debugLog.push(`[DEBUG] ${JSON.stringify(info)}`),
        info: (info: unknown) => debugLog.push(`[INFO] ${JSON.stringify(info)}`),
        warn: (info: unknown) => debugLog.push(`[WARN] ${JSON.stringify(info)}`),
        error: (info: unknown) => debugLog.push(`[ERROR] ${JSON.stringify(info)}`),
        log: (info: unknown) => debugLog.push(`[LOG] ${JSON.stringify(info)}`),
        trace: (info: unknown) => debugLog.push(`[TRACE] ${JSON.stringify(info)}`),
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    const transporter = nodemailer.createTransport(transportOptions);

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
    const err = error as { message?: string; code?: string; command?: string; responseCode?: number; response?: string; stack?: string };
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