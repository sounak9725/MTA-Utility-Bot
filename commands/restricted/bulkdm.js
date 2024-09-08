/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { requiredRoles } = require('../../config.json').discord;
const { interactionEmbed } = require('../../functions');

module.exports = {
    name: 'bulk_dm',
    description: 'Send a direct message to all members of a specified role.',
    data: new SlashCommandBuilder()
        .setName('bulk_dm')
        .setDescription('Send a direct message to all members of a specified role.')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to DM all members of')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send to all members')
                .setRequired(true)
        ),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        
        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
            return interactionEmbed(3, "[ERR-UPRM]", '', interaction, client, [true, 30]);
        }

        const role = interaction.options.getRole('role');
        const message = interaction.options.getString('message');
        const sender = interaction.member;

        if (!role) {
            return interaction.editReply({ content: 'Role not found.', ephemeral: true });
        }

        await interaction.editReply({ content: `Fetching members with the role ${role.name}...`, ephemeral: true });

        try {
            // Fetch all members in the guild to ensure we have everyone
            const members = await interaction.guild.members.fetch();

            // Filter the members who have the specified role
            const roleMembers = members.filter(member => member.roles.cache.has(role.id));

            if (roleMembers.size === 0) {
                return interaction.editReply({ content: 'There are no members in this role.', ephemeral: true });
            }

            let sentCount = 0;
            let failedCount = 0;

            
            for (const [memberId, member] of roleMembers) {
                try {
                    await member.send(message);
                    sentCount++;
                } catch (error) {
                    console.error(`Failed to send DM to ${member.user.tag}:`, error);
                    failedCount++;
                }
            }

            // Provide a summary of sent and failed messages
            const summaryEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Bulk DM Report')
                .setDescription(`Finished sending DMs to members of the role ${role.name}.`)
                .addFields(
                    { name: 'Total Members', value: roleMembers.size.toString(), inline: true },
                    { name: 'Messages Sent', value: sentCount.toString(), inline: true },
                    { name: 'Failed to Send', value: failedCount.toString(), inline: true }
                );

            await interaction.editReply({ embeds: [summaryEmbed], ephemeral: true });

        } catch (error) {
            console.error('Error fetching members:', error);
            await interaction.editReply({ content: 'An error occurred while fetching members. Please try again later.', ephemeral: true });
        }
    }
};
