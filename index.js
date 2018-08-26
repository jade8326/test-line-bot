'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const bodyParser = require('body-parser');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();
app.use(bodyParser.json());

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.post('/webhook', function (req, res) {



  var separator = {
    "type": "separator",
    "margin": "xxl"
  };


  var head = req.body.head_commit;
  var commits = req.body.commits;
  var msg = getHeaderBlock(req.body.pusher.name, req.body.ref.replace('refs/heads/',''), req.body.repository.full_name);
  
  msg.contents.body.contents.push(separator);
  msg.contents.body.contents.push(getCommitBlock(head.id, head.committer.name, head.message));

  for (var i = 0; i < commits.length && i < 2; i++) {
    msg.contents.body.contents.push(getCommitBlock(commits[i].id, commits[i].committer.name, commits[i].message));
  }

  client.pushMessage('U5c2ce99cb49683785d361652b15195c1', msg);


  console.log(req.body.commits);
  res.status(200).end();
});

function getHeaderBlock(pusher, branch, repo) {
  return {
    "type": "flex",
    "altText": "incoming-webhook",
    "contents": {
      "type": "bubble",
      "styles": {
        "footer": {
          "separator": true
        }
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [{
          "type": "text",
          "text": "incoming-webhook",
          "weight": "bold",
          "color": "#1DB446",
          "size": "sm"
        }, {
          "type": "text",
          "text": pusher + " pushed branch of " + branch + " to " + repo,
          "size": "xs",
          "color": "#aaaaaa",
          "wrap": true
        }]
      }
    }
  };
}

function getCommitBlock(commitId, committer, message) {

  return {
    "type": "box",
    "layout": "vertical",
    "margin": "xl",
    "spacing": "sm",
    "contents": [{
      "type": "box",
      "layout": "horizontal",
      "spacing": "sm",
      "contents": [{
        "type": "text",
        "text": commitId.substring(0, 10),
        "size": "xs",
        "color": "#555555",
        "flex": 0
      }, {
        "type": "text",
        "text": committer,
        "wrap": true,
        "size": "xs",
        "color": "#111111",
        "align": "end"
      }]
    }, {
      "type": "box",
      "layout": "horizontal",
      "spacing": "sm",
      "contents": [{
        "type": "text",
        "text": message,
        "size": "xs",
        "color": "#aaaaaa",
        "flex": 0,
        "wrap": true
      }]
    }]
  };

}

// event handler
function handleEvent(event) {

  console.log(event);

  return Promise.resolve(null); //need for logging only

  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
