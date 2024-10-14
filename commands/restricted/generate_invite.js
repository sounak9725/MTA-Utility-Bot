/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, Client, CommandInteraction, CommandInteractionOptionResolver } = require('discord.js');
const { interactionEmbed } = require('../../functions');
const { requiredRoles } = require('../../config.json').discord;

module.exports = {
    name: 'generate_invite',
    description: 'Generate a server invite link.',
    data: new SlashCommandBuilder()
    .setName('generate_invite')
    .setDescription('Generate a server invite link.')
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days until the invite expires (1-7)')
        .setRequired(true)
        .addChoices(
          { name: '1 Day', value: 1 },
          { name: '2 Days', value: 2 },
          { name: '3 Days', value: 3 },
          { name: '4 Days', value: 4 },
          { name: '5 Days', value: 5 },
          { name: '6 Days', value: 6 },
          { name: '7 Days', value: 7 }
        )
    ),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {CommandInteractionOptionResolver} options
     */
  run: async(client, interaction, options) => {
    await interaction.deferReply({ ephemeral: true });

    const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]",'', interaction, client, [true, 30]);
        }

    const days = interaction.options.getInteger('days');
    const maxAge = days * 24 * 60 * 60; // Convert days to seconds

    try {
      // Generate an invite for the server
      const invite = await interaction.guild.invites.create(interaction.channel, {
        maxAge: maxAge, // Expiration time in seconds
        maxUses: 1,     // Unlimited uses
        unique: true    // Generate a unique invite
      });

      // Reply with the generated invite link
      await interaction.editReply(`Here's your invite link: ${invite.url}`);
    } catch (error) {
      console.error('Error generating invite:', error);
      await interaction.editReply('An error occurred while generating the invite. Please try again.');
    }
  }
};
