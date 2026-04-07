const API = process.env.NEXT_PUBLIC_SHEET_API;

export async function loginUser(username, password) {
  const res = await fetch(API, {
    method: "POST",
    body: JSON.stringify({ action: "login", username, password }),
  });
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
    body: JSON.stringify({ action: "createTicket", ...data }),
  });
  return res.json();
}

export async function updateTicket(data) {
  const res = await fetch(API, {
    method: "POST",
    body: JSON.stringify({ action: "updateTicket", ...data }),
  });
  return res.json();
}

export async function deleteTicket(id) {
  const res = await fetch(API, {
    method: "POST",
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
