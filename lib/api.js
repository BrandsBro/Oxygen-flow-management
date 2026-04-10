const API = "/api/sheets";

export async function loginUser(username, password) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", username, password }),
  });
  return res.json();
}

export async function getDashboardData() {
  const res = await fetch(`${API}?action=getDashboardData`);
  return res.json();
}

export async function getTickets() {
  const res = await fetch(`${API}?action=getTickets`);
  return res.json();
}

export async function getTicketById(id) {
  const res = await fetch(`${API}?action=getTicketById&id=${id}`);
  return res.json();
}

export async function createTicket(data) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "createTicket", ...data }),
  });
  return res.json();
}

export async function updateTicket(data) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "updateTicket", ...data }),
  });
  return res.json();
}

export async function deleteTicket(id) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "deleteTicket", id }),
  });
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API}?action=getStats`);
  return res.json();
}

export async function getMembers() {
  const res = await fetch(`${API}?action=getMembers`);
  return res.json();
}

// Attendance — always bypass cache with timestamp
export async function clockIn(member) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "clockIn", member }),
  });
  return res.json();
}

export async function clockOut(member) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "clockOut", member }),
  });
  return res.json();
}

export async function getAttendance(member) {
  // Add timestamp to always bypass cache
  const ts = Date.now();
  const url = member
    ? `${API}?action=getAttendance&member=${encodeURIComponent(member)}&t=${ts}`
    : `${API}?action=getAttendance&t=${ts}`;
  const res = await fetch(url);
  return res.json();
}

export async function getTodayAttendance(member) {
  const ts = Date.now();
  const res = await fetch(`${API}?action=getTodayAttendance&member=${encodeURIComponent(member)}&t=${ts}`);
  return res.json();
}

// ─── INVOICES ───
export async function getInvoices() {
  const res = await fetch(`${API}?action=getInvoices`);
  return res.json();
}

export async function createInvoice(data) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "createInvoice", ...data }),
  });
  return res.json();
}

export async function deleteInvoice(id) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "deleteInvoice", id }),
  });
  return res.json();
}

// ─── MEMBER MANAGEMENT ───
export async function updateMember(data) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "updateMember", ...data }),
  });
  return res.json();
}

export async function addMember(data) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "addMember", ...data }),
  });
  return res.json();
}

// ─── PERMISSIONS ───
export async function getPermissions() {
  const res = await fetch(`${API}?action=getPermissions&t=${Date.now()}`);
  return res.json();
}

export async function updatePermissions(data) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "updatePermissions", ...data }),
  });
  return res.json();
}

export async function pauseClock(member) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "pauseClock", member }),
  });
  return res.json();
}

export async function resumeClock(member) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "resumeClock", member }),
  });
  return res.json();
}
