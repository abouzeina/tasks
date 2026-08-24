const TURSO_URL = (process.env.TURSO_DATABASE_URL || 'libsql://tasks-abouzeina.aws-eu-west-1.turso.io')
  .replace('libsql://', 'https://') + '/v2/pipeline';

const TURSO_TOKEN = process.env.TURSO_DATABASE_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc1NjI5MTQsImlkIjoiMDFhMDMzMGMtY2YwMS03MTViLWJhYTAtNWY4MjQ4YmU0ZDk5Iiwia2lkIjoid3RrY2NDT1FYNU5qS1BmakxpTjlEOTRxeXduaXpIWW85MWtNa2xGSlM0ZyIsInJpZCI6IjVjMWVmYWEzLThlNGQtNGUwOC1hN2I1LTBlNmExNGI5MWM5NiJ9.CRiq1Pw_QbYSSsdrWB9eTdO6AUrJaBYrl9-4dOS9rIkgxYkv38gyk0stqjQ_VLh3ZcyP8FAVjTV0RkJGcztXDA';

function formatArgs(args) {
  return (args || []).map(a => {
    if (a === null || a === undefined) return { type: 'null' };
    if (typeof a === 'number') return { type: 'integer', value: a.toString() };
    if (typeof a === 'boolean') return { type: 'integer', value: a ? '1' : '0' };
    return { type: 'text', value: a.toString() };
  });
}

function parseResult(res) {
  if (!res || !res.response || !res.response.result) return [];
  const { cols, rows } = res.response.result;
  return rows.map(row => {
    const obj = {};
    cols.forEach((col, idx) => {
      const valObj = row[idx];
      if (!valObj || valObj.type === 'null') {
        obj[col.name] = null;
      } else if (valObj.type === 'integer') {
        obj[col.name] = parseInt(valObj.value, 10);
      } else if (valObj.type === 'float') {
        obj[col.name] = parseFloat(valObj.value);
      } else {
        obj[col.name] = valObj.value;
      }
    });
    return obj;
  });
}

async function query(sql, args = []) {
  const res = await fetch(TURSO_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + TURSO_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql, args: formatArgs(args) } }, { type: 'close' }]
    })
  });
  const data = await res.json();
  if (data.results && data.results[0] && data.results[0].type === 'error') {
    throw new Error(data.results[0].error.message);
  }
  return parseResult(data.results[0]);
}

async function queryOne(sql, args = []) {
  const rows = await query(sql, args);
  return rows[0] || null;
}

async function execute(sql, args = []) {
  const res = await fetch(TURSO_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + TURSO_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql, args: formatArgs(args) } }, { type: 'close' }]
    })
  });
  const data = await res.json();
  if (data.results && data.results[0] && data.results[0].type === 'error') {
    throw new Error(data.results[0].error.message);
  }
  const result = data.results[0].response.result;
  return {
    changes: result.affected_row_count || 0,
    lastInsertRowid: result.last_insert_rowid
  };
}

async function batch(statements) {
  const requests = statements.map(s => {
    if (typeof s === 'string') return { type: 'execute', stmt: { sql: s } };
    return { type: 'execute', stmt: { sql: s.sql, args: formatArgs(s.args) } };
  });
  requests.push({ type: 'close' });
  const res = await fetch(TURSO_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + TURSO_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });
  return res.json();
}

module.exports = { query, queryOne, execute, batch };
