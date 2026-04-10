const API = "/api/sheets";

// ─── AUTH ───
export async function loginUser(username, password) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", username, password }),
  });
  return res.json();
}

// ─── DASHBOARD BATCH (fast!) ───
export async function getDashboardData() {
  const res = await fetch(`${API}?action=getDashboardData`);
  return res.json();
}

// ─── TICKETS ───
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

// ─── STATS ───
export async function getStats() {
  const res = await fetch(`${API}?action=getStats`);
  return res.json();
}

// ─── MEMBERS ───
export async function getMembers() {
  const res = await fetch(`${API}?action=getMembers`);
  return res.json();
}

// ─── ATTENDANCE ───
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
  const url = member
    ? `${API}?action=getAttendance&member=${encodeURIComponent(member)}`
    : `${API}?action=getAttendance`;
  const res = await fetch(url);
  return res.json();
}

export async function getTodayAttendance(member) {
  const res = await fetch(`${API}?action=getTodayAttendance&member=${encodeURIComponent(member)}`);
  return res.json();
}
