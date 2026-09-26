// PlayGround preview server: static dist/ + /websockify relay (noVNC -> local VNC).
// Lets the phone reach the REAL Chromium through the SAME port as the preview.
const http = require('node:http');
const net = require('node:net');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(process.cwd(), 'dist');
const VNC_HOST = '127.0.0.1';
const VNC_PORT = 5900;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

function serveStatic(req, res) {
  try {
    const u = new URL(req.url, 'http://localhost');
    let p = path.resolve(root, '.' + decodeURIComponent(u.pathname));
    if (p !== root && !p.startsWith(root + '/')) { res.writeHead(404); res.end(); return; }
    if (fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    res.setHeader('Content-Type', mime[path.extname(p)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.end(fs.readFileSync(p));
  } catch (e) { res.writeHead(404); res.end('Not found'); }
}

function wsAccept(key) {
  return crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
}

// Send one binary WS frame to the browser client
function wsSend(sock, data) {
  const len = data.length;
  let head;
  if (len < 126) head = Buffer.from([0x82, len]);
  else if (len < 65536) { head = Buffer.alloc(4); head[0] = 0x82; head[1] = 126; head.writeUInt16BE(len, 2); }
  else { head = Buffer.alloc(10); head[0] = 0x82; head[1] = 127; head.writeBigUInt64BE(BigInt(len), 2); }
  sock.write(Buffer.concat([head, data]));
}

// Parse masked client frames -> payloads; returns {frames, rest}
function wsParse(buf) {
  const frames = [];
  let off = 0;
  while (buf.length - off >= 2) {
    const b1 = buf[off], b2 = buf[off + 1];
    const fin = (b1 & 0x80) !== 0, op = b1 & 0x0f, masked = (b2 & 0x80) !== 0;
    let len = b2 & 0x7f, hlen = 2;
    if (len === 126) {
      if (buf.length - off < 4) break;
      len = buf.readUInt16BE(off + 2); hlen = 4;
    } else if (len === 127) {
      if (buf.length - off < 10) break;
      len = Number(buf.readBigUInt64BE(off + 2)); hlen = 10;
    }
    const mlen = masked ? 4 : 0;
    if (buf.length - off < hlen + mlen + len) break;
    let payload = buf.subarray(off + hlen + mlen, off + hlen + mlen + len);
    if (masked) {
      const mask = buf.subarray(off + hlen, off + hlen + 4);
      const out = Buffer.alloc(len);
      for (let i = 0; i < len; i++) out[i] = payload[i] ^ mask[i % 4];
      payload = out;
    }
    frames.push({ fin, op, payload });
    off += hlen + mlen + len;
  }
  return { frames, rest: buf.subarray(off) };
}

const server = http.createServer(serveStatic);

server.on('upgrade', (req, sock) => {
  let pathname = '/';
  try { pathname = new URL(req.url, 'http://localhost').pathname; } catch (e) {}
  if (pathname !== '/websockify' && pathname !== '/novnc/websockify') { sock.destroy(); return; }
  const key = req.headers['sec-websocket-key'];
  if (!key) { sock.destroy(); return; }
  const vnc = net.connect(VNC_PORT, VNC_HOST);
  vnc.on('connect', () => {
    sock.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\nConnection: Upgrade\r\n' +
      'Sec-WebSocket-Accept: ' + wsAccept(key) + '\r\n\r\n'
    );
    let pending = Buffer.alloc(0);
    sock.on('data', (chunk) => {
      pending = Buffer.concat([pending, chunk]);
      const { frames, rest } = wsParse(pending);
      pending = rest;
      for (const f of frames) {
        if (f.op === 0x8) { vnc.end(); sock.end(); return; }        // close
        if (f.op === 0x9) { sock.write(Buffer.from([0x8a, 0x00])); continue; } // pong
        if (f.op === 0x1 || f.op === 0x2 || f.op === 0x0) {
          if (f.payload.length) vnc.write(f.payload);
        }
      }
    });
    vnc.on('data', (chunk) => { try { wsSend(sock, chunk); } catch (e) {} });
    const done = () => { try { vnc.destroy(); } catch (e) {} try { sock.destroy(); } catch (e) {} };
    sock.on('close', done); sock.on('error', done);
    vnc.on('close', done); vnc.on('error', done);
  });
  vnc.on('error', () => { try { sock.destroy(); } catch (e) {} });
});

const port = Number(process.env.PORT || '3000');
server.listen(port, '0.0.0.0', () => console.log('PlayGround preview+VNC server: ' + root + ' on port ' + port));
