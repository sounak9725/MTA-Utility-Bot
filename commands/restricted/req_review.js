// eslint-disable-next-line no-unused-vars
const { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver } = require('discord.js');
const { getRowifi, interactionEmbed } = require('../../functions');
const { requiredRoles } = require('../../config.json').discord;

module.exports = {
    name: 'req_review',
    description: 'Request a review with user details.',
    data: new SlashCommandBuilder()
        .setName('req_review')
        .setDescription('Send a review request for a specific user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select the user to request a review for')
                .setRequired(true)),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {CommandInteractionOptionResolver} options
     */
    run: async (client, interaction, options) => {
        
        await interaction.deferReply({ ephemeral: true });
    
        // Check if the user has the required roles
        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
            return interactionEmbed(3, "[ERR-UPRM]", '', interaction, client, [true, 30]);
        }

        const discordUser = interaction.options.getUser('user');
        const discordUserId = discordUser.id;

        try {
            // Use RoWifi to verify the selected user
            const rowifi = await getRowifi(discordUserId, client);

            if (!rowifi.success) {
                return interaction.editReply({ content: `The user <@${discordUserId}> is not verified with RoWifi.` });
            }

            const robloxUsername = rowifi.username;
            const robloxId = rowifi.roblox;
            const robloxProfileLink = `https://www.roblox.com/users/${robloxId}/profile`;

            // Create the embed
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Review Request')
                .addFields(
                    { name: 'Username', value: robloxUsername, inline: true },
                    { name: 'Roblox Profile', value: `[View Profile](${robloxProfileLink})`, inline: false },
                    { name: 'Discord User', value: `<@${discordUserId}>`, inline: false },
                    { name: 'Discord ID', value: discordUserId, inline: false }
                )
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // Specify the target channel ID
            const targetChannelId = '1307693356935286816'; // Replace with your specific channel ID
            const targetChannel = await client.channels.fetch(targetChannelId);

            // Send the embed with a ping to the Deputy Director role
            await targetChannel.send({ content: '<@&844895585069039627>', embeds: [embed] }); // Replace DeputyDirectorRoleID with the actual role ID

            // Confirm the action to the user
            await interaction.editReply({ content: `Your review request for <@${discordUserId}> has been submitted successfully.`, ephemeral: true });

        } catch (error) {
            console.error('Error in /req_review command:', error);
            await interaction.editReply({ content: 'An error occurred while processing your request. Please try again later.', ephemeral: true });
        }
    }
};
