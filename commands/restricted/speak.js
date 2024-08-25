const { SlashCommandBuilder, CommandInteraction, Client, ChannelType } = require('discord.js');
const { interactionEmbed } = require('../../functions');
const { requiredRoles } = require('../../config.json').discord;

module.exports = {
    name: 'speak',
    description: 'Send a message to a specific channel.',
    data: new SlashCommandBuilder()
        .setName('speak')
        .setDescription('Send a message to a specific channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select the channel to send the message to')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)) // Restrict to text channels
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
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
        const targetChannel = interaction.options.getChannel('channel');
        const messageContent = interaction.options.getString('message');

        try {
            // Send the message to the selected channel
            await targetChannel.send(messageContent);
            await interaction.editReply({ content: `Message successfully sent to ${targetChannel}.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `An error occurred: ${error.message}`, ephemeral: true });
        }
    }
};
