const { SlashCommandBuilder, CommandInteraction, Client } = require('discord.js');
const noblox = require('noblox.js');

module.exports = {
    name: 'setrank',
    description: 'Set a user\'s rank in a specific group.',
    data: new SlashCommandBuilder()
        .setName('setrank')
        .setDescription('Set a user\'s rank in a specific group.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Roblox username of the user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('group')
                .setDescription('Select the group (OA or DS)')
                .addChoices(
                    { name: 'OA', value: '13818806' }, // Replace with your OA group ID
                    { name: 'DS', value: '13818806' }  // Replace with your DS group ID
                )
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('rank_id')
                .setDescription('The rank ID to set the user to')
                .setRequired(true)),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const username = interaction.options.getString('username');
        const groupId = interaction.options.getString('group');
        const rankId = interaction.options.getInteger('rank_id');

        try {
            // Get the user ID from the username
            const userId = await noblox.getIdFromUsername(username);

            // Set the rank
            await noblox.setRank({
                group: parseInt(groupId, 10),
                target: userId,
                rank: rankId
            });

            await interaction.editReply({ content: `Successfully set the rank of **${username}** to rank ID **${rankId}** in the specified group.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `An error occurred while setting the rank: ${error.message}`, ephemeral: true });
        }
    }
};
