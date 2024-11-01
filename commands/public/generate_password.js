/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder } = require('discord.js');
const { interactionEmbed } = require("../../functions");
module.exports = {
    name: 'generate_password',
    description: 'Generate a secure password and DM it to the user.',
    data: new SlashCommandBuilder()
        .setName('generate_password')
        .setDescription('Generates a secure password and sends it to you via DM.'),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        
        const requiredRoles = ["1253090925115346998", "844895864774066186", "1252144963873935371"];
        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
            return interactionEmbed(3, "[ERR-UPRM]", '', interaction, client, [true, 30]);
        }
        // Password generation logic
        const password = 'fpZO0__wer9ufnajsdj'; // Your predefined password

        // Create an embed for the DM message
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Your Generated Password')
            .setDescription('Here is your secure password. Keep it safe and do not share it with anyone.')
            .addFields(
                { name: 'Password', value: `\`${password}\``, inline: false }
            )
            .setFooter({ text: 'Use this password responsibly.' })
            .setTimestamp();

        // Send the embed via DM to the user
        try {
            await interaction.user.send({ embeds: [embed] });
            await interaction.editReply({ content: 'Your password has been sent to you via DM.', ephemeral: true });
        } catch (error) {
            console.error('Failed to send DM:', error);
            await interaction.editReply({ content: 'Failed to send you a DM. Please make sure your DMs are open.', ephemeral: true });
        }
    }
};
