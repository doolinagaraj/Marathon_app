const channels = new Map(); // key -> Set(res)

export function sseKey({ eventId }) {
  return `event:${eventId}`;
}

export function sseSubscribe({ key, res }) {
  if (!channels.has(key)) channels.set(key, new Set());
  channels.get(key).add(res);
}

export function sseUnsubscribe({ key, res }) {
  const set = channels.get(key);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) channels.delete(key);
}

export function ssePublish({ key, event, data }) {
  const set = channels.get(key);
  if (!set) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try {
      res.write(payload);
    } catch {
      // ignore
    }
  }
}

