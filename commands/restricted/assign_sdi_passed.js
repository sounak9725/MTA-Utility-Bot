/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, Client, CommandInteraction, CommandInteractionOptionResolver } = require('discord.js');
const { requiredRoles } = require('../../config.json').discord;
const { interactionEmbed } = require('../../functions');
module.exports = {
  name: "assign_sdi_passed",
  description: "Assign the SDI App Passer role to a user.",
  data: new SlashCommandBuilder()
    .setName('assign_sdi_passed')
    .setDescription('Assign the SDI App Passer role to a user.')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to assign the SDI App Passer role.')
        .setRequired(true)),
    /**
    * @param {Client} client
    * @param {CommandInteraction} interaction
    * @param {CommandInteractionOptionResolver} options
    */           
  run: async (client, interaction, options) => {
    
    await interaction.deferReply({ ephemeral: false });
    
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

    // Assign the role
    await member.roles.add(roleID);

    // Try to DM the user
    try {
      await targetUser.send('You have passed the SDI app but need to pass a supervised evaluation.');
      await interaction.editReply({ content: `Assigned <@&1252438047644192910> role to ${targetUser.username}. The user has been notified via DM.`, ephemeral: true });
    } catch (error) {
      await interaction.editReply({ content: `Assigned <@&1252438047644192910> role to ${targetUser.username}. However, their DMs are closed and they could not be notified.`, ephemeral: true });
    }
  }
};
