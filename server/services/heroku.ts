
import { getSetting } from "../models/AppSettings.js";

async function getHerokuApiKey(): Promise<string> {
  const fromDb = await getSetting("herokuApiKey", "");
  if (typeof fromDb === "string" && fromDb.trim()) {
    return fromDb.trim();
  }
  return (process.env.HEROKU_API_KEY || "").trim();
}

async function herokuHeaders(): Promise<Record<string, string>> {
  const key = await getHerokuApiKey();

  return {
    Authorization: `Bearer ${key}`,
    Accept: "application/vnd.heroku+json; version=3",
    "Content-Type": "application/json",
  };
}

export async function getTeamAppCount(team: string): Promise<number> {
  const key = await getHerokuApiKey();

  if (!key) {
    throw new Error("HEROKU_API_KEY is missing.");
  }

  const res = await fetch(
    `https://api.heroku.com/teams/${encodeURIComponent(team)}/apps`,
    { headers: await herokuHeaders() }
  );

  if (!res.ok) {
    console.error(
      `[HEROKU] Team access check failed: team=${team} status=${res.status}`
    );
    return Infinity;
  }

  const apps = await res.json() as Array<Record<string, unknown>>;
  return apps.length;
}

export async function findBestTeam(teams: string[]): Promise<string | null> {
  const preferredTeam = (process.env.HEROKU_TEAM || "gestontechhxd").trim();

  if (!preferredTeam) {
    throw new Error("No Heroku team configured.");
  }

  // Always try the preferred team first.
  try {
    const count = await getTeamAppCount(preferredTeam);

    if (Number.isFinite(count)) {
      console.log(`[HEROKU] Using preferred team: ${preferredTeam}`);
      return preferredTeam;
    }
  } catch (err) {
    console.error(
      `[HEROKU] Preferred team check failed: ${
        err instanceof Error ? err.message : "unknown error"
      }`
    );
  }

  // Try other active teams only if the preferred team is inaccessible.
  const alternatives = [
    ...new Set(
      teams
        .map(team => team.trim())
        .filter(team => team && team !== preferredTeam)
    ),
  ];

  let bestTeam: string | null = null;
  let lowestCount = Infinity;

  for (const team of alternatives) {
    try {
      const count = await getTeamAppCount(team);

      if (count < lowestCount) {
        lowestCount = count;
        bestTeam = team;
      }
    } catch (err) {
      console.error(
        `[HEROKU] Team check failed for ${team}: ${
          err instanceof Error ? err.message : "unknown error"
        }`
      );
    }
  }

  if (!bestTeam) {
    throw new Error(
      "Heroku API cannot access any team. Check the API key and its access to gestontechhxd."
    );
  }

  return bestTeam;
}

