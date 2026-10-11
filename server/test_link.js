const http = require('http');

async function testFlow() {
  console.log("=== TESTING LIVE LINK: STUDENT -> WARDEN ===");

  // 1. Student Login
  const studentAuth = await post('/api/auth/login', { role: 'STUDENT' });
  console.log("1. Student Authenticated:", studentAuth.user.name);

  // 2. Student Submits Ticket
  const uniqueDesc = `Leaking pipe test at ${new Date().toLocaleTimeString()}`;
  const newTicket = await post('/api/tickets', {
    zone: 'Boys Hostel 1',
    exactRoom: 'Room B-999',
    description: uniqueDesc
  }, studentAuth.token);
  console.log(`2. Student Submitted Ticket: ${newTicket.id} - "${newTicket.description}"`);

  // 3. Warden Login
  const wardenAuth = await post('/api/auth/login', { role: 'WARDEN' });
  console.log("3. Warden Authenticated:", wardenAuth.user.name);

  // 4. Warden Queries Tickets
  const wardenTickets = await get(`/api/tickets?zone=Boys%20Hostel%201`, wardenAuth.token);
  const found = wardenTickets.find(t => t.id === newTicket.id);

  if (found) {
    console.log(`>>> SUCCESS! Ticket ${found.id} arrived at Warden's office immediately!`);
    console.log(`>>> Status: ${found.status}, Zone: ${found.zone}, Room: ${found.exactRoom}`);
  } else {
    console.error(">>> FAILED! Ticket not found in warden queue.");
  }
}

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => resolve(JSON.parse(buf)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => resolve(JSON.parse(buf)));
    });
    req.on('error', reject);
    req.end();
  });
}

testFlow();
