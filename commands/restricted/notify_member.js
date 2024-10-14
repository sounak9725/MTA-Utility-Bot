/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder, CommandInteractionOptionResolver } = require('discord.js');
const { interactionEmbed } = require('../../functions');
const { requiredRoles } = require('../../config.json').discord;
module.exports = {
    name: 'notify_member',
    description: 'Send a direct message to a specified member.',
    data: new SlashCommandBuilder()
        .setName('notify_member')
        .setDescription('Send a direct message to a specified member.')
        .addUserOption(option => 
            option.setName('member')
                .setDescription('The member you want to notify')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('message')
                .setDescription('The message to send to the member')
                .setRequired(true)
        ),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {CommandInteractionOptionResolver} options
     */
    run: async (client, interaction, options) => {
        await interaction.deferReply({ ephemeral: true });

        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]",'', interaction, client, [true, 30]);
        }

        const targetMember = options.getUser('member');
        const messageContent = options.getString('message');

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Notification')
            .setDescription(messageContent)
            .setFooter({ text: `Message from ${interaction.user.tag}` })
            .setTimestamp();

        try {
            // Attempt to send a DM to the target member
            await targetMember.send({ embeds: [embed] });
            await interaction.editReply({ content: `Successfully sent a DM to ${targetMember.tag}.`, ephemeral: true });
        } catch (error) {
            console.error(`Failed to send DM to ${targetMember.tag}:`, error);
            await interaction.editReply({ content: `Failed to send a DM to ${targetMember.tag}. They may have DMs disabled.`, ephemeral: true });
        }
    }
};
