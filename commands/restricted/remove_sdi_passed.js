/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, Client, CommandInteraction, CommandInteractionOptionResolver } = require('discord.js');
const { requiredRoles } = require('../../config.json').discord;
const { interactionEmbed } = require('../../functions');

module.exports = {
  name: "remove_sdi_passed",
  description: "Remove the SDI App Passer role from a user.",
  data: new SlashCommandBuilder()
    .setName('remove_sdi_passed')
    .setDescription('Remove the SDI App Passer role from a user.')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to remove the SDI App Passer role from.')
        .setRequired(true)),
    
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */           
  run: async (client, interaction, options) => {
    
    await interaction.deferReply({ ephemeral: false });
    
    // Check if the user has the required roles
    const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
    if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]", '', interaction, client, [true, 30]);
    }

    const targetUser = interaction.options.getUser('target');
    const roleID = '1252438047644192910'; // SDI App Passer role ID

    // Ensure the interaction is happening in a guild (server)
    if (!interaction.guild) {
      return interaction.editReply({ content: 'This command can only be used in a server.', ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(targetUser.id);

    // If the member is not found
    if (!member) {
      return interaction.editReply({ content: 'User not found in this server.', ephemeral: true });
    }

    // Remove the role
    if (!member.roles.cache.has(roleID)) {
      return interaction.editReply({ content: `${targetUser.username} does not have the SDI App Passer role.`, ephemeral: true });
    }

    await member.roles.remove(roleID);

    // Try to DM the user
    try {
      await targetUser.send('The SDI App Passer role has been removed from you.');
      await interaction.editReply({ content: `Removed <@&${roleID}> role from ${targetUser.username}. The user has been notified via DM.`, ephemeral: true });
    } catch (error) {
      await interaction.editReply({ content: `Removed <@&${roleID}> role from ${targetUser.username}. However, their DMs are closed and they could not be notified.`, ephemeral: true });
    }
  }
};
