const { SlashCommandBuilder, CommandInteraction, Client } = require('discord.js');

module.exports = {
    name: 'bulkdm',
    description: 'Send a DM to all members of a specific role.',
    data: new SlashCommandBuilder()
        .setName('bulkdm')
        .setDescription('Send a DM to all members of a specific role.')
        .addStringOption(option =>
            option.setName('role')
                .setDescription('Mention the role or enter the role ID')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send to each member')
                .setRequired(true)),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const roleInput = interaction.options.getString('role');
        const messageToSend = interaction.options.getString('message');
        const guild = interaction.guild;

        // Extract role ID from mention or use the input directly if it's an ID
        const roleId = roleInput.match(/^<@&(\d+)>$/)?.[1] || roleInput;

        try {
            // Fetch the role from the guild
            const role = await guild.roles.fetch(roleId);

            if (!role) {
                return interaction.editReply({ content: 'Role not found. Please provide a valid role ID or mention the role.', ephemeral: true });
            }

            const membersWithRole = role.members;

            if (membersWithRole.size === 0) {
                return interaction.editReply({ content: 'No members found with the specified role.', ephemeral: true });
            }

            // Send the message to each member with the role
            membersWithRole.forEach(async (member) => {
                try {
                    await member.send(messageToSend);
                } catch (error) {
                    console.error(`Could not send DM to ${member.user.tag}:`, error);
                }
            });

            await interaction.editReply({ content: `Message sent to ${membersWithRole.size} members with the role **${role.name}**.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `An error occurred: ${error.message}`, ephemeral: true });
        }
    }
};
