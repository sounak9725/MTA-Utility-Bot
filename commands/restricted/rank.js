const { SlashCommandBuilder, CommandInteraction, Client, EmbedBuilder } = require('discord.js');
const noblox = require('noblox.js');

module.exports = {
    name: 'rank',
    description: 'Show the current group ranks available and their rank IDs.',
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Show the current group ranks available and their rank IDs.')
        .addStringOption(option =>
            option.setName('group')
                .setDescription('Select the group (OA or DS)')
                .addChoices(
                    { name: 'OA', value: 'OA' },
                    { name: 'DS', value: 'DS' }
                )
                .setRequired(true)),
                
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply();

        const group = interaction.options.getString('group');
        const groupId = group === 'OA' ? '13818806' : '13818806'; // OA or DS group IDs

        try {
            // Fetch group roles from Roblox
            const roles = await noblox.getRoles(groupId);
            
            // Prepare the embed
            const embed = new EmbedBuilder()
                .setTitle(`${group} Group Ranks`)
                .setColor('Blue')
                .setDescription('Here are the available ranks and their IDs for the selected group:')
                .setFooter({ text: 'Group Ranks', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            // Add each rank and its ID to the embed
            roles.forEach(role => {
                embed.addFields({ name: role.name, value: `ID: ${role.rank}`, inline: true });
            });

            // Send the embed
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'There was an error fetching the group ranks. Please try again later.', ephemeral: true });
        }
    }
};
