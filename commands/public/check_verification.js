/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client, CommandInteractionOptionResolver } = require('discord.js');
const noblox = require('noblox.js');
const UserVerification = require('../../DBModels/UserVerification');

module.exports = {
    name: "check_verification",
    description: "Check if your Roblox account is verified",
    data: new SlashCommandBuilder()
        .setName('check_verification')
        .setDescription('Check if your Roblox account is verified'),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     * @param {CommandInteractionOptionResolver} options
     */
    run: async (client, interaction, options) => {
        await interaction.deferReply({ ephemeral: true });

        const discordUserId = interaction.user.id;

        try {
            // Retrieve the user's verification data from the database
            const verificationEntry = await UserVerification.findOne({ discord_user_id: discordUserId });

            if (!verificationEntry) {
                return interaction.editReply({ content: 'No verification request found. Please use /verify first.', ephemeral: true });
            }

            const robloxUserId = verificationEntry.roblox_user_id;
            const verificationCode = verificationEntry.verification_code;
            console.log("Roblox User ID:", robloxUserId);

            // Check if Roblox user exists and fetch profile
            const robloxUserProfile = await noblox.getPlayerInfo(robloxUserId);

            // If no profile description is found
            if (!robloxUserProfile.blurb || robloxUserProfile.blurb.trim() === "") {
                return interaction.editReply({ content: 'Your Roblox profile description is empty. Please add the verification code to your profile description.', ephemeral: true });
            }

            const profileDescription = robloxUserProfile.blurb;
            console.log("Profile Description:", profileDescription);

            // Check if the verification code is present in the profile description
            if (profileDescription.includes(verificationCode)) {
                verificationEntry.isVerified = true; // Mark as verified
                await verificationEntry.save();

                return interaction.editReply({ content: 'Verification successful! Your Roblox account is now linked with your Discord account.', ephemeral: true });
            } else {
                return interaction.editReply({ content: 'Verification failed. Please ensure the verification code is present in your profile description.', ephemeral: true });
            }

        } catch (error) {
            console.error("Verification Error:", error.message);

            // Handle user not found errors
            if (error.message.includes("Player not found")) {
                return interaction.editReply({ content: 'Unable to find your Roblox profile. Please ensure your Roblox account exists and is public.', ephemeral: true });
            }

            // Generic error handling
            await interaction.editReply({ content: 'An error occurred while checking your verification. Please try again later.', ephemeral: true });
        }
    }
};
