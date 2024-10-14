/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('@discordjs/builders');
const UserVerification = require('../../DBModels/UserVerification');
const { CommandInteraction, Client, CommandInteractionOptionResolver } = require("discord.js");
const { interactionEmbed } = require('../../functions.js'); // Assuming you have a paginationEmbed function
const { requiredRoles } = require('../../config.json').discord;


module.exports = {
    name: "delete_verification",
    description: "Delete a user's verification entry from the database",
    data: new SlashCommandBuilder()
        .setName('delete_verification')
        .setDescription('Delete a user\'s verification entry')
        .addStringOption(option => option
            .setName('discord_user_id')
            .setDescription('Discord User ID')
            .setRequired(true)),
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     * @param {CommandInteractionOptionResolver} options
     */
    run: async (client, interaction, options) => {

        await interaction.deferReply({ephemeral:true});
        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
         if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]", '', interaction, client, [true, 30]);
        }
        const discordUserId = interaction.options.getString('discord_user_id');

        try {
            // Find and delete the verification entry
            const deletedEntry = await UserVerification.findOneAndDelete({ discord_user_id: discordUserId });

            if (!deletedEntry) {
                return interaction.editReply({ content: 'No verification entry found for the specified Discord user.', ephemeral: true });
            }

            return interaction.editReply({ content: `Successfully deleted verification for user <@${discordUserId}>.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: 'Failed to delete the verification entry. Please try again later.', ephemeral: true });
        }
    }
};
