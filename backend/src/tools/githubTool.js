// ============================================================
// GitHub Tool (MCP-Inspired)
// ============================================================
// This tool simulates an MCP-style integration: a single async
// function that returns raw, structured data only.

const axios = require('axios');
require('dotenv').config();

const GITHUB_API = 'https://api.github.com';

// Set up request headers
// If a GitHub token is provided, we get 5000 requests/hour instead of 60
const getHeaders = () => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'SmartStandupBot/1.0'
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

// Fetch recent public events for a user
const getRecentEvents = async (username) => {
  const response = await axios.get(
    `${GITHUB_API}/users/${username}/events/public?per_page=30`,
    { headers: getHeaders() }
  );
  return response.data;
};

// Extract commits and other useful activity from GitHub events
const extractActivity = (events = []) => {
  const activities = [];

  const addActivity = (message, repo, date, type) => {
    const trimmed = (message || '').trim();
    if (!trimmed) {
      return;
    }
    activities.push({
      message: trimmed,
      repo: repo || 'unknown/unknown',
      date,
      type
    });
  };

  for (const event of events) {
    const repo = event.repo?.name || 'unknown/unknown';
    const date = event.created_at;

    if (event.type === 'PushEvent' && event.payload?.commits?.length) {
      for (const commit of event.payload.commits) {
        const message = (commit.message || '').split('\n')[0];
        addActivity(message, repo, date, 'commit');
      }
      continue;
    }

    if (event.type === 'PullRequestEvent' && event.payload?.pull_request) {
      const pr = event.payload.pull_request;
      const action = event.payload.action || 'updated';
      const actionLabel = action === 'closed' && pr.merged ? 'merged' : action;
      const title = pr.title || 'PR';
      addActivity(`PR ${actionLabel}: ${title}`, repo, date, 'pull_request');
      continue;
    }

    if (event.type === 'PullRequestReviewEvent' && event.payload?.pull_request) {
      const pr = event.payload.pull_request;
      const state = (event.payload.review?.state || 'reviewed').toLowerCase();
      const title = pr.title || 'PR';
      addActivity(`Reviewed PR (${state}): ${title}`, repo, date, 'pull_request_review');
      continue;
    }

    if (event.type === 'IssuesEvent' && event.payload?.issue) {
      const issue = event.payload.issue;
      const action = event.payload.action || 'updated';
      const title = issue.title || 'Issue';
      addActivity(`Issue ${action}: ${title}`, repo, date, 'issue');
      continue;
    }

    if (event.type === 'IssueCommentEvent' && event.payload?.issue) {
      const issue = event.payload.issue;
      const title = issue.title || 'Issue';
      addActivity(`Commented on issue: ${title}`, repo, date, 'issue_comment');
      continue;
    }

    if (event.type === 'CreateEvent' && event.payload?.ref_type) {
      const refType = event.payload.ref_type;
      const refName = event.payload.ref ? ` ${event.payload.ref}` : '';
      addActivity(`Created ${refType}${refName}`, repo, date, 'create');
      continue;
    }

    if (event.type === 'ReleaseEvent' && event.payload?.release) {
      const release = event.payload.release;
      const name = release.name || release.tag_name || 'release';
      addActivity(`Published release: ${name}`, repo, date, 'release');
      continue;
    }
  }

  return activities.slice(0, 20);
};

// Extract recent repositories the user has been active in
const extractRepos = (events = []) => {
  const repoNames = [...new Set(events.map(e => e.repo?.name).filter(Boolean))];
  return repoNames.slice(0, 5);
};

// MCP-inspired tool entry point
module.exports = async function githubTool(args = {}) {
  const username = args.username ? String(args.username).trim() : '';
  if (!username) {
    throw new Error('GitHub username is required');
  }

  const events = await getRecentEvents(username);
  const commits = extractActivity(events);
  const repos = extractRepos(events);

  return { commits, repos, events };
};
