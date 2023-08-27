(async()=>{
    // default imports
    const events = require('events');
    const { exec } = require("child_process")
    const logs = require("discord-logs")
    const Discord = require("discord.js")
    const { 
        MessageEmbed, 
        MessageButton, 
        MessageActionRow, 
        Intents, 
        Permissions, 
        MessageSelectMenu 
    }= require("discord.js")
    const fs = require('fs');
    let process = require('process');
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // block imports
    const os = require("os-utils");
    let URL = require('url')
    let https = require("https")
    const synchronizeSlashCommands = require('@frostzzone/discord-sync-commands');
    const Database  = require("easy-json-database")
    
    // define s4d components (pretty sure 90% of these arnt even used/required)
    let s4d = {
        Discord,
        fire:null,
        joiningMember:null,
        reply:null,
        player:null,
        manager:null,
        Inviter:null,
        message:null,
        notifer:null,
        checkMessageExists() {
            if (!s4d.client) throw new Error('You cannot perform message operations without a Discord.js client')
            if (!s4d.client.readyTimestamp) throw new Error('You cannot perform message operations while the bot is not connected to the Discord API')
        }
    };

    // check if d.js is v13
    if (!require('./package.json').dependencies['discord.js'].startsWith("^13.")) {
      let file = JSON.parse(fs.readFileSync('package.json'))
      file.dependencies['discord.js'] = '^13.16.0'
      fs.writeFileSync('package.json', JSON.stringify(file, null, 4))
      exec('npm i')
      throw new Error("Seems you arent using v13 please re-run or run `npm i discord.js@13.16.0`");
    }

    // check if discord-logs is v2
    if (!require('./package.json').dependencies['discord-logs'].startsWith("^2.")) {
      let file = JSON.parse(fs.readFileSync('package.json'))
      file.dependencies['discord-logs'] = '^2.0.0'
      fs.writeFileSync('package.json', JSON.stringify(file, null, 4))
      exec('npm i')
      throw new Error("discord-logs must be 2.0.0. please re-run or if that fails run `npm i discord-logs@2.0.0` then re-run");
    }

    // create a new discord client
    s4d.client = new s4d.Discord.Client({
        intents: [
            Object.values(s4d.Discord.Intents.FLAGS).reduce((acc, p) => acc | p, 0)
        ],
        partials: [
            "REACTION", 
            "CHANNEL"
        ]
    });

    // when the bot is connected say so
    s4d.client.on('ready', () => {
        console.log(s4d.client.user.tag + " is alive!")
    })

    // upon error print "Error!" and the error
    process.on('uncaughtException', function (err) {
        console.log('Error!');
        console.log(err);
    });

    // give the new client to discord-logs
    logs(s4d.client);

    // pre blockly code
    const discordModals = require('discord-modals');
    discordModals(s4d.client);
    const { Modal, TextInputComponent, showModal } = require('discord-modals');

    // blockly code
    var member, reason, finalchannel, verify_role, channelid, verifyroleid, final_verify_role, channel, memberid;
    
    
    await s4d.client.login((process.env[String('TOKEN')])).catch((e) => {
            const tokenInvalid = true;
            const tokenError = e;
            if (e.toString().toLowerCase().includes("token")) {
                throw new Error("An invalid bot token was provided!")
            } else {
                throw new Error("Privileged Gateway Intents are not enabled! Please go to https://discord.com/developers and turn on all of them.")
            }
        });
    
    s4d.client.on('ready', async () => {
      s4d.client.user.setPresence({status: "online",activities:[{name:'V:0.4',type:"PLAYING"}]});
    
    });
    
    const verify = new Database('./verified.json')
    const warnings = new Database('./warns.json')
    synchronizeSlashCommands(s4d.client, [
      {
          name: 'ban',
      		description: 'Ban a member',
      		options: [
              {
            type: 6,
        	name: 'member',
            required: true,
        	description: 'Member',
            choices: [
    
            ]
        },{
            type: 3,
        	name: 'reason',
            required: false,
        	description: 'Reason',
            choices: [
    
            ]
        },
          ]
      },{
          name: 'kick',
      		description: 'Kick a member',
      		options: [
              {
            type: 6,
        	name: 'member',
            required: true,
        	description: 'Member',
            choices: [
    
            ]
        },{
            type: 3,
        	name: 'reason',
            required: false,
        	description: 'Reason',
            choices: [
    
            ]
        },
          ]
      },{
          name: 'verifysetup',
      		description: 'Setup verify system',
      		options: [
              {
            type: 8,
        	name: 'role',
            required: true,
        	description: 'Verify role',
            choices: [
    
            ]
        },
          ]
      },{
          name: 'verify',
      		description: 'Verify yourself',
      		options: [
    
          ]
      },{
          name: 'sendembed',
      		description: 'Send an embed',
      		options: [
    
          ]
      },{
          name: 'setuplogs',
      		description: 'Setup the logs',
      		options: [
              {
            type: 7,
        	name: 'channel',
            required: true,
        	description: 'Channel',
            choices: [
    
            ]
        },
          ]
      },{
          name: 'help',
      		description: 'Help with our commands',
      		options: [
    
          ]
      },{
          name: 'warn',
      		description: 'Warn a member',
      		options: [
              {
            type: 6,
        	name: 'member',
            required: true,
        	description: 'Member',
            choices: [
    
            ]
        },
          ]
      },{
          name: 'clearwarns',
      		description: 'Clear all of a members warnings',
      		options: [
              {
            type: 6,
        	name: 'member',
            required: true,
        	description: 'Member',
            choices: [
    
            ]
        },
          ]
      },
    ],{
        debug: false,
    
    });
    
    const logchannels = new Database('./logchan.json')
    s4d.client.on('interactionCreate', async (interaction) => {
              if ((interaction.commandName) == 'ban') {
        if ((interaction.member).permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
          member = (interaction.options.getMember('member'));
          reason = (interaction.options.getString('reason'));
          finalchannel = logchannels.get(String((['logchannel','-',(interaction.guild).id].join(''))));
          if (reason == null) {
            reason = 'No reason Provided';
          }
          member.ban({ reason: reason });
          var success = new Discord.MessageEmbed();
             success.setTitle(String('<:3551check:1143263837517250590> Success <:3551check:1143263837517250590>'))
             success.setURL(String());
    
          await interaction.reply({embeds: [success], ephemeral: true, components: [] });
          if (finalchannel != null) {
            var log = new Discord.MessageEmbed();
               log.setTitle(String('<:3857cross:1143263838901387396> WARNING <:3857cross:1143263838901387396>'))
               log.setURL(String());
              log.setDescription(String(([interaction.member,' banned: ',member,`
              `,'reason: ',reason].join(''))));
    
            s4d.client.channels.cache.get(finalchannel).send({embeds: [log]});
          }
        } else {
          var error = new Discord.MessageEmbed();
             error.setTitle(String('You dont have permmission to use this command'))
             error.setURL(String());
    
          await interaction.reply({embeds: [error], ephemeral: true, components: [] });
        }
      }
      if ((interaction.commandName) == 'kick') {
        if ((interaction.member).permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
          member = (interaction.options.getMember('member'));
          reason = (interaction.options.getString('reason'));
          finalchannel = logchannels.get(String((['logchannel','-',(interaction.guild).id].join(''))));
          if (reason == null) {
            reason = 'No reason Provided';
          }
          member.kick({ reason: reason });
          var success = new Discord.MessageEmbed();
             success.setTitle(String('<:3551check:1143263837517250590> Success <:3551check:1143263837517250590>'))
             success.setURL(String());
    
          await interaction.reply({embeds: [success], ephemeral: true, components: [] });
          if (finalchannel != null) {
            var log = new Discord.MessageEmbed();
               log.setTitle(String('<:3857cross:1143263838901387396> WARNING <:3857cross:1143263838901387396>'))
               log.setURL(String());
              log.setDescription(String(([interaction.member,' kicked: ',member,`
              `,'reason: ',reason].join(''))));
    
            s4d.client.channels.cache.get(finalchannel).send({embeds: [log]});
          }
        } else {
          var error = new Discord.MessageEmbed();
             error.setTitle(String('You dont have permmission to use this command'))
             error.setURL(String());
    
          await interaction.reply({embeds: [error], ephemeral: true, components: [] });
        }
      }
      if ((interaction.commandName) == 'verifysetup') {
        if ((interaction.member).permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
          verify_role = (interaction.options.getRole('role'));
          verifyroleid = (verify_role.id);
          if (!verify.has(String(verify.get(String((['verifyrole','-',(interaction.guild).id].join(''))))))) {
            verify.add(String((['verifyrole','-',(interaction.guild).id].join(''))), parseInt(verifyroleid));
            verify.set(String((['verifyrole','-',(interaction.guild).id].join(''))), verifyroleid);
          } else if (verify.has(String(verify.get(String((['verifyrole','-',(interaction.guild).id].join(''))))))) {
            verify.set(String(verify.get(String((['verifyrole','-',(interaction.guild).id].join(''))))), verifyroleid);
          }
          final_verify_role = verify.get(String((['verifyrole','-',(interaction.guild).id].join(''))));
          var success = new Discord.MessageEmbed();
             success.setTitle(String('<:3551check:1143263837517250590> Success <:3551check:1143263837517250590>'))
             success.setURL(String());
    
          await interaction.reply({embeds: [success], ephemeral: true, components: [] });
        } else {
          var err1 = new Discord.MessageEmbed();
             err1.setTitle(String('<:3857cross:1143263838901387396> error <:3857cross:1143263838901387396>'))
             err1.setURL(String());
            err1.setDescription(String('You dont have permmission to use this command'));
    
          await interaction.reply({embeds: [err1], ephemeral: true, components: [] });
        }
      }
      if ((interaction.commandName) == 'verify') {
        if (final_verify_role == null) {
          var err1 = new Discord.MessageEmbed();
             err1.setTitle(String('<:3857cross:1143263838901387396> error <:3857cross:1143263838901387396>'))
             err1.setURL(String());
            err1.setDescription(String('The owner of the server did not set a verified role'));
    
          await interaction.reply({embeds: [err1], ephemeral: true, components: [] });
        } else {
          final_verify_role = verify.get(String((['verifyrole','-',(interaction.guild).id].join(''))));
          (interaction.member).roles.add(final_verify_role);
          var success = new Discord.MessageEmbed();
             success.setTitle(String('<:3551check:1143263837517250590> Success <:3551check:1143263837517250590>'))
             success.setURL(String());
    
          await interaction.reply({embeds: [success], ephemeral: true, components: [] });
        }
      }
      if ((interaction.commandName) == 'setuplogs') {
        if ((interaction.member).permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
          channel = (interaction.options.getChannel('channel'));
          channelid = (channel.id);
          if (!logchannels.has(String(logchannels.get(String((['logchannel','-',(interaction.guild).id].join(''))))))) {
            logchannels.add(String((['logchannel','-',(interaction.guild).id].join(''))), parseInt(channelid));
            logchannels.set(String((['logchannel','-',(interaction.guild).id].join(''))), channelid);
          } else if (logchannels.has(String(logchannels.get(String((['logchannel','-',(interaction.guild).id].join(''))))))) {
            logchannels.set(String(logchannels.get(String((['logchannel','-',(interaction.guild).id].join(''))))), channelid);
          }
          finalchannel = logchannels.get(String((['logchannel','-',(interaction.guild).id].join(''))));
          var success = new Discord.MessageEmbed();
             success.setTitle(String('<:3551check:1143263837517250590> Success <:3551check:1143263837517250590>'))
             success.setURL(String());
    
          await interaction.reply({embeds: [success], ephemeral: true, components: [] });
        } else {
          var err1 = new Discord.MessageEmbed();
             err1.setTitle(String('<:3857cross:1143263838901387396> error <:3857cross:1143263838901387396>'))
             err1.setURL(String());
            err1.setDescription(String('You dont have permmission to use this command'));
    
          await interaction.reply({embeds: [err1], ephemeral: true, components: [] });
        }
      }
      if ((interaction.commandName) == 'sendembed') {
        let embed = new Modal()
            .setCustomId('embed_id')
            .setTitle('Embed Info')
            .addComponents(
          new TextInputComponent()
              .setCustomId('input1')
              .setLabel('Title')
              .setStyle(('SHORT'))
              .setMinLength()
              .setMaxLength()
              .setRequired(false)
              .setPlaceholder('Title'),
          new TextInputComponent()
              .setCustomId('input2')
              .setLabel('Description')
              .setStyle(('LONG'))
              .setMinLength()
              .setMaxLength()
              .setRequired(false)
              .setPlaceholder('Desciption'),
          new TextInputComponent()
              .setCustomId('input3')
              .setLabel('Footer')
              .setStyle(('SHORT'))
              .setMinLength()
              .setMaxLength()
              .setRequired(false)
              .setPlaceholder('Footer'),
          new TextInputComponent()
              .setCustomId('input4')
              .setLabel('Channel ID')
              .setStyle(('SHORT'))
              .setMinLength()
              .setMaxLength()
              .setRequired(true)
              .setPlaceholder('id'),
        );showModal(embed, {
                client: s4d.client,
                interaction: interaction
            })}
      if ((interaction.commandName) == 'warn') {
        if ((interaction.member).permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
          member = (interaction.options.getMember('member'));
          memberid = (member.id);
          warnings.add(String(([(interaction.guild).id,'-','warns','-',memberid].join(''))), parseInt(1));
          var success = new Discord.MessageEmbed();
             success.setTitle(String('<:3551check:1143263837517250590> Success <:3551check:1143263837517250590>'))
             success.setURL(String());
    
          await interaction.reply({embeds: [success], ephemeral: true, components: [] });
        } else {
          var err1 = new Discord.MessageEmbed();
             err1.setTitle(String('<:3857cross:1143263838901387396> error <:3857cross:1143263838901387396>'))
             err1.setURL(String());
            err1.setDescription(String('You dont have permmission to use this command'));
    
          await interaction.reply({embeds: [err1], ephemeral: true, components: [] });
        }
      }
      if ((interaction.commandName) == 'clearwarns') {
        if ((interaction.member).permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
          member = (interaction.options.getMember('member'));
          memberid = (member.id);
          if (!warnings.has(String(warnings.get(String(([(interaction.guild).id,'-','warns','-',memberid].join(''))))))) {
            var err2 = new Discord.MessageEmbed();
               err2.setTitle(String('<:3857cross:1143263838901387396> error <:3857cross:1143263838901387396>'))
               err2.setURL(String());
              err2.setDescription(String('This member does not have any warnings'));
    
            await interaction.reply({embeds: [err2], ephemeral: true, components: [] });
          } else if (warnings.has(String(warnings.get(String(([(interaction.guild).id,'-','warns','-',memberid].join(''))))))) {
            warnings.set(String(warnings.get(String(([(interaction.guild).id,'-','warns','-',memberid].join(''))))), '0');
            var success = new Discord.MessageEmbed();
               success.setTitle(String('<:3551check:1143263837517250590> Success <:3551check:1143263837517250590>'))
               success.setURL(String());
    
            await interaction.reply({embeds: [sucess], ephemeral: true, components: [] });
          }
        } else {
          var err1 = new Discord.MessageEmbed();
             err1.setTitle(String('<:3857cross:1143263838901387396> error <:3857cross:1143263838901387396>'))
             err1.setURL(String());
            err1.setDescription(String('You dont have permmission to use this command'));
    
          await interaction.reply({embeds: [err1], ephemeral: true, components: [] });
        }
      }
    
        });
    
    s4d.client.on('modalSubmit', async (i) => {
    let member = i.guild.members.cache.get(i.member.user.id)
      if (((i.customId)) == 'embed_id') {
        var createdEmbed = new Discord.MessageEmbed();
           createdEmbed.setTitle(String(((i.getTextInputValue('input1')))))
           createdEmbed.setURL(String());
          createdEmbed.setDescription(String(((i.getTextInputValue('input2')))));
          createdEmbed.setFooter({text: String(((i.getTextInputValue('input3')))), iconURL: String()});
          channelid = ((i.getTextInputValue('input4')));
    
        s4d.client.channels.cache.get(channelid).send({embeds: [createdEmbed]});
      }
    
    });
    
    return s4d
})();