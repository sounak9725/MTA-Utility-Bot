const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder } = require('discord.js');
const { interactionEmbed } = require('../../functions');
const { requiredRoles } = require('../../config.json').discord;

// Define the /scan command
module.exports = {
    name: 'scan',
    description: 'Check a user\'s details and find alternate accounts based on IP.',
    data: new SlashCommandBuilder()
        .setName('scan')
        .setDescription('Check a user\'s details and find alternate accounts based on IP.')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('The Discord user ID to scan')
                .setRequired(true)
        ),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ephemeral: false});
        const userId = interaction.options.getString('userid');
        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]",'', interaction, client, [true, 30]);
        }
        try {
            // Fetch the user information from Discord
            const user = await client.users.fetch(userId);

            if (!user) {
                return interaction.editReply({ content: 'User not found.', ephemeral: false });
            }
            console.log("here");
            // Create an embed message
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`User Scan: ${user.username}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Username', value: user.username, inline: true },
                    { name: 'Discriminator', value: user.discriminator, inline: false },
                    { name: 'User ID', value: userId, inline: false },
                    { name: 'Account Created At', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: 'Is Bot?', value: user.bot ? 'Yes' : 'No', inline: false }
                );

            // Check if the user is in the guild
            const member = interaction.guild.members.cache.get(userId);
            embed.addFields({ name: 'Guild Member', value: member ? 'Yes' : 'No', inline: false });

            // Send the embed response to the channel
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error executing scan command:', error);
            await interaction.editReply({ content: 'An error occurred while executing the command. Please try again later.', ephemeral: true });
        }
    }
};
