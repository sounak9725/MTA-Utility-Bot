// eslint-disable-next-line no-unused-vars
const { EmbedBuilder, SlashCommandBuilder, CommandInteraction, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const moment = require('moment');
const { interactionEmbed } = require('../../functions');
module.exports = {
    name: 'request_notice',
    description: 'Submit an inactivity notice.',
    data: new SlashCommandBuilder()
        .setName('request_notice')
        .setDescription('Submit an inactivity notice.')
        .addStringOption(option =>
            option.setName('start_date')
                .setDescription('Enter the start date in DD/MM/YYYY format')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('end_date')
                .setDescription('Enter the end date in DD/MM/YYYY format')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for inactivity')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('group')
                .setDescription('Select the group (OA or DS)')
                .addChoices(
                    { name: 'OA', value: 'OA' },
                    { name: 'DS', value: 'DS' }
                )
                .setRequired(true)),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const requiredRoles = ['844895864774066186', '1253090925115346998'];
        const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]",'', interaction, client, [true, 30]);
        }
        // Get the current day of the week (0 = Sunday, 6 = Saturday)
        const currentDay = moment().day();

        // Restrict the command to only work from Monday (1) to Thursday (4)
        if (currentDay === 5 || currentDay === 6 || currentDay === 0) {
            return interaction.editReply({
                content: 'This command can only be used from Monday to Thursday.',
                ephemeral: true
            });
        }

        const startDate = interaction.options.getString('start_date');
        const endDate = interaction.options.getString('end_date');
        const reason = interaction.options.getString('reason');
        const group = interaction.options.getString('group');
        const username = interaction.user.username;

        // Validate date format using regex
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/2024$/;

        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return interaction.editReply({ content: 'Invalid date format. Please use DD/MM/YYYY format with a valid day (1-31), month (1-12), and year (2024).', ephemeral: true });
        }

        const startDateMoment = moment(startDate, 'DD/MM/YYYY', true);
        const endDateMoment = moment(endDate, 'DD/MM/YYYY', true);
        const currentDate = moment();

        // Check if start date is earlier than the current date
        if (startDateMoment.isBefore(currentDate, 'day')) {
            return interaction.editReply({ content: 'The start date cannot be earlier than today.', ephemeral: true });
        }

        // Check if end date is earlier than start date
        if (endDateMoment.isBefore(startDateMoment, 'day')) {
            return interaction.editReply({ content: 'The end date cannot be earlier than the start date.', ephemeral: true });
        }


        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setTitle('Inactivity Notice')
            .setDescription(
                `**Username:** <@!${interaction.user.id}> (${username})\n` +
                `**Start Date:** ${startDate}\n` +
                `**End Date:** ${endDate}\n` +
                `**Reason:** ${reason}`
            )
            .setFooter({ text: `Requested by ${username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const acceptButton = new ButtonBuilder()
            .setCustomId('accept')
            .setLabel('Accept')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success);

        const denyButton = new ButtonBuilder()
            .setCustomId('deny')
            .setLabel('Deny')
            .setEmoji('❎')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(acceptButton, denyButton);

        const targetChannelId = '1252146604203573319'; // Replace with your channel ID
        const targetChannel = await interaction.client.channels.fetch(targetChannelId);

        // Determine the role to ping based on the group selected
        let roleToPing;
        if (group === 'OA') {
            roleToPing = '<@&844895585069039627>'; // Replace with your OA role ID
        } else if (group === 'DS') {
            roleToPing = '<@&1253089110856302734>'; // Replace with your DS role ID
        }

        const message = await targetChannel.send({ content: `${roleToPing}, a new inactivity notice has been submitted.`, embeds: [embed], components: [row] });
        
        const filter = i => ['accept', 'deny'].includes(i.customId);
        const collector = message.createMessageComponentCollector({ filter, time: 7 * 24 * 60 * 60 * 1000 }); // 1 week

        collector.on('collect', async i => {
            const allowedRoles = ['1253089110856302734', '1252144963873935371']; // Replace with your actual role IDs
            const hasPermission = i.member.roles.cache.some(role => allowedRoles.includes(role.id));

            if (!hasPermission) {
                return i.reply({ content: 'You do not have permission to interact with this.', ephemeral: true });
            }

            if (i.customId === 'accept') {
                await i.update({ content: `Inactivity notice accepted by <@!${i.user.id}>.`, components: [] });
                await interaction.user.send({ content: `Your inactivity notice has been accepted by ${i.user.tag}.`});
            } else if (i.customId === 'deny') {
                await i.update({ content: `Inactivity notice denied by <@!${i.user.id}>.`, components: [] });
                await interaction.user.send(`Your inactivity notice has been denied by ${i.user.tag}.`);
            }
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await message.edit({ components: [] }); // Remove buttons after 1 week if no interaction
            }
        });

        await interaction.editReply({ content: 'Your inactivity notice has been submitted.', ephemeral: true });
    }
};