export async function deployBotApp(
  appName: string,
  team: string,
  session: string,
  phoneNumber: string,
  isTrial: boolean = false,
  sourceUrlOverride?: string,
  envOverrides?: Record<string, string>
): Promise<{ success: boolean; setupId?: string }> {
  const apiKey = await getHerokuApiKey();

  if (!apiKey) {
    throw new Error("HEROKU_API_KEY is missing.");
  }

  const sourceUrl =
    sourceUrlOverride ||
    "https://github.com/gestontech/Geston-MD/tarball/main";

  const baseEnv = envOverrides || {
    SESSION: session,
    BOT_NAME: appName,
    OWNER_NUMBER: phoneNumber,
    HEROKU_API_KEY: apiKey,
    HEROKU_APP_NAME: appName,
  };

  const env = {
    ...baseEnv,
    HEROKU_APP_NAME: baseEnv.HEROKU_APP_NAME || appName,
    GESTONHOSTING: "1",
  };

  // Never print SESSION, API keys, or environment values.
  const envKeys = Object.keys(env).sort().join(",");

  console.log(
    `[DEPLOY] app=${appName} team=${team} isTrial=${isTrial} envKeys=${envKeys} secretsRedacted=true`
  );

  const res = await fetch("https://api.heroku.com/app-setups", {
    method: "POST",
    headers: await herokuHeaders(),
    body: JSON.stringify({
      app: {
        name: appName,
        organization: team,
      },
      source_blob: {
        url: sourceUrl,
      },
      overrides: {
        env,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();

    console.error(
      `[DEPLOY] Heroku setup failed: status=${res.status} response=${body}`
    );

    return { success: false };
  }

  const data = await res.json() as { id?: string };

  return {
    success: true,
    setupId: data.id,
  };
}

export async function getAppSetupStatus(
  setupId: string
): Promise<Record<string, unknown> | null> {
  const res = await fetch(
    `https://api.heroku.com/app-setups/${setupId}`,
    { headers: await herokuHeaders() }
  );

  if (!res.ok) return null;

  return await res.json() as Record<string, unknown>;
}

export async function getAppInfo(
  appName: string
): Promise<Record<string, unknown> | null> {
  const res = await fetch(
    `https://api.heroku.com/apps/${appName}`,
    { headers: await herokuHeaders() }
  );

  if (!res.ok) return null;

  return await res.json() as Record<string, unknown>;
}

export async function deleteApp(appName: string): Promise<boolean> {
  const res = await fetch(
    `https://api.heroku.com/apps/${appName}`,
    {
      method: "DELETE",
      headers: await herokuHeaders(),
    }
  );

  return res.ok;
}

export async function restartApp(appName: string): Promise<boolean> {
  const res = await fetch(
    `https://api.heroku.com/apps/${appName}/dynos`,
    {
      method: "DELETE",
      headers: await herokuHeaders(),
    }
  );

  return res.ok;
}

export async function getAppStatus(
  appName: string
): Promise<{ state?: string; type?: string } | null> {
  try {
    const [appRes, dynoRes] = await Promise.all([
      fetch(
        `https://api.heroku.com/apps/${appName}`,
        { headers: await herokuHeaders() }
      ),
      fetch(
        `https://api.heroku.com/apps/${appName}/dynos`,
        { headers: await herokuHeaders() }
      ),
    ]);

    if (!appRes.ok) return null;

    const dynos = dynoRes.ok
      ? await dynoRes.json() as Array<{
          state?: string;
          type?: string;
        }>
      : [];

    const web = dynos.find(d => d.type === "web") || dynos[0];

    return web || { state: "unknown" };
  } catch {
    return null;
  }
}

export async function getAppLogs(appName: string): Promise<string> {
  const res = await fetch(
    `https://api.heroku.com/apps/${appName}/log-sessions`,
    {
      method: "POST",
      headers: await herokuHeaders(),
      body: JSON.stringify({
        lines: 100,
        tail: false,
      }),
    }
  );

  if (!res.ok) return "Failed to fetch logs";

  const data = await res.json() as {
    logplex_url?: string;
  };

  if (!data.logplex_url) return "Failed to fetch logs";

  const logRes = await fetch(data.logplex_url);

  if (!logRes.ok) return "Failed to fetch logs";

  return await logRes.text();
}

export async function scaleDyno(
  appName: string,
  type: string,
  quantity: number
): Promise<boolean> {
  const res = await fetch(
    `https://api.heroku.com/apps/${appName}/formation/${type}`,
    {
      method: "PATCH",
      headers: await herokuHeaders(),
      body: JSON.stringify({ quantity }),
    }
  );

  return res.ok;
}

export async function stopApp(appName: string): Promise<boolean> {
  const scaled = await scaleDyno(appName, "web", 0).catch(() => false);

  if (!scaled) {
    const res = await fetch(
      `https://api.heroku.com/apps/${appName}`,
      {
        method: "PATCH",
        headers: await herokuHeaders(),
        body: JSON.stringify({ maintenance: true }),
      }
    );

    return res.ok;
  }

  return scaled;
}

export async function startApp(appName: string): Promise<boolean> {
  const scaled = await scaleDyno(appName, "web", 1).catch(() => false);

  if (!scaled) {
    const res = await fetch(
      `https://api.heroku.com/apps/${appName}`,
      {
        method: "PATCH",
        headers: await herokuHeaders(),
        body: JSON.stringify({ maintenance: false }),
      }
    );

    return res.ok;
  }

  return scaled;
}

export async function enableMaintenanceMode(
  appName: string
): Promise<boolean> {
  const res = await fetch(
    `https://api.heroku.com/apps/${appName}`,
    {
      method: "PATCH",
      headers: await herokuHeaders(),
      body: JSON.stringify({ maintenance: true }),
    }
  );

  return res.ok;
}

export async function disableMaintenanceMode(
  appName: string
): Promise<boolean> {
  const res = await fetch(
    `https://api.heroku.com/apps/${appName}`,
    {
      method: "PATCH",
      headers: await herokuHeaders(),
      body: JSON.stringify({ maintenance: false }),
    }
  );

  return res.ok;
}

export async function setConfigVar(
  appName: string,
  key: string,
  value: string
): Promise<boolean> {
  const res = await fetch(
    `https://api.heroku.com/apps/${appName}/config-vars`,
    {
      method: "PATCH",
      headers: await herokuHeaders(),
      body: JSON.stringify({ [key]: value }),
    }
  );

  return res.ok;
}

export async function getTeamApps(team: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.heroku.com/teams/${encodeURIComponent(team)}/apps`,
      { headers: await herokuHeaders() }
    );

    if (!res.ok) return [];

    const apps = await res.json() as { name: string }[];

    return apps.map(app => app.name);
  } catch {
    return [];
  }
}

export { getHerokuApiKey };

export async function appExists(appName: string): Promise<boolean> {
  const info = await getAppInfo(appName);
  return !!info;
}

export async function getSetupStatus(
  setupId: string
): Promise<{ status: string }> {
  const data = await getAppSetupStatus(setupId);

  if (!data) return { status: "unknown" };

  const status =
    typeof data.status === "string"
      ? data.status
      : "unknown";

  return { status };
}
