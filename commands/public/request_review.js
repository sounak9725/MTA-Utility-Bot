// eslint-disable-next-line no-unused-vars
const { EmbedBuilder, SlashCommandBuilder, Client, CommandInteraction, CommandInteractionOptionResolver } = require('discord.js');
const noblox = require('noblox.js');
const{ getRowifi, interactionEmbed } = require('../../functions');

module.exports = {
    name: 'request_review',
    description: 'Fetches and displays the Roblox profile link and some basic info',
    data: new SlashCommandBuilder()
    .setName("request_review")
    .setDescription("Fetches and displays the Roblox profile link and some basic info"),
   /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
    run: async(client, interaction) => {
        // Defer the reply to give more time for processing
        await interaction.deferReply({ ephemeral: true });

        const requiredRoles = ["844896090078576651"];
        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
            return interactionEmbed(3, "[ERR-UPRM]", '', interaction, client, [true, 30]);
        }

        const targetChannelId = '1252151829362507816'; // Replace with the ID of the channel you want to send the message to
        

        try {
            
            const id = interaction.user.id;

            const rowifi = await getRowifi(id, client);

            if (!rowifi.success) {
                return interaction.editReply({ content: 'You need to be verified with RoWifi to continue.' });
            }
            const username = rowifi.username;
            const userId = await noblox.getIdFromUsername(username);
            // Fetch user information
            const userProfile = await noblox.getPlayerInfo(userId);
            const avatar = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`)
              .then(r => r.json())
              .then(r => r.data[0].imageUrl);
        
            // Create an embed with the user information
            const embed = new EmbedBuilder()
                .setColor('Red') // Set the color of the embed
                .setTitle(`Roblox Profile: ${username}`)
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setDescription(userProfile.blurb || 'No description available')
                .addFields(
                    { name: 'Username', value: username, inline: true },
                    { name: 'User ID', value: `${userId}`, inline: true },
                    { name: 'Account Age', value: `${userProfile.age} days`, inline: true },
                )
                .setThumbnail(avatar)
                .setFooter({ text: 'Roblox Profile Information' }) // Optional: Add a footer and an icon
                .setTimestamp();

            // Fetch the target channel
            const targetChannel = await interaction.client.channels.fetch(targetChannelId);

            // Send the embed to the target channel
            
            await targetChannel.send({content:'<@&1252148479225237567> New review buddies. Get them.', embeds: [embed] });

            // Optionally, respond to the interaction to confirm the action
            await interaction.editReply({ content: `Profile info for ${username} has been sent to <#${targetChannelId}>.`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.editReply('Failed to fetch the user profile.');
        }
    }
};
