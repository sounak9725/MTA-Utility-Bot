/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');
const UserVerification = require('../../DBModels/UserVerification');
const { requiredRoles } = require('../../config.json').discord;
const { interactionEmbed, paginationEmbed } = require('../../functions.js'); // Assuming you have a paginationEmbed function

module.exports = {
    name: 'view_verifications',
    description: 'View all verification details',
    data: new SlashCommandBuilder()
        .setName('view_verifications')
        .setDescription('Fetch and view all verification details'),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async(client, interaction) => {
        await interaction.deferReply();

        // Check for permissions (if needed, add required roles check here)
        // Check if the user has the required roles
        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
         if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]", '', interaction, client, [true, 30]);
        }
         try {
            // Fetch all verification records from the database
            const verifications = await UserVerification.find();

            const pageSize = 5;

            if (!verifications || verifications.length === 0) {
                return interactionEmbed(3, "No verification records found", "", interaction, client, [true, 15]);
            }

            // Create pages of embeds
            let embeds = [];
            for (let i = 0; i < verifications.length; i += pageSize) {
                const verificationsPage = verifications.slice(i, i + pageSize);
                const embed = new EmbedBuilder()
                    .setTitle('Verification List')
                    .setColor('Blue')
                    .setFooter({
                        text: `Page ${Math.floor(i / pageSize) + 1}/${Math.ceil(verifications.length / pageSize)}`,
                        iconURL: interaction.guild.iconURL({ dynamic: true })
                    });

                verificationsPage.forEach(verification => {
                    embed.addFields(
                        { name: `Discord Username: ${verification.discord_username}`, value: 
                            `**Discord ID:** ${verification.discord_user_id}\n` +
                            `**Roblox Username:** ${verification.roblox_username}\n` +
                            `**Roblox ID:** ${verification.roblox_user_id}\n` +
                            `**Verified:** ${verification.isVerified ? 'Yes' : 'No'}` }
                    );
                });

                embeds.push(embed);
            }

            // Use paginationEmbed function to handle embeds with pagination
            await paginationEmbed(interaction, embeds);
        } catch (error) {
            console.error(error);
            return interactionEmbed(3, "[ERR-DB]", "An error occurred while fetching the records", interaction, client, [true, 15]);
        }
    }
};
