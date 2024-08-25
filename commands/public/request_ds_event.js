const { EmbedBuilder, SlashCommandBuilder, CommandInteraction, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getRowifi } = require('../../functions');
const noblox = require('noblox.js');

module.exports = {
    name: 'request_ds_event',
    description: 'Request an event with specific details.',
    data: new SlashCommandBuilder()
        .setName('request_ds_event')
        .setDescription('Request an event with specific details.')
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Time available for the event in hours')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('event')
                .setDescription('Select event')
                .addChoices(
                    { name: 'Co-hosting by SDI+', value: 'Co-hosting by SDI+' },
                    { name: 'Weapons Training', value: 'Weapons Training' },
                    { name: 'Discipline Training', value: 'Discipline Training' },
                    { name: 'Patrol Supervision', value: 'Patrol Supervision' },
                    { name: 'Physical Training', value: 'Physical Training' },
                    { name: 'Border Protocol Supervision', value: 'Border Patrol Supervision' },
                    { name: 'Supervision Evaluation (DI)', value: 'Supervision Evaluation (DI)' },
                    { name: 'Evaluation', value: 'Evaluation' },
                )
                .setRequired(true)),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const time = interaction.options.getInteger('time');
        const eventDetails = interaction.options.getString('event');
        const id = interaction.user.id;
        const rowifi = await getRowifi(id, client);

        if (!rowifi.success) {
            return interaction.editReply({ content: 'You need to be verified with RoWifi to continue.' });
        }

        const username = rowifi.username;
        let currentRankDS;
        try {
            currentRankDS = await noblox.getRankNameInGroup(10421203, rowifi.roblox); // DS group
        } catch (error) {
            return interaction.editReply({ content: 'Failed to fetch current rank. Please try again later.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('Purple')
            .setTitle('Event Request')
            .setDescription(
                `**Username:** <@!${interaction.user.id}> (${username})\n` +
                `**Rank:** ${currentRankDS || 'N/A'}\n` +
                `**Event Requested:** ${eventDetails}\n` +
                `**Time Available:** ${time}h`
            )
            .setFooter({ text: `Requested by ${interaction.member.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const acceptButton = new ButtonBuilder()
            .setCustomId('accept')
            .setLabel('Accept')
            .setEmoji('⚔️')
            .setStyle(ButtonStyle.Success);

        const denyButton = new ButtonBuilder()
            .setCustomId('deny')
            .setLabel('Deny')
            .setEmoji('❎')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(acceptButton, denyButton);

        const targetChannelId = '1265982268162183178'; // Replace with your channel ID
        const targetChannel = await interaction.client.channels.fetch(targetChannelId);

        const message = await targetChannel.send({ content: '@Staff, a new event is up for grabs! Let\'s get to it.', embeds: [embed], components: [row] });
        
        const filter = i => ['accept', 'deny'].includes(i.customId);

        // Set the collector's time based on the user input (convert hours to milliseconds)
        const collector = message.createMessageComponentCollector({ filter, time: time * 60 * 60 * 1000 });

        collector.on('collect', async i => {
            if (i.customId === 'accept') {
                const allowedRoles = ['1272510518036529233', '1008740660880355428']; // Replace with the actual role IDs
                const hasPermission = i.member.roles.cache.some(role => allowedRoles.includes(role.id));
                if (!hasPermission) {
                    return i.reply({ content: 'You do not have permission to accept this event.', ephemeral: true });
                }
                await i.update({ content: `Event has been accepted by <@!${i.user.id}>.`, components: [] });
            } else if (i.customId === 'deny') {
                if (i.user.id !== id) {
                    return i.reply({ content: 'You do not have permission to deny this event.', ephemeral: true });
                }
                await i.update({ content: 'The event request has been denied.', components: [] });
            }
        });

        collector.on('end', async () => {
            await message.edit({ components: [] }); // Remove buttons after the collector ends
        });

        await interaction.editReply({ content: 'Your event request has been submitted.', ephemeral: true });
    }
};
