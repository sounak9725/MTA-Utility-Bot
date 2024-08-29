const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder } = require('discord.js');
const { requiredRoles } = require('../../config.json').discord;
const { interactionEmbed } = require("../../functions");

module.exports = {
    name: 'denylog',
    description: 'Log a denied event and notify the user with the details.',
    data: new SlashCommandBuilder()
        .setName('denylog')
        .setDescription('Log a denied event and notify the user with the details.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to notify')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('event')
                .setDescription('The event that was denied')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for denying the event')
                .setRequired(true)
        ),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        // Check if the user has the required roles
        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
            return interactionEmbed(3, "[ERR-UPRM]", '', interaction, client, [true, 30]);
        }

        const user = interaction.options.getUser('user');
        const eventName = interaction.options.getString('event');
        const reason = interaction.options.getString('reason');

        // Get the current date and time for the log
        const currentTime = new Date();
        const logTime = `<t:${Math.floor(currentTime.getTime() / 1000)}:F>`; // Discord timestamp format

        // Create the DM embed message
        const dmEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Event Denied Notification')
            .setDescription(`Your event **${eventName}** has been denied.`)
            .addFields(
                { name: 'Denied At', value: logTime, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setFooter({ text: `Please contact ${interaction.user.tag} for more details.` });  // Use tag for better clarity

        try {
            // Send the DM to the user
            await user.send({ embeds: [dmEmbed] });

            // Provide feedback to the logger
            await interaction.editReply({ content: `Successfully notified ${user.tag} about the denied event.`, ephemeral: true });
        } catch (error) {
            console.error('Error sending DM:', error);
            await interaction.editReply({ content: `Failed to send DM to ${user.tag}. They may have DMs disabled.`, ephemeral: true });
        }
    }
};
