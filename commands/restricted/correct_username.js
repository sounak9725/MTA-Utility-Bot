/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client, CommandInteractionOptionResolver } = require("discord.js");
const noblox = require("noblox.js");
const UserVerification = require('../../DBModels/UserVerification');
const { requiredRoles } = require('../../config.json').discord;
const { interactionEmbed } = require('../../functions.js'); // Assuming you have a paginationEmbed function


module.exports = {
    name: "correct_username",
    description: "Correct a Roblox username for a verified user",
    data: new SlashCommandBuilder()
        .setName('correct_username')
        .setDescription('Correct the Roblox username for a user')
        .addStringOption(option => option
            .setName('discord_user_id')
            .setDescription('Discord User ID')
            .setRequired(true))
        .addStringOption(option => option
            .setName('new_username')
            .setDescription('New Roblox Username')
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
        const newUsername = interaction.options.getString('new_username');

        try {
            // Fetch the user verification entry
            const verificationEntry = await UserVerification.findOne({ discord_user_id: discordUserId });

            if (!verificationEntry) {
                return interaction.editReply({ content: 'No verification entry found for the specified Discord user.', ephemeral: true });
            }

            // Fetch the Roblox user ID from the new username
            const newRobloxUserId = await noblox.getIdFromUsername(newUsername);

            // Update the entry with the new username and Roblox ID
            verificationEntry.roblox_username = newUsername;
            verificationEntry.roblox_user_id = newRobloxUserId;
            await verificationEntry.save();

            return interaction.editReply({ content: `Successfully updated the username for user <@${discordUserId}>. New username: ${newUsername}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: 'Failed to update the username. Make sure the new username is valid.', ephemeral: true });
        }
    }
};
