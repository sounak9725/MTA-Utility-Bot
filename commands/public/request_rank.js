const { EmbedBuilder, SlashCommandBuilder, Client, CommandInteraction } = require('discord.js');
const noblox = require('noblox.js');
const { getRowifi } = require('../../functions');

module.exports = {
    name: 'rank_request',
    description: 'Submit a rank request with the required information.',
    data: new SlashCommandBuilder()
        .setName('rank_request')
        .setDescription('Submit a rank request with the required information.')
        .addStringOption(option => 
            option.setName('rank')
                .setDescription('Rank you are requesting')
                .addChoices(
                 { name: 'Instructor-in-Training', value: 'instructor-in-training' },
                 { name: 'Novice Drill Instructor', value: 'novice drill instructor' },
                 { name: 'SDI App Passed', value: 'sdi app passed' },
                 { name: 'Senior Drill Instructor', value: 'senior drill instructor' },
                 { name: 'Warrant Officer', value: 'warrant officer' },
                 { name: 'Officer Cadet Grade II', value: 'officer cadet grade ii' },
                 { name: 'Officer Cadet Grade III', value: 'officer cadet grade iii' },
                 { name: 'Junior Officer', value: 'junior officer' },
                 { name: 'Staff', value: 'staff' })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('wing')
                .setDescription('Wing option')
                .addChoices(
                    { name: 'DS', value: 'DS' },
                    { name: 'OA', value: 'OA' }
                )
                .setRequired(true))
        .addAttachmentOption(option => 
                option.setName('proof')
               .setDescription('Upload proof of meeting the requirements').setRequired(true)),        

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async(client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const rank = interaction.options.getString('rank');
        const proofAttachment = interaction.options.getAttachment('proof');
        const wing = interaction.options.getString('wing');

        const id = interaction.user.id;
        const rowifi = await getRowifi(id, client);

        if (!rowifi.success) {
            return interaction.editReply({ content: 'You need to be verified with RoWifi to continue.' });
        }
        const user = rowifi.username;

        try {
            if (rank.toLowerCase() === 'sdi app passed') {
                
                const embed = new EmbedBuilder()
                    .setColor('Blue') 
                    .setTitle('Rank Request: SDI App Passed')
                    .addFields(
                        { name: 'Username', value: user, inline: true },
                        { name: 'Rank Requested', value: rank, inline: false },
                        { name: 'Proof', value: proofAttachment ? proofAttachment.url : 'No proof provided' }
                    )
                    .setFooter({text: `Requested by ${interaction.member.user.username}`})
                    .setTimestamp();

                // Add image if attachment is provided
                if (proofAttachment) {
                    embed.setImage(proofAttachment.url);
                }

                const targetChannelId = '1252137489976660041'; // Replace with your channel ID
                const targetChannel = await interaction.client.channels.fetch(targetChannelId);

                await targetChannel.send({ content: `<@&1253089110856302734>`, embeds: [embed] });
                await interaction.editReply({ content: 'Your SDI App Passed request has been submitted.', ephemeral: true });

                // Send DM to the user
                try {
                    await interaction.user.send({
                        content: 'Your SDI App Passed request has been successfully submitted. Thank you!'
                    });
                } catch (error) {
                    console.error('Failed to send DM to user:', error);
                }

                return;
            }

            // Get user's Roblox ID
            const userId = await noblox.getIdFromUsername(rowifi.username);

            // Fetch user's current rank in the OA and DS groups
            let currentRankOA, currentRankDS;
            try {
                currentRankOA = await noblox.getRankNameInGroup(10436572, userId) || 'NA'; // OA group
                currentRankDS = await noblox.getRankNameInGroup(10421203, userId) || 'NA'; // DS group
            } catch (error) {
                return interaction.editReply({ content: 'Failed to fetch current rank. Please try again later.', ephemeral: true });
            }

            // Determine the role to ping based on the rank
            let pingRole;
            switch(rank.toLowerCase()) {
                case 'instructor-in-training':
                case 'novice drill instructor':
                case 'senior drill instructor':
                    pingRole = '<@&1253089110856302734>';
                    break;
                case 'warrant officer':
                case 'officer cadet grade ii':
                case 'officer cadet grade iii':
                case 'junior officer':
                case 'staff':
                    pingRole = '<@&844895640692457493>';
                    break;
                default:
                    return interaction.editReply({ content: 'Invalid rank requested.', ephemeral: true });
            }

            // Create embed with current rank and requested rank
            const embed = new EmbedBuilder()
                .setColor('Aqua')
                .setTitle('Rank Request')
                .addFields(
                    { name: 'Username', value: user, inline: true },
                    { name: 'Current Rank in OA', value: currentRankOA || 'N/A', inline: false },
                    { name: 'Current Rank in DS', value: currentRankDS || 'N/A', inline: false },
                    { name: 'Rank Requested', value: rank, inline: false },
                    { name: 'Proof', value: proofAttachment ? proofAttachment.url : 'No proof provided' }
                )
                .setFooter({ text: `Requested by ${interaction.member.user.username}`, iconUrl: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // Add image if attachment is provided
            if (proofAttachment) {
                embed.setImage(proofAttachment.url);
            }

            // Check if the current rank is the same as the requested rank
            if ((currentRankOA?.toLowerCase() === rank.toLowerCase() || currentRankDS?.toLowerCase() === rank.toLowerCase())) {
                embed.addFields({ name: 'Status', value: 'Same rank requested' });
            }

            const targetChannelId = '1252137489976660041'; // Replace with your channel ID
            const targetChannel = await interaction.client.channels.fetch(targetChannelId);

            await targetChannel.send({ content: `${pingRole}`, embeds: [embed] });
            await interaction.editReply({ content: 'Your rank request has been submitted.', ephemeral: true });

            // Send DM to the user
            try {
                await interaction.user.send({
                    content: 'Your rank request has been successfully submitted. Thank you!'
                });
            } catch (error) {
                console.error('Failed to send DM to user:', error);
            }

        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.editReply({ content: 'An unexpected error occurred. Please try again later.', ephemeral: true });
        }
    }
};
