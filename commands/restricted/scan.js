const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder } = require('discord.js');
const User = require('../../DBModals/User');

// Function to check for alternate accounts
async function checkForAlternateAccounts(userId) {
    try {
        // Find the user document based on userId
        const userDocument = await User.findOne({ userId });

        if (!userDocument) {
            return []; // Return an empty array if the user is not found
        }

        const userIP = userDocument.ip; // Assuming the document has an 'ip' field

        // Find all users with the same IP address, excluding the original user
        const alternateAccounts = await User.find({ ip: userIP, userId: { $ne: userId } });

        // Map the results to an array of user IDs
        return alternateAccounts.map(account => account.userId);

    } catch (error) {
        console.error('Error checking for alternate accounts:', error);
        return []; // Return an empty array in case of an error
    }
}

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
        const userId = interaction.options.getString('userid');

        try {
            // Fetch the user information from Discord
            const user = await client.users.fetch(userId);

            if (!user) {
                return interaction.reply({ content: 'User not found.', ephemeral: false });
            }

            // Check for alternate accounts
            const alternateAccounts = await checkForAlternateAccounts(userId);

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

            // List alternate accounts if any
            if (alternateAccounts.length > 0) {
                embed.addFields({
                    name: 'Alternate Accounts',
                    value: alternateAccounts.join('\n'),
                    inline: false
                });
            } else {
                embed.addFields({
                    name: 'Alternate Accounts',
                    value: 'None found.',
                    inline: false
                });
            }

            // Send the embed response to the channel
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error executing scan command:', error);
            await interaction.reply({ content: 'An error occurred while executing the command. Please try again later.', ephemeral: true });
        }
    }
};
