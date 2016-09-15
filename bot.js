/////////////////////////////////
/// Default Response Messages ///
/////////////////////////////////

const directMessageReply = "Hello, I'm PictureGame-Bot! Use !commands in the public chat to see a list of available commands.";
const mentionReply = "use !commands to see a list of available commands";

/////////////////////////////////////
/// Requirements and Declarations ///
/////////////////////////////////////

const Discord = require('discord.js');
const https = require('https');
const snoowrap = require('snoowrap');
const cheerio = require('cheerio');
const AuthDetails = require("./auth.json");

const botName = "PictureGame-Bot"
const serverID = "189581845376008202";
const channelID = "189582201640321024";
const adminRole = "Mods";

var currentRoundData;
var madList = [];

const bot = new Discord.Client({
    autoReconnect : true
});

const r = new snoowrap({
  user_agent: AuthDetails.user_agent,
  client_id: AuthDetails.client_id,
  client_secret: AuthDetails.client_secret,
  username: AuthDetails.username,
  password: AuthDetails.password
});

////////////////////////
/// List of Commands ///
////////////////////////

var commands = [
    {
        command: "hi",
        description: "Says hello to whoever made the command",
        parameters: [],
        permissions: [],
        execute: function(message, params) {
            message.reply("hello there!");
        }
    },
    
    {
        command: "current",
        description: "Returns the most current round on r/PictureGame",
        parameters: [],
        permissions: [],
        execute: function(message, params) {
            message.channel.sendMessage("The current PictureGame round is:" + "\n\n**" + currentRoundData.title + "** by " + currentRoundData.user + "\n" + "http://redd.it/" + currentRoundData.id  + "\n" + currentRoundData.pic);
        }
    },

    {
        command: "stats",
        description: "Returns the r/PictureGame stats of a given user",
        parameters: ["user"],
        permissions: [],
        execute: function(message, params) {
            getStats(message, params[1]);
        }
    },

    {
        command: "leaderboard",
        description: "Returns the top 25 leaderboard for r/PictureGame",
        parameters: [],
        permissions: [],
        execute: function(message, params) {
            getLeaderboard(function(top25) {
                message.channel.sendMessage(top25);
            });
        }
    },

    {
        command: "rule",
        description: "Provides text of a specific r/PictureGame rule",
        parameters: ["rule number"],
        permissions: [],
        execute: function(message, params) {
            switch(params[1]) {
                case "1":
                message.channel.sendMessage("**PictureGame Rule 1:**\nHave a picture and a question ready to post upon winning a round. If there will be a significant delay, please indicate an estimated time for the new round.\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                case "2":
                message.channel.sendMessage("**PictureGame Rule 2:**\nIf no one has correctly solved your round within 1 hour, you will need to provide a major hint in the comments.\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                case "3":
                message.channel.sendMessage("**PictureGame Rule 3:**\nKeep the picture \"safe for work\".\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                case "4":
                message.channel.sendMessage("**PictureGame Rule 4:**\nDon't make your round too easy! Do a reverse image search of your picture before posting. We suggest checking both Google Image Search and Tineye, or using an extension such as Reveye. A quality round should last at least 15 minutes (barring prior knowledge).\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                case "5":
                message.channel.sendMessage("**PictureGame Rule 5:**\nRounds must be clear, undebatable and unvague. All rounds must have only one legitimate answer. Please phrase your questions to abide by this rule.\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                case "6":
                message.channel.sendMessage("**PictureGame Rule 6:**\nYou can make as many guesses as you would like during a round. However, you cannot make multiple guesses in one reply *(ex: \"Could be Fenway or Wrigley\")* or post a massive list. Each guess must be its own reply. You are welcome to share lists or links to lists, but these will not be considered an answer.\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                case "7":
                message.channel.sendMessage("**PictureGame Rule 7:**\nMake sure to design your round so that there is a clear available path to victory based solely on the contents of the picture and phrasing of the question. A round should not require hints.\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                case "8":
                message.channel.sendMessage("**PictureGame Rule 8:**\nNo \"ninja\" edits on answers unless you are fixing something not related to the answer.\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                case "9":
                message.channel.sendMessage("**PictureGame Rule 9:**\nWe are not here to read your mind!\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                case "10":
                message.channel.sendMessage("**PictureGame Rule 10:**\nDo not provide major hints early on (within the first 30 minutes). Giving away rounds with easy hints or making them too easy discourages effort and hurts those who design more complicated rounds.\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                case "11":
                message.channel.sendMessage("**PictureGame Rule 11:**\nDo NOT delete your past rounds or past correct answers.\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                case "12":
                message.channel.sendMessage("**PictureGame Rule 12:**\nDo NOT post a round asking players to provide a link to an answer. These often get caught in Reddit's spam filter. Only Reddit links that include URLs with a \"/u/\" or \"/r/\" *(ex. /u/ewulkevoli or /r/picturegame)* may be acceptable.\n\nThe complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
                break;
                
                default:
                message.channel.sendMessage("The complete rules of PictureGame can be found here:\n\nhttps://www.reddit.com/r/PictureGame/wiki/rules")
            }
        }
    },

    {
        command: "whoismad",
        description: "See the list of everyone who is mad today",
        parameters: [],
        permissions: [],
        execute: function(message, params) {
        	var newList = madList.join("\n");
        	message.channel.sendMessage("Here's who's mad today:\n\n" + newList);
        }
    },

    {
        command: "addmad",
        description: "Add a user to the list of people mad today",
        parameters: ["user"],
        permissions: ['admin'],
        execute: function(message, params) {
            addMadList(params[1]);
        }
    },

    {
        command: "removemad",
        description: "Remove a user from the list of people mad today",
        parameters: ["user"],
        permissions: ['admin'],
        execute: function(message, params) {
            removeMadList(params[1]);
        }
    },

    {
        command: "celebrate",
        description: "Celebrate with the group",
        parameters: [],
        permissions: [],
        execute: function(message, params) {
            message.channel.sendFile("http://i.imgur.com/Gq2i2lv.gif");
        }
    },

    {
        command: "sing",
        description: "Hear some lyrics from PictureGame-Bot's favorite song",
        parameters: [],
        permissions: [],
        execute: function(message, params) {
            message.channel.sendMessage(":musical_note: *I see you when you're posting... I know when you +correct... I know if your image is RIS-able... No round will go unchecked!* :musical_note:");
        }
    },

    {
        command: "fox",
        description: "The most pressing question is finally answered",
        parameters: [],
        permissions: [],
        execute: function(message, params) {
            message.channel.sendMessage("The fox says: **\"Wa-ba-ba-ba-ba-ba-ban!\"**");
        }
    },

        {
        command: "commands",
        description: "Displays a list of the current commands",
        parameters: [],
        permissions: [],
        execute: function(message, params) {
            var response = "here are the available commands:\n";
            
            for(var i = 0; i < commands.length; i++) {
                var c = commands[i];
                response += "\n**!" + c.command + "**";
                
                for(var j = 0; j < c.parameters.length; j++) {
                    response += " **<" + c.parameters[j] + ">**";
                }
                
                response += ": " + c.description;
            }
            
            message.reply(response);
        }
    },

    {
        command: "sethost",
        description: "Set a user as the host of the current round on r/PictureGame",
        parameters: ["user"],
        permissions: ['admin'],
        execute: function(message, params) {
            setCurrentHost(params[1], function(host) {
                if (!host) {
                    message.channel.sendMessage(child.data.author + " is the host but I couldn't set them here.");
                }
            });
        }
    },

    {
        command: "clearhost",
        description: "Clear the current host",
        parameters: [],
        permissions: ['admin'],
        execute: function(message, params) {
            clearCurrentHost();
        }
    },
    
    {
        command: "permissions",
        description: "Checks the required role to use a command",
        parameters: ["command name"],
        permissions: [],
        execute: function(message, params) {
            
            var command = searchCommand(params[1]);
            var response;
            
            if(command) {
                response = "Roles that can use command \"" + params[1] + "\": ";
                var permissions = command.permissions;
                if(permissions.length == 0){
                    response += "(any role)";
                } else {
                    for(var i = 0; i < permissions.length; i++) {
                        response += permissions[i];
                        
                        if(i != permissions.length - 1) {
                            response += ", ";
                        }
                    }
                }
            } else {
                response = "Unknown command: \"" + params[1] + "\"";
            }
            
            message.reply(response);
        }
    },
    
    {
        command: "addpermission",
        description: "Allows a role to execute a certain command",
        parameters: ["command name", "role name"],
        permissions: ['admin'],
        execute: function(message, params) {
            
            var command = searchCommand(params[1]);
            
            if(!command) {
                message.reply("unknown command: \"" + params[1] + "\"");
                return;
            }
            
            var pos = inArray(params[2].toLowerCase(), command.permissions);
            
            if(pos !== false) {
                message.reply("that role can already execute that command");
                return;
            }
            
            command.permissions.push(params[2].toLowerCase());
            message.reply("users with role " + params[2] + " can now execute command " + params[1]);
        }
    },
    
    {
        command: "removepermission",
        description: "Revokes a role's permission to execute a certain command",
        parameters: ["command name", "role name"],
        permissions: ['admin'],
        execute: function(message, params) {
            
            var command = searchCommand(params[1]);
            
            if(!command) {
                message.reply("unknown command: \"" + params[1] + "\"");
                return;
            }
            
            var pos = inArray(params[2].toLowerCase(), command.permissions);
            
            if(pos === false) {
                message.reply("that role cannot already execute that command");
                return;
            }
            
            command.permissions.splice(pos,1);
            message.reply("users with role " + params[2] + " can no longer execute command " + params[1]);
            
            if(command.permissions.length == 0) {
                message.reply("command " + params[1] + " can now be executed by anyone.");
            }
        }
    }
];

/////////////////////////////
/// Client Event Handling ///
/////////////////////////////

bot.on("ready", function () {
    console.log("Ready to begin!");

    setDefaultAdminRole(adminRole);
    setCurrentRound();
});

bot.on("disconnected", function () {
    console.log("Disconnecting!");
});

bot.on("message", function(message) {
    if(message.author.bot) {
        return;
    }

    else if(message.channel.topic !== undefined) {
        
        if(message.content[0] == '!') {
            handleCommand(message, message.content.substring(1));        
        }
        else if(message.mentions.users.find('username', botName)) {
            message.reply(mentionReply);
        }
    }

    else {
        message.reply(directMessageReply);
    }
});

bot.on("guildMemberAdd", function(guild, member) {
	member.sendMessage("Welcome to the PictureGame Discord! Please make sure your username or server nickname matches with your Reddit account.");

    var username = member.user.username;
    var nickname = member.nickname;

    console.log("Member added: " + username);

	if (currentRoundData.user === username || currentRoundData.user === nickname) {
        setCurrentHost(currentRoundData.user, function(host) {
            if (!host) {
                guild.channels.get(channelID).sendMessage(child.data.author + " is the host but I couldn't set them here.");
            }
        });
	}
});

////////////////////////
/// Helper Functions ///
////////////////////////

function setDefaultAdminRole(roleName) {
    for(var i = 0; i < commands.length; i++) {
        var pos = inArray('admin', commands[i].permissions);
        if(pos !== false) {
            commands[i].permissions[pos] = roleName.toLowerCase();
        }
    }
}

function handleCommand(message, command) {
    var params = command.split(' ');
    var com = searchCommand(params[0]);
    
    if(com) {
        if(!hasPermission(message.author, com)) {
            message.reply("sorry, you don't have permission to use that command.");
        }
        else if(params.length - 1 < com.parameters.length) {
            message.reply("insufficient parameters!");
        }
        else {
            com.execute(message, params);
        }
    }
    else {
        message.reply("unknown command: \"" + params[0] + "\"");
    }
}

function hasPermission(user, command) {
    
    var permissions = command.permissions;
    
    if(permissions.length == 0) {
        return true;
    }
    
    var userRoles = bot.guilds.get(serverID).member(user).roles.array();

    for(var i = 0; i < userRoles.length; i++) {
        if(inArray(userRoles[i].name.toLowerCase(), permissions) !== false) {
            return true;
        }
    }
    
    return false;
}

function inArray(needle, haystack) {
    for(var i = 0; i < haystack.length; i++) {
        if(haystack[i] === needle) {
            return i;
        }
    }
    
    return false;
}

function searchCommand(command) {
    
    for(var i = 0; i < commands.length; i++) {
        if(commands[i].command == command.toLowerCase()) {
            return commands[i];
        }
    }
    
    return false;
}

function getLeaderboard(cb) {
    var leaderboard = "The current top 25 leaderboard is: \n\n";

    r.get_subreddit('PictureGame').get_wiki_page('leaderboard').fetch().then(function(page) {
    content = page.content_html;

    $ = cheerio.load(content);
        var data = [];
        $('tr').each(function(i, tr) {
            
            var children = $(this).children();
            var rank = children.eq(0);

            if (rank.text().trim() < 26) {
                var username = children.eq(1);
                leaderboard += rank.text().trim() + ". " + username.text().trim() + "\n";
            }
        });
        cb(leaderboard);
    });
}

function getStats(message, user) {
    r.get_subreddit('PictureGame').get_wiki_page('leaderboard').fetch().then(function(page) {
    content = page.content_html;

    $ = cheerio.load(content);
        var data = [];
        $('tr').each(function(i, tr) {           
            var children = $(this).children();
            var username = children.eq(1);

            if (username.text().trim() === user) {
                var rank = children.eq(0);
                var total = children.eq(3);
                message.channel.sendMessage("Here are the stats for " + username.text().trim() + ":\n\nRank #**" + rank.text().trim() + "**\n" + "Total Wins: **" + total.text().trim() + "** :medal:");
            }
        });
    });
}

function addMadList(user) {
	madList.push(user);
}

function removeMadList (user) {
	var index = madList.indexOf(user);
	
	if (index > -1) {
		madList.splice(index, 1);
	}
}

function setCurrentRound() {
    var url = "https://www.reddit.com/r/PictureGame/new/.json?limit=1";
    var request = https.get(url, function(response) {
        if (response.statusCode < 200 || response.statusCode > 299) {
            console.log("Caught an error while setting round... retrying... " + response.statusCode);
            setTimeout(function() {
                setCurrentRound();
            }, 5000);
            return;
        }

        var json = '';    

        response.on('data', function(chunk) {
            json += chunk;
        });

        response.on('end', function() {
            var redditResponse = JSON.parse(json);

            redditResponse.data.children.forEach(function(child) {
                currentRoundData = {
                    id: child.data.id,
                    title: child.data.title,
                    user: child.data.author,
                    pic: child.data.url
                };

                setCurrentHost(child.data.author, function(host) {
                    if (!host) {
                        bot.guilds.get(serverID).channels.get(channelID).sendMessage(child.data.author + " is the host but I couldn't set them here.");
                    }
                });

                setDescription();

                console.log("Current round set!");
                var interval = setInterval (function () {
                    checkNewRound();
                }, 15000);
            });
        })
    })

    .on('error', function(err) {
        console.log("Caught an error while setting round... retrying... " + err);
        setTimeout(function() {
            setCurrentRound();
        }, 5000);
    });
}

function checkNewRound() {
    var url = "https://www.reddit.com/r/PictureGame/new/.json?limit=1";
    var request = https.get(url, function(response) {
        if (response.statusCode < 200 || response.statusCode > 299) {
        	console.log("Caught an error while checking round... retrying... " + response.statusCode);
       		setTimeout(function() {
        		checkNewRound()
        	}, 5000);
        	return;
        }

        var json = '';

        response.on('data', function(chunk) {
            json += chunk;
        });

        response.on('end', function() {
            var redditResponse = JSON.parse(json);
            redditResponse.data.children.forEach(function(child) {                    
                if (currentRoundData.id !== child.data.id) {
                    currentRoundData = {
                        id: child.data.id,
                        title: child.data.title,
                        user: child.data.author,
                        pic: child.data.url
                    };

                    clearCurrentHost();
                    setCurrentHost(child.data.author, function(host) {
                        if (!host) {
                            bot.guilds.get(serverID).channels.get(channelID).sendMessage(child.data.author + " is the host but I couldn't set them here.");
                        }
                    });

                    setDescription();

                    bot.guilds.get(serverID).channels.get(channelID).sendMessage("@here, a new round is up:" + "\n\n**" + currentRoundData.title + "** by " + currentRoundData.user + "\n" + "http://redd.it/" + currentRoundData.id + "\n" + currentRoundData.pic);

                    console.log("New round up!");
                }
                else {
                    console.log("Checked. Same round.");
                }
            });
        })
    })

	.on('error', function(err) {
        console.log("Caught an error while checking round... retrying... " + err);
       	setTimeout(function() {
        	checkNewRound();
        }, 5000);
    });
}

function setDescription() {
    var newDescription = "Use this channel to discuss the current round: " + "http://redd.it/" + currentRoundData.id;
    bot.guilds.get(serverID).channels.get(channelID).setTopic(newDescription);
}

function setCurrentHost(user, cb) {
    console.log("Setting host... " + user);

    var role = bot.guilds.get(serverID).roles.find('name', 'Current Host');
    var members = bot.guilds.get(serverID).members.array();

    for (var i = 0; i < members.length; i++) {
        var username = members[i].user.username;
        var nickname = members[i].nickname;

        console.log("Username: " + username + " Nickname: " + nickname);

        if (user === username || user === nickname) {
            members[i].addRole(role);
            console.log("Host added: " + user);
            cb(true);
        }
    }
}

function clearCurrentHost() {
    var role = bot.guilds.get(serverID).roles.find('name', 'Current Host');
    var members = bot.guilds.get(serverID).members.array();
    
    for (var i = 0; i < members.length; i++) {
        if (members[i].roles.find('name', 'Current Host'))
        {
            members[i].removeRole(role);
            console.log("Host removed: " + members[i].user.username + " (" + members[i].nickname + ")");
        }
    }
}

bot.login(AuthDetails.token);