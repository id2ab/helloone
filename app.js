/*
 * HELLO ONE — GitHub Pages starter frontend
 * IMPORTANT:
 * - This is a UI starter with clearly labeled sample events/tickets.
 * - It does not process payments or create real bookings.
 * - Configure and test your Google Apps Script backend before using live data.
 */
const CONFIG = {
  // TODO: Add your existing Apps Script /exec URL only after confirming its API actions
  // and response format. Do not assume a UI click means a booking/payment succeeded.
  appsScriptUrl: "",
  currency: "₹",
  location: "Muzaffarpur, Bihar",
  useSampleData: true
};

const sampleEvents = [
  {id:"event-1",title:"Hello One Cultural Night",category:"Music",date:"2026-11-14",time:"6:00 PM",location:"Muzaffarpur, Bihar",venue:"Event venue to be announced",price:199,image:"",description:"An evening of music, local talent and memorable moments. Event information shown here is sample content; replace it with verified details before publishing.",featured:true,status:"upcoming"},
  {id:"event-2",title:"Local Festival Celebration",category:"Festival",date:"2026-11-22",time:"5:00 PM",location:"Muzaffarpur, Bihar",venue:"Venue to be announced",price:99,image:"",description:"Celebrate culture and community with Hello One. This is a sample event card, not a live listing.",featured:false,status:"upcoming"},
  {id:"event-3",title:"Community Meet-up",category:"Community",date:"2026-12-05",time:"4:00 PM",location:"Muzaffarpur, Bihar",venue:"Venue to be announced",price:0,image:"",description:"Meet your local community and discover something new. Replace this sample listing with real event data.",featured:false,status:"upcoming"},
  {id:"event-4",title:"Autumn Music Evening",category:"Music",date:"2026-09-12",time:"6:30 PM",location:"Muzaffarpur, Bihar",venue:"Past event venue",price:149,image:"",description:"Sample past event for the History tab preview.",featured:false,status:"history"}
];

