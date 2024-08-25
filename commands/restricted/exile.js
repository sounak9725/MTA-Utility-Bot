const { SlashCommandBuilder, EmbedBuilder, CommandInteraction, Client } = require('discord.js');
const noblox = require('noblox.js');
const { getRowifi, interactionEmbed } = require('../../functions');
const { requiredRoles } = require('../../config.json').discord;

module.exports = {
    name: 'exile',
    description: 'Exile a Roblox group member and log the reason.',
    data: new SlashCommandBuilder()
        .setName('exile')
        .setDescription('Exile a Roblox group member and log the reason.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select the Discord user to exile from the Roblox group.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('group')
                .setDescription('Select the Roblox group to exile the user from.')
                .addChoices(
                    { name: 'DS', value: 'DS' },
                    { name: 'OA', value: 'OA' }
                )
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the exile.')
                .setRequired(true)),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        
        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]",'', interaction, client, [true, 30]);
        }
        const discordUser = interaction.options.getUser('user');
        const groupChoice = interaction.options.getString('group');
        const reason = interaction.options.getString('reason');
        const discordId = discordUser.id;

        // Group IDs for DS and OA
        const groupIds = {
            DS: 10421203, // Replace with your DS group ID
            OA: 10436572  // Replace with your OA group ID
        };

        const groupId = groupIds[groupChoice];

        try {
            // Verify user with RoWifi
            const rowifi = await getRowifi(discordId, client);

            if (!rowifi.success) {
                return interaction.editReply({ content: 'The selected user is not verified with RoWifi. Please verify first.' });
            }

            const robloxId = rowifi.roblox;
            const username = rowifi.username;

            // Exile the user from the group
            await noblox.exile(groupId, robloxId);

            // Fetch the Roblox user's current rank name in the group (if needed for the embed)
            const rankName = await noblox.getRankNameInGroup(groupId, robloxId);

            // Create the embed
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('User Exiled')
                .setDescription(`A user has been exiled from the Roblox group.`)
                .addFields(
                    { name: 'Username', value: `${username} (${robloxId})`, inline: true },
                    { name: 'Discord ID', value: `<@${discordId}>`, inline: true },
                    { name: 'MTA Rank', value: `${rankName}`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setFooter({ text: `Exiled by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // Send the embed to the specified channel
            const logChannelId = '1262611086150991962'; // Replace with your log channel ID
            const logChannel = await client.channels.fetch(logChannelId);
            await logChannel.send({ embeds: [embed] });

            // Confirm the action to the command user
            await interaction.editReply({ content: 'User successfully exiled and logged.', ephemeral: true });

        } catch (error) {
            console.error('Error exiling user:', error);
            await interaction.editReply({ content: 'Failed to exile the user. Please make sure the user is verified and the username is correct.', ephemeral: true });
        }
    }
};
