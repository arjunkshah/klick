export type CalendarListItem = {
  id: string;
  title: string;
  start: string;
  end?: string;
  htmlLink?: string;
};

type GoogleEventItem = {
  id?: string;
  summary?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

function pickStart(e: GoogleEventItem): string {
  return e.start?.dateTime || e.start?.date || "";
}

/** Next events from primary calendar (readonly scope). */
export async function fetchUpcomingCalendarEvents(
  accessToken: string,
  max = 6,
): Promise<CalendarListItem[]> {
  const timeMin = new Date().toISOString();
  const params = new URLSearchParams({
    maxResults: String(max),
    singleEvents: "true",
    orderBy: "startTime",
    timeMin,
  });
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t.slice(0, 200) || `Calendar HTTP ${r.status}`);
  }
  const data = (await r.json()) as { items?: GoogleEventItem[] };
  const items = Array.isArray(data.items) ? data.items : [];
  return items
    .map((e) => ({
      id: String(e.id ?? pickStart(e)),
      title: typeof e.summary === "string" && e.summary.trim() ? e.summary : "(No title)",
      start: pickStart(e),
      end: e.end?.dateTime || e.end?.date,
      htmlLink: typeof e.htmlLink === "string" ? e.htmlLink : undefined,
    }))
    .filter((e) => e.start);
}