// Example shape for a future backend response. Map real API results into this shape.
let events = CONFIG.useSampleData ? [...sampleEvents] : [];
let tickets = []; // Real tickets should only be populated from a verified backend response.
let selectedCategory = "All";
let ticketTab = "upcoming";
let currentEventId = null;
let currentTicketId = null;
let currentScreen = "home";
let savedIds = new Set();
let toastTimer;

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const formatDate = value => {
  if (!value) return "Date to be announced";
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
};
const money = amount => Number(amount) === 0 ? "Free" : `${CONFIG.currency}${Number(amount || 0).toLocaleString("en-IN")}`;
const eventById = id => events.find(e => e.id === id);
const ticketById = id => tickets.find(t => t.id === id);
const safeImage = image => image ? `<img src="${escapeHTML(image)}" alt="" loading="lazy" onerror="this.remove()">` : "";

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
function go(screen) {
  if (screen === "saved") { showToast("Saved events feature will be connected next."); return; }
  if (!["home","event","tickets","ticket","profile"].includes(screen)) screen = "home";
  currentScreen = screen;
  $$(".screen").forEach(el => el.classList.toggle("active", el.dataset.screen === screen));
  $$(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.go === (screen === "event" ? "home" : screen === "ticket" ? "tickets" : screen)));
  window.scrollTo({top:0,behavior:"smooth"});
  if (screen === "tickets") renderTickets();
}
function renderEventCard(event, featured=false) {
  const saved = savedIds.has(event.id);
  if (featured) return `<article class="featured-card">${safeImage(event.image)}<button class="featured-arrow" data-open-event="${escapeHTML(event.id)}" aria-label="View event">↗</button><div class="featured-info"><span class="event-date-badge">${escapeHTML(formatDate(event.date))}</span><h3>${escapeHTML(event.title)}</h3><p>⌖ ${escapeHTML(event.location || CONFIG.location)} · ${escapeHTML(money(event.price))}</p></div></article>`;
  return `<article class="event-card"><div class="event-poster">${safeImage(event.image)}<span class="poster-date">${escapeHTML(formatDate(event.date))}</span></div><div class="event-info"><span class="event-category">${escapeHTML(event.category || "Event")}</span><h3>${escapeHTML(event.title)}</h3><div class="event-meta">◷ ${escapeHTML(event.time || "Time TBA")}</div><div class="event-meta">⌖ ${escapeHTML(event.location || CONFIG.location)}</div><div class="event-price">${escapeHTML(money(event.price))}</div><div class="event-actions"><button class="small-button" data-open-event="${escapeHTML(event.id)}">View / Book</button><button class="small-button secondary" data-save-event="${escapeHTML(event.id)}" aria-label="Save event">${saved ? "♥" : "♡"}</button></div></div></article>`;
}
function renderHome() {
  const query = ($("#eventSearch").value || "").trim().toLowerCase();
  const filtered = events.filter(e => {
    const matchesQuery = [e.title,e.category,e.location,e.description].join(" ").toLowerCase().includes(query);
    const matchesCategory = selectedCategory === "All" || String(e.category).toLowerCase() === selectedCategory.toLowerCase();
    return matchesQuery && matchesCategory;
  });
  const featured = filtered.find(e => e.featured) || filtered[0];
  $("#featuredWrap").innerHTML = featured ? renderEventCard(featured,true) : "";
  $("#eventList").innerHTML = filtered.filter(e => !featured || e.id !== featured.id).map(e => renderEventCard(e)).join("");
  // When only one event matches, still show it in the list after the featured banner.
  if (filtered.length === 1 && featured) $("#eventList").innerHTML = renderEventCard(featured);
  $("#eventCount").textContent = `${filtered.length} event${filtered.length === 1 ? "" : "s"}`;
  $("#emptyEvents").classList.toggle("hidden", filtered.length > 0);
}
function openEvent(id) {
  const event = eventById(id);
  if (!event) return showToast("Event details are not available.");
  currentEventId = id;
  $("#eventDetail").innerHTML = `
    <article>
      <div class="detail-poster">${safeImage(event.image)}<div class="detail-title-band"><h1>${escapeHTML(event.title)}</h1><p>${escapeHTML(event.category || "Event")} · ${escapeHTML(formatDate(event.date))}</p></div></div>
      <div class="detail-data"><div><small>DATE & TIME</small><strong>${escapeHTML(formatDate(event.date))}<br>${escapeHTML(event.time || "Time to be announced")}</strong></div><div><small>LOCATION</small><strong>${escapeHTML(event.location || CONFIG.location)}</strong></div><div><small>VENUE</small><strong>${escapeHTML(event.venue || "To be announced")}</strong></div><div><small>TICKET PRICE</small><strong>${escapeHTML(money(event.price))}</strong></div></div>
      <div class="about-block"><h2>About this event</h2><p>${escapeHTML(event.description || "More event details will be announced soon.")}</p></div>
      <div class="purchase-bar"><div><small>Ticket price</small><strong>${escapeHTML(money(event.price))}</strong></div><button class="primary-button purple" id="bookEventButton">Continue to booking ↗</button></div>
      <p class="fine-print">Booking and payment are not completed on this page. Continue only after the official backend URL and booking flow have been configured.</p>
    </article>`;
  go("event");
  $("#bookEventButton").addEventListener("click", () => beginBooking(event));
}
function beginBooking(event) {
  if (!CONFIG.appsScriptUrl) {
    showToast("Booking backend URL is not configured yet.");
    return;
  }
  // Replace with a verified official booking URL/action after confirming the backend contract.
  showToast("Booking link configured, but its official action still needs verification.");
}
function makePseudoQR(seed) {
  // Visual placeholder only; not a scannable ticket QR code.
  let hash = 0; for (const ch of String(seed)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  let cells = "";
  for (let i=0;i<441;i++) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    let dark = (hash >>> 28) > 7;
    const x=i%21,y=Math.floor(i/21);
    const finder = (ox,oy) => x>=ox&&x<ox+7&&y>=oy&&y<oy+7 && (x===ox||x===ox+6||y===oy||y===oy+6||(x>=ox+2&&x<=ox+4&&y>=oy+2&&y<=oy+4));
    if (finder(0,0)||finder(14,0)||finder(0,14)) dark = true;
    cells += `<span class="${dark?"dark":""}"></span>`;
  }
  return `<div class="qr-grid" aria-label="Illustrative QR placeholder">${cells}</div><p class="fine-print" style="text-align:center">Illustration only — not a valid ticket QR code.</p>`;
}
function renderTickets() {
  const visible = tickets.filter(t => ticketTab === "history" ? t.status === "history" : t.status !== "history");
  $("#ticketList").innerHTML = visible.map(t => {
    const e = eventById(t.eventId) || t.event || {};
    return `<article class="ticket-card"><div class="ticket-card-head"><h3>${escapeHTML(e.title || t.eventTitle || "Event ticket")}</h3><span class="status-pill ${t.status==="pending"?"pending":""}">${escapeHTML(t.statusLabel || (t.status==="pending"?"Pending":"Confirmed"))}</span></div><div class="ticket-grid"><div class="ticket-field"><small>◉ Seat / Ticket</small><strong>${escapeHTML(t.seat || "General admission")}</strong></div><div class="ticket-field"><small>▣ Tickets</small><strong>${escapeHTML(t.quantity || 1)}</strong></div><div class="ticket-field"><small>▦ Event date</small><strong>${escapeHTML(formatDate(e.date || t.date))}</strong></div><div class="ticket-field"><small>◷ Event time</small><strong>${escapeHTML(e.time || t.time || "TBA")}</strong></div></div><div class="ticket-location"><small>⌖ Venue</small><strong>${escapeHTML(e.venue || e.location || t.location || "To be announced")}</strong><p>${escapeHTML(e.location || t.location || CONFIG.location)}</p></div><button class="primary-button" data-open-ticket="${escapeHTML(t.id)}">View Tickets</button></article>`;
  }).join("");
  $("#emptyTickets").classList.toggle("hidden", visible.length > 0);
}
function openTicket(id) {
  const ticket = ticketById(id);
  if (!ticket) return showToast("No ticket data found. Connect the backend to load real tickets.");
  currentTicketId = id;
  const event = eventById(ticket.eventId) || ticket.event || {title:ticket.eventTitle || "Event ticket",date:ticket.date,time:ticket.time,location:ticket.location};
  $("#ticketDetail").innerHTML = `<article class="ticket-detail-card" id="printableTicket"><div class="success-head"><div class="success-check">✓</div><h1>Ticket Details</h1><p>This screen does not verify payment status.</p></div><div class="ticket-color-band"><h2>${escapeHTML(event.title || "Event ticket")}</h2><p>${escapeHTML(event.description || "Hello One event ticket")}</p></div><div class="ticket-content"><div class="detail-data"><div><small>EVENT DATE</small><strong>${escapeHTML(formatDate(event.date))}</strong></div><div><small>EVENT TIME</small><strong>${escapeHTML(event.time || "To be announced")}</strong></div><div><small>TICKET / SEAT</small><strong>${escapeHTML(ticket.seat || "General admission")}</strong></div><div><small>QUANTITY</small><strong>${escapeHTML(ticket.quantity || 1)}</strong></div></div><div class="ticket-location"><small>VENUE</small><strong>${escapeHTML(event.venue || event.location || "To be announced")}</strong><p>${escapeHTML(event.location || CONFIG.location)}</p></div>${makePseudoQR(ticket.ticketToken || ticket.id)}<div class="ticket-note">Real ticket QR/barcode will be shown here only after integration with the verified ticket backend.</div><div class="ticket-actions"><button class="primary-button purple" id="downloadTicketButton">⇩ Download / Print Ticket</button><button class="primary-button" id="shareTicketButton">Share ticket details</button></div></div></article>`;
  go("ticket");
  $("#downloadTicketButton").addEventListener("click", () => window.print());
  $("#shareTicketButton").addEventListener("click", () => {
    const message = `${event.title || "Hello One Ticket"}\nDate: ${formatDate(event.date)}\nTime: ${event.time || "TBA"}\nVenue: ${event.venue || event.location || CONFIG.location}\n\nDemo ticket details — not proof of booking or payment.`;
    if (navigator.share) navigator.share({title:event.title || "Hello One Ticket",text:message}).catch(()=>{});
    else if (navigator.clipboard) navigator.clipboard.writeText(message).then(()=>showToast("Ticket details copied.")).catch(()=>showToast("Could not copy details."));
    else showToast("Sharing is not supported in this browser.");
  });
}
function openModal() { $("#modalBackdrop").classList.remove("hidden"); $("#accountMobile").focus(); }
function closeModal() { $("#modalBackdrop").classList.add("hidden"); $("#formError").classList.add("hidden"); }
function connectAccount() {
  const mobile = $("#accountMobile").value.trim();
  const pin = $("#accountPin").value.trim();
  const error = $("#formError");
  error.textContent = "";
  if (!mobile) { error.textContent = "Please enter your mobile number."; error.classList.remove("hidden"); return; }
  if (!CONFIG.appsScriptUrl) { error.textContent = "Backend is not configured. No sign-in request was sent."; error.classList.remove("hidden"); return; }
  error.textContent = "Backend API actions and authentication response must be configured and tested before sign-in can work.";
  error.classList.remove("hidden");
  void pin;
}
function saveEvent(id) {
  if (savedIds.has(id)) savedIds.delete(id); else savedIds.add(id);
  renderHome();
  showToast(savedIds.has(id) ? "Event saved on this page." : "Event removed from saved list.");
}
function setupEvents() {
  $("#eventSearch").addEventListener("input", renderHome);
  $("#clearSearch").addEventListener("click", () => { $("#eventSearch").value=""; renderHome(); $("#eventSearch").focus(); });
  $("#viewAllButton").addEventListener("click", () => { selectedCategory="All"; $$(".chip").forEach(c=>c.classList.toggle("selected",c.dataset.category==="All")); $("#eventSearch").value=""; renderHome(); $("#eventList").scrollIntoView({behavior:"smooth",block:"start"}); });
  $$(".chip").forEach(chip => chip.addEventListener("click", () => { selectedCategory=chip.dataset.category; $$(".chip").forEach(c=>c.classList.toggle("selected",c===chip)); renderHome(); }));
  document.addEventListener("click", event => {
    const goButton = event.target.closest("[data-go]");
    if (goButton) return go(goButton.dataset.go);
    const open = event.target.closest("[data-open-event]");
    if (open) return openEvent(open.dataset.openEvent);
    const save = event.target.closest("[data-save-event]");
    if (save) return saveEvent(save.dataset.saveEvent);
    const openTicketButton = event.target.closest("[data-open-ticket]");
    if (openTicketButton) return openTicket(openTicketButton.dataset.openTicket);
  });
  $$(".nav-item").forEach(btn => btn.addEventListener("click", () => go(btn.dataset.go)));
  $$(".segment").forEach(btn => btn.addEventListener("click", () => {
    ticketTab=btn.dataset.ticketTab;
    $$(".segment").forEach(b=>{const active=b===btn;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active));});
    renderTickets();
  }));
  $("#profileShortcut").addEventListener("click",()=>go("profile"));
  $("#locationButton").addEventListener("click",()=>showToast("Location setting is a UI placeholder in this version."));
  $("#signInButton").addEventListener("click",openModal);
  $("#helpButton").addEventListener("click",()=>showToast("Add your official support contact after configuration."));
  $("#modalClose").addEventListener("click",closeModal);
  $("#modalBackdrop").addEventListener("click",e=>{if(e.target===$("#modalBackdrop"))closeModal();});
  $("#connectButton").addEventListener("click",connectAccount);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
}
function init() {
  $("#locationText").textContent=CONFIG.location;
  renderHome();
  renderTickets();
  setupEvents();
}
document.addEventListener("DOMContentLoaded",init);

/*
 * BACKEND INTEGRATION CHECKLIST
 * 1. Confirm the current Apps Script /exec URL and supported actions.
 * 2. Confirm request/response JSON formats, authentication and CORS behavior.
 * 3. Map verified live Events response into `events`.
 * 4. Load My Tickets only for the authenticated user from a verified API response.
 * 5. Show a real ticket QR only from the server-issued ticket token/URL.
 * 6. Never mark a booking or payment successful based only on a button click.
 */
