const myVersion = "0.4.0", myProductName = "myLogseqBlog";

const fs = require ("fs");
const utils = require ("daveutils");
const request = require ("request"); 
const opml = require ("opml"); 

var config = {
	twScreenName: undefined,
	
	logSeqJournalFolder: undefined,
	opmlJournalFile: undefined,
	
	blogTitle: undefined,
	blogDescription: undefined,
	blogWhenCreated: undefined,
	blogTimeZoneOffset: undefined,
	blogCopyright: undefined,
	blogUrlHeaderImage: undefined,
	blogUrlTemplate: undefined,
	blogUrlHomePageTemplate: undefined,
	blogUrlGlossary: undefined,
	blogUrlAboutOpml: undefined,
	blogUrlWebsite: undefined,
	blogUseCache: false,
	
	urlTwitterServer: "http://drummer.scripting.com/",
	
	
	oauth_token: undefined,
	oauth_token_secret: undefined
	};

function readConfig (f, theConfig, callback) { 
	fs.readFile (f, function (err, jsontext) {
		if (!err) {
			try {
				var jstruct = JSON.parse (jsontext);
				for (var x in jstruct) {
					theConfig [x] = jstruct [x];
					}
				}
			catch (err) {
				console.log ("readConfig: err.message == " + err.message);
				}
			}
		callback ();
		});
	}
function buildParamList (paramtable, flPrivate) {
	var s = "";
	if (flPrivate) {
		paramtable.flprivate = "true";
		}
	for (var x in paramtable) {
		if (paramtable [x] !== undefined) { //8/4/21 by DW
			if (s.length > 0) {
				s += "&";
				}
			s += x + "=" + encodeURIComponent (paramtable [x]);
			}
		}
	return (s);
	}
function httpReadUrl (url, callback) {
	request (url, function (err, response, data) {
		if (!err && (response.statusCode == 200)) {
			callback (undefined, data.toString ());
			}
		else {
			if (!err) {
				err = {
					message: "Can't read the file because there was an error. Code == " + response.statusCode + "."
					}
				}
			callback (err);
			}
		});
	}
function httpPost (url, data, callback) {
	var theRequest = {
		method: "POST",
		body: data,
		url: url
		};
	request (theRequest, function (err, response, data) {
		if (err) {
			callback (err);
			}
		else {
			if (response.statusCode != 200) {
				const message = "The request returned a status code of " + response.statusCode + ".";
				callback ({message});
				}
			else {
				callback (undefined, data) 
				}
			}
		});
	}
function serverpost (path, params, flAuthenticated, filedata, callback) {
	var whenstart = new Date ();
	if (params === undefined) {
		params = new Object ();
		}
	if (flAuthenticated) { //1/11/21 by DW
		params.oauth_token = config.oauth_token;
		params.oauth_token_secret = config.oauth_token_secret;
		}
	var url = config.urlTwitterServer + path + "?" + buildParamList (params, false);
	httpPost (url, filedata, callback);
	
	
	}
function getDateString (theDate=new Date ()) {
	return (new Date (theDate).toUTCString ());
	}

