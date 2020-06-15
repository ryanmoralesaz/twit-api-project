let {
  express,
  twit,
  app,
  tools,
  bodyParser
} = require('./tools.js');
/* replace tools with config keys if config file doesn't deploy */
let T = new twit(tools);

let funnyTest;
let tweetText = [],
  followerIds = [],
  followerInfo = [],
  dms = [];
let myProfileImg, myUserName, myName, bannerImg;
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use('/static', express.static('public'));
app.set('view engine', 'pug');

function getLast5Tweets(err, data, response) {
  function getTweets() {
    for (let i = 0; i < data.length; i++) {
      tweetText.push([]);
    };
    for (let i = 0; i < data.length; i++) {
      tweetText[i].push(data[i].text);
    };
    for (let i = 0; i < data.length; i++) {
      tweetText[i].push(data[i].retweet_count);
    };
    for (let i = 0; i < data.length; i++) {
      tweetText[i].push(data[i].favorite_count);
    };
    for (let i = 0; i < data.length; i++) {
      tweetText[i].push(data[i].created_at);
    };
    return tweetText;
  };
  return getTweets();
};

function getLast5Dms(err, data, response) {
  function getDms() {
    for (let i = 0; i < data.length; i++) {
      dms.push([]);
    };
    for (let i = 0; i < data.length; i++) {
      dms[i].push(data[i].text.slice(0, 6));
    };
    for (let i = 0; i < data.length; i++) {
      dms[i].push(data[i].sender.created_at.slice(0, 20));
    };
    for (let i = 0; i < data.length; i++) {
      dms[i].push(data[i].sender.name.slice(0, 3));
    };
    return dms;
  };
  return getDms();
};

function getMyProfileImg(err, data, response) {
  function findMyProfileImg() {
    myProfileImg = data[0].user.profile_image_url;
    return myProfileImg;
  }
  return findMyProfileImg();
};

function getMyUsername(err, data, response) {
  function getUser() {
    myUserName = data[0].user.screen_name;
    return myUserName;
  }
  return getUser();
};

function getMyName(err, data, response) {
  function getName() {
    myName = data[0].user.name;
    return myName;
  }
  return getName();
};

function getFriendsCount(err, data, response) {
  function getFriendsCount() {
    friendsCount = data[0].user.friends_count;
    return friendsCount;
  }
  return getFriendsCount();
};

function getFollowerIds(err, data, response) {
  function getFollowerIds() {
    for (let i = 0; i < data.users.length; i++) {
      followerIds.push(data.users[i].id_str);
    };
    return followerIds;
  }
  return getFollowerIds();
};

function getFollowerInfo(err, data, response) {
  function getFollowerInfo() {
    for (let i = 0; i < data.users.length; i++) {
      followerInfo.push([]);
    };
    for (let i = 0; i < data.users.length; i++) {
      followerInfo[i].push(data.users[i].screen_name);
    };
    for (let i = 0; i < data.users.length; i++) {
      followerInfo[i].push(data.users[i].name);
    };
    for (let i = 0; i < data.users.length; i++) {
      followerInfo[i].push(data.users[i].profile_image_url);
    };
    return followerInfo;
  }
  return getFollowerInfo();
};

function clearPlace() {
  placeholder = "What's happening?";
}
T.get('statuses/user_timeline', {
  count: 1
}, getFriendsCount).then(
  T.get('statuses/user_timeline', {
    count: 1
  }, getMyName).then(
    T.get('statuses/user_timeline', {
      count: 1
    }, getMyUsername).then(
      T.get('statuses/user_timeline', {
        count: 1
      }, getMyProfileImg).then(
        T.get('statuses/user_timeline', {
          count: 5
        }, getLast5Tweets).then(
          T.get('followers/list', {
            count: 5
          }, getFollowerInfo).then(
            T.get('direct_messages', {
              count: 5
            }, getLast5Dms).then(
              T.get('statuses/user_timeline', {
                count: 1
              }, function(err, data, response) {
                bannerImg = data[0].user.profile_banner_url
              }).then(
                app.get('/', (req, res, next) => {
                  try {
                    res.locals.bannerImg = bannerImg;
                    res.locals.dmInfo = dms;
                    res.locals.friendsCount = friendsCount;
                    res.locals.myName = myName;
                    res.locals.tweets = tweetText;
                    res.locals.myUserName = '@' + myUserName;
                    res.locals.myProfileImg = myProfileImg;
                    res.locals.followerInfo = followerInfo;
                    res.render('index');
                  } catch (error) {
                    res.render('sorry');
                  }
                })))))))));
app.post('/', (req, res) => {
  T.post('statuses/update', {
    status: req.body.newTweet
  }, function(err, data, response) {
    res.redirect('back');
  })
});
app.listen(3000, () => {
  console.log('the application is running on :3000')
});
