
export async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));

    const reader = new FileReader();

    reader.onload = e => {
      try {
        const text = e.target.result.trim();
        const lines = text.split(/\r?\n/).filter(Boolean); // remove empty lines
        const headers = splitCSVLine(lines[0]);

        const data = lines.slice(1).map(line => {
          const cells = splitCSVLine(line);
          const obj = {};
          headers.forEach((h, i) => (obj[h] = cells[i] ?? ''));
          return obj;
        });

        resolve(data);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(file);
  });
}

/* Utility: split a CSV line respecting quotes */
function splitCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && line[i + 1] === '"') {
      cur += '"';         // escaped quote ""
      i++;                // skip next quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

/* ---------- 2. API FETCHER ---------- */
export async function fetchAPIData(url) {
  try {
    const response = await fetch(url, { cache: 'no-cache' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('fetchAPIData error:', err);

    // Notify user & fall back to empty data structure
    alert(
      'Unable to reach the data service right now.\n' +
      'Check your internet connection or try again later.'
    );

    // Return a predictable empty shape so the rest of the app won’t crash
    return {};
  }
}