function readJournalFolderIntoOutline (folder, callback) {
	var now = new Date ();
	var theOutline = {
		opml: {
			head: {
				},
			body: {
				}
			}
		};
	function setupOpmlHead () {
		var head = {
			title: config.blogTitle,
			description: config.blogDescription,
			dateCreated: getDateString (config.blogWhenCreated),
			dateModified: getDateString (now),
			timeZoneOffset: config.blogTimeZoneOffset,
			copyright: config.blogCopyright,
			urlHeaderImage: config.blogUrlHeaderImage,
			urlTemplate: config.blogUrlTemplate,
			urlHomePageTemplate: config.blogUrlHomePageTemplate,
			urlGlossary: config.blogUrlGlossary,
			urlAboutOpml: config.blogUrlAboutOpml,
			urlBlogWebsite: config.blogUrlWebsite,
			flOldSchoolUseCache: config.blogUseCache
			};
		for (var x in head) {
			if (head [x] !== undefined) {
				theOutline.opml.head [x] = head [x];
				}
			}
		}
	function getMonthName (d) {
		return (new Date (d).toLocaleString ("default", {month: "long"}));
		}
	function isFolder (f) { 
		return (fs.statSync (f).isDirectory ());
		}
	function addJournalFileToOutline (fname, mdtext) {
		if (fname.length > 0) {
			if (fname [0] != ".") { //not .DS_Store
				console.log ("addJournalFileToOutline: fname == "+ fname + ", mdtext.length == " + mdtext.length);
				
				var splits = (fname.split (".") [0]).split ("_");
				var year = splits [0];
				var month = splits [1];
				var day = splits [2];
				
				var theDate = new Date (0);
				theDate.setFullYear (year);
				theDate.setMonth (month - 1);
				theDate.setDate (day);
				
				var monthname = getMonthName (theDate);
				
				function bumpDate () { //every node needs a unique created att
					theDate.setSeconds (theDate.getSeconds () + 1);
					return (theDate);
					}
				function getSub (parent, theSub) {
					if (parent.subs === undefined) {
						parent.subs = new Array ();
						}
					for (var i = 0; i < parent.subs.length; i++) {
						var item = parent.subs [i];
						if (item.text == theSub.text) { //it's already there
							return (item);
							}
						}
					if (theSub.subs === undefined) {
						theSub.subs = new Array ();
						}
					parent.subs.unshift (theSub);
					return (parent.subs [0]);
					}
				
				var theMonth = getSub (theOutline.opml.body, {
					text: monthname + " " + year,
					type: "calendarMonth",
					created: bumpDate ().toUTCString (),
					name: monthname.toLowerCase () + year
					});
				var theDay = getSub (theMonth, {
					text: monthname + " " + Number (day),
					type: "calendarDay",
					created: bumpDate ().toUTCString (),
					name: day
					});
				
				var theDayOutline = opml.markdownToOutline (mdtext, {flAddUnderscores: false});
				theDay.subs = theDayOutline.opml.body.subs;
				theDay.subs.forEach (function (item) {
					item.type = "outline";
					item.created = bumpDate ().toUTCString ();
					});
				}
			}
		}
	function readNextFile (list, ix) {
		if (ix >= list.length) {
			if (callback !== undefined) {
				setupOpmlHead ();
				callback (undefined, theOutline);
				}
			}
		else {
			var fname = list [ix];
			var f = folder + fname;
			if (isFolder (f)) {
				readNextFile (list, ix + 1);
				}
			else {
				fs.readFile (f, function (err, data) {
					if (err) {
						console.log ("readJournalFolderIntoOutline: f == "+ f + ", err.message == " + err.message);
						}
					else {
						addJournalFileToOutline (fname, data.toString ());
						}
					readNextFile (list, ix + 1);
					});
				}
			}
		}
	fs.readdir (folder, function (err, list) {
		if (err) {
			console.log ("readJournalFolderIntoOutline: err.message == " + err.message);
			}
		else {
			if (list !== undefined) { 
				readNextFile (list, 0);
				}
			}
		});
	}
function saveMyLogSeqOpml (callback) {
	readJournalFolderIntoOutline (config.logSeqJournalFolder, function (err, theOutline) {
		if (err) {
			console.log ("saveMyLogSeqOpml: err.message == " + err.message);
			}
		else {
			var opmltext = opml.stringify (theOutline);
			if (config.opmlJournalFile !== undefined) {
				fs.writeFile (config.opmlJournalFile, opmltext, function (err) {
					if (err) {
						console.log ("saveMyLogSeqOpml: err.message == " + err.message);
						}
					});
				}
			if (callback !== undefined) {
				callback (undefined, opmltext);
				}
			}
		});
	}

readConfig ("config.json", config, function () {
	console.log ("config == " + utils.jsonStringify (config));
	saveMyLogSeqOpml (function (err, opmltext) {
		if (err) {
			console.log ("logseqpublish: err.message == " + err.message);
			}
		else {
			console.log ("logseqpublish: opmltext.length == " + opmltext.length);
			serverpost ("writewholefile", {relpath: "blog.opml"}, true, opmltext, function (err, data) {
				if (err) {
					console.log ("writeWholeFile: err.message == " + err.message);
					}
				else {
					httpReadUrl ("http://drummercms.scripting.com/build?blog=" + config.twScreenName, function (err, data) {
						if (err) {
							console.log ("drummerCms: err.message == " + err.message);
							}
						else {
							console.log (data);
							}
						});
					
					}
				});
			}
		});
	});
