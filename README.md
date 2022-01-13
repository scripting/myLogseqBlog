# myLogseqBlog

A cross-platform Node app that publishes a LogSeq journal as a blog via Drummer

### How to install

1. Download the app from the repo.

2. Open the folder in the Terminal app. On the Mac you can do this by dragging the folder onto the Terminal app icon.

3. Type <i>npm install</i> at the command prompt. 

4. Edit config.json following the instructions below.

### Setting up config.json

There are a bunch of values you have to set up in config.json to configure your blog. I've provided an example config.json file with those values specified, you just have to change them. 

1. twScreenName -- your Twitter screen name.

2. logSeqJournalFolder -- the path to your LogSeq journals folder. 

3. opmlJournalFile -- optional, a path to the OPML file that myLogseqBlog generates. You don't need this file to publish your blog.

4. blogTitle -- the title of your blog, this is displayed at the top of every page and in your RSS feed. 

5. blogDescription -- describes your blog, could be a slogan, whatever you like, it's displayed in smaller type under the title, and in your feed.

6. blogWhenCreated -- the date and time when your blog started. It should probably be the date and time when you installed this software. 

7. blogTimeZoneOffset -- your blog will appear to be in this timezone. It's the offset from GMT of that timezone. If you're in New York, it would be -5. In England it would be 0. In Beijing it would be +8.

8. blogCopyright -- a copyright notice. You can leave this empty if you don't have one. 

9. blogUrlHeaderImage -- the URL of a wide rectangular image to be displayed at the top of every page. There is a default image if you don't provide one. 

10. oauth_token, oauth_token_secret -- myLogseqBlog uses these values and the next one to identify you to the Drummer system, so it knows which account to store your outline under. It is not saved in the OPML file it generates. The next section explains how to get these values. 

### Drummer setup

Drummer uses Twitter for identity, so you will need a Twitter account to associate with your blog.

If your Twitter username is lisasimpson, your blog will be at this URL:

http://oldschool.scripting.com/lisasimpson/

To establish this connection, go to the <a href="http://drummer.scripting.com/">Drummer website</a> and log in with your Twitter id. 

When Drummer opens, if this is your first time using it, a file named Notes will open automatically. 

You can use this outline to get the values that are needed in config.json. 

In the top headline enter: <i>localStorage</i> and press Cmd-/ (on Mac, Control-/ on Windows and Linux).

Double-click on the headline that appears to reveal a bunch of values. Theones you want are:

1. localStorage.twOauthToken

2. localStorage.twOauthTokenSecret

Copy these values into oauth_token and oauth_token_secret in your config.json file. 

### How to use

I am a LogSeq newbie, so my instructions for using it will be rudimentary and possibly incomplete. But this worked for me, and hopefully will work for you. :smile:

First, the journals folder you specify in config.json will be public. Be sure not to add any private information to those files -- they will become public when you publish your blog. I understand it's possible to have more than one journals folder, if so you might want to set up a new one just for your blog. 

Write whatever you want into your journal and when you're ready to publish, go to the myLogseqBlog folder and run the app by typing this into your Terminal app.

node mylogseqblog.js

You should see a bunch of messages scroll by, hopefully no errors. It should take no more than a couple of seconds. When it's done, try opening your blog in a browser.

http://oldschool.scripting.com/yourtwitterscreenname/

Add something new to the journal, run the app again. 

### Questions, comments?

Post an issue <a href="https://github.com/scripting/myLogseqBlog/issues/new">here</a>. 

