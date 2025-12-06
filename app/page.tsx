'use client';

import { useState } from 'react';

export default function Home() {
  const [config, setConfig] = useState({
    host: '',
    port: '587',
    secure: 'false',
    user: '',
    pass: '',
    from: '',
    to: '',
    subject: 'SMTP Test Email',
    text: 'This is a test email from SMTP Tester.',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: { message: err.message } });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">SMTP Tester</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">SMTP Host</label>
              <input
                type="text"
                name="host"
                value={config.host}
                onChange={handleChange}
                placeholder="smtp.example.com"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Port</label>
              <input
                type="text"
                name="port"
                value={config.port}
                onChange={handleChange}
                placeholder="587"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Security</label>
            <select
              name="secure"
              value={config.secure}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            >
              <option value="false">STARTTLS (port 587)</option>
              <option value="true">SSL/TLS (port 465)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Username</label>
              <input
                type="text"
                name="user"
                value={config.user}
                onChange={handleChange}
                placeholder="user@example.com"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                name="pass"
                value={config.pass}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">From</label>
              <input
                type="email"
                name="from"
                value={config.from}
                onChange={handleChange}
                placeholder="sender@example.com"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">To</label>
              <input
                type="email"
                name="to"
                value={config.to}
                onChange={handleChange}
                placeholder="recipient@example.com"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={config.subject}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Message</label>
            <textarea
              name="text"
              value={config.text}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-medium"
          >
            {loading ? 'Testing...' : 'Test SMTP Connection'}
          </button>
        </form>

        {result && (
          <div className="space-y-4">
            <div className={`p-4 rounded ${result.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              <h2 className="text-xl font-semibold mb-2">
                {result.success ? '✓ Success' : '✗ Failed'} ({result.duration})
              </h2>
              {result.success ? (
                <div className="space-y-1 text-sm">
                  <p>Message ID: {result.messageId}</p>
                  <p>Response: {result.response}</p>
                  <p>Accepted: {result.accepted?.join(', ')}</p>
                  {result.rejected?.length > 0 && <p>Rejected: {result.rejected.join(', ')}</p>}
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <p>Error: {result.error?.message}</p>
                  {result.error?.code && <p>Code: {result.error.code}</p>}
                  {result.error?.responseCode && <p>Response Code: {result.error.responseCode}</p>}
                  {result.error?.response && <p>Server Response: {result.error.response}</p>}
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded p-4">
              <h3 className="font-semibold mb-2">Debug Log</h3>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-black/50 p-3 rounded max-h-96 overflow-y-auto">
                {result.debugLog?.join('\n') || 'No debug log available'}
              </pre>
            </div>

            <div className="bg-gray-800 rounded p-4">
              <h3 className="font-semibold mb-2">Raw Response</h3>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-black/50 p-3 rounded max-h-96 overflow-y-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}