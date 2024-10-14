/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Client } = require('discord.js');
const noblox = require('noblox.js'); // Roblox API for fetching user info
const UserVerification = require('../../DBModels/UserVerification'); // MongoDB model for storing linked data

module.exports = {
    name: "verify",
    description: "Link your Roblox account with your Discord account",
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Link your Roblox account with your Discord account')
        .addStringOption(option => 
            option.setName('roblox_username')
                .setDescription('Enter your Roblox username')
                .setRequired(true)),
    
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {

        await interaction.deferReply({ ephemeral: true });

        const robloxUsername = interaction.options.getString('roblox_username');
        const discordUserId = interaction.user.id; // Discord user ID
        const discordUsername = interaction.user.tag; // Discord username (e.g., User#1234)

        // Generate a random 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            // Fetch Roblox user ID using noblox.js
            const robloxId = await noblox.getIdFromUsername(robloxUsername);
            console.log(robloxId);
            // Fetch Roblox player information using the user ID (not username)
            const robloxUser = await noblox.getPlayerInfo(robloxId);
            // Store the verification code and user info in your database (MongoDB)
            const existingVerification = await UserVerification.findOne({ discord_user_id: discordUserId });
            if (existingVerification) {
                // If the user is already verified, update the data
                existingVerification.roblox_username = robloxUsername;
                existingVerification.roblox_user_id = robloxId;
                existingVerification.verification_code = verificationCode;
                existingVerification.isVerified = false; // Reset verification
                await existingVerification.save();
            } else {
                // Create a new entry for the verification
                await new UserVerification({
                    discord_user_id: discordUserId,
                    discord_username: discordUsername,
                    roblox_user_id: robloxId,
                    roblox_username: robloxUsername,
                    verification_code: verificationCode,
                    isVerified: false
                }).save();
            }

            // Send instructions to the user
            await interaction.editReply({ 
                content: `Please set this verification code **${verificationCode}** in your Roblox profile description.\nOnce you've done this, run the \`/check_verification\` command.`,
                ephemeral: true
            });
        } catch (error) {
            if (error.message.includes("User does not exist")) {
                await interaction.editReply({ content: 'Error: The Roblox username you provided does not exist. Please double-check the username.', ephemeral: true });
            } else {
                console.error(error);
                await interaction.editReply({ content: 'An error occurred while verifying your Roblox account.', ephemeral: true });
            }
        }
    }
};
