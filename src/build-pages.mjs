// const { Octokit } = require("@octokit/rest");
import { Octokit } from "@octokit/rest";
const octokit = new Octokit({});
// const Mustache = require('mustache');
import Mustache from 'mustache';
// const fs = require("fs");
import fs from "fs";
// const df = require("./date-format.js")
import df from "./date-format.js";

// Build
octokit.rest.issues.listForRepo({
  owner: process.env.owner,
  repo: process.env.repo,
})
  .then(issues => {

    issues.owner = process.env.owner
    issues.repo = process.env.repo

    // Format issue object
    const data = issues.data.map(issue => issue.updated_at_short = df.shortDate(issue.updated_at))
    console.log("issues: ", issues)

    // Build index
    const index_template = fs.readFileSync("templates/index.template.html", "utf8").toString();
    const index_html = Mustache.render(index_template, issues)
    fs.writeFileSync("index.html", index_html, "utf8");

    // Build post
    // target_issues = issues.data.filter((ti) => {
    //   return ti.id == process.env.target_issue_id
    // });
    // target_issue = target_issues[0]

    const target_issues = data

    target_issues.forEach(target_issue => {
      markdown = target_issue.body
      const issue_template = fs.readFileSync("templates/post.template.html", "utf8").toString();
      octokit.rest.markdown.render({ "text": markdown, "mode": "gfm" })
        .then(issue_html => {
          target_issue.issue_html = issue_html
          const issue_page = Mustache.render(issue_template, target_issue)
          fs.writeFileSync("posts/" + target_issue.id + ".html", issue_page, "utf8");
        });

    });

  });
