const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'request_leave_notice',
    description: 'Send a leave notice to the specified channel for approval.',
    data: new SlashCommandBuilder()
        .setName('request_leave_notice')
        .setDescription('Send a leave notice to the specified channel for approval.')
        .addStringOption(option =>
            option.setName('personnel_type')
                .setDescription('The type of personnel requesting leave')
                .setRequired(true)
                .addChoices(
                    { name: 'NCOs in Drill Wing', value: 'nco' },
                    { name: 'OiTs in Academy Wing', value: 'oit' },
                    { name: 'Staff', value: 'staff' }
                )
        )
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The username of the personnel')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('rank_or_ocg_level')
                .setDescription('The rank (for NCOs/Staff) or OCG Level (for OiTs)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the leave request')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('primary')
                .setDescription('Is this your primary role? (For Staff only)')
                .setRequired(false)
                .addChoices(
                    { name: 'Yes', value: 'Yes' },
                    { name: 'No', value: 'No' }
                )
        ),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        // Retrieve the inputs from the slash command
        const personnelType = interaction.options.getString('personnel_type');
        const username = interaction.options.getString('username');
        const rankOrOCGLevel = interaction.options.getString('rank_or_ocg_level');
        const reason = interaction.options.getString('reason');
        const primary = interaction.options.getString('primary');

        // Create the embed message based on the type of personnel
        let embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Leave Notice Request')
            .addFields(
                { name: 'Username', value: username, inline: true },
                { name: personnelType === 'oit' ? 'OCG Level' : 'Rank', value: rankOrOCGLevel, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setFooter({ text: 'Reminder: Once your notice is approved, you must stay for 7 days. Leaving before that or without approval will be considered desertion, resulting in a blacklist.' })
            .setTimestamp();

        let pingRole = '';
        if (personnelType === 'nco') {
            embed.addFields({ name: 'Wing', value: 'Drill Wing' });
            pingRole = '<@&1253089110856302734>';
        } else if (personnelType === 'oit') {
            embed.addFields({ name: 'Wing', value: 'Academy Wing' });
            pingRole = '<@844895640692457493>';
        } else if (personnelType === 'staff') {
            embed.addFields(
                { name: 'Primary?', value: primary ? primary : 'N/A', inline: true }
            );
            pingRole = '<@844895585069039627>';
        }

        try {
            // Specify the channel ID where the embed should be sent
            const channelId = '1252146535009882132';  // Replace 'YOUR_CHANNEL_ID' with the actual channel ID
            const channel = client.channels.cache.get(channelId);

            if (!channel) {
                return interaction.editReply({ content: 'The specified channel could not be found.', ephemeral: true });
            }

            // Send the embed message to the specified channel with the ping role
            await channel.send({ content: pingRole, embeds: [embed] });

            // Confirm the action to the user
            await interaction.editReply({ content: 'Leave notice request has been sent successfully.', ephemeral: true });
        } catch (error) {
            console.error('Error sending the leave notice request:', error);
            await interaction.editReply({ content: 'An error occurred while sending the leave notice request. Please try again later.', ephemeral: true });
        }
    }
};
