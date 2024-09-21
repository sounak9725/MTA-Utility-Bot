/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder } = require('discord.js');
const { interactionEmbed } = require("../../functions");
module.exports = {
    name: 'log_ia',
    description: 'Log an internal affairs report with all relevant details.',
    data: new SlashCommandBuilder()
        .setName('log_ia')
        .setDescription('Log an internal affairs report with all relevant details.')
        .addStringOption(option =>
            option.setName('adjudicator')
                .setDescription('The adjudicator of the case')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('offender')
                .setDescription('The offender\'s name and ID')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('description')
                .setDescription('A description of the offense')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('punishment')
                .setDescription('The punishment given')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('logged_to_mp_cid')
                .setDescription('Was the incident logged to MP CID? (Yes/No)')
                .addChoices(
                    { name: "Yes", value: "Yes" },
                    {name: "No", value: "No"}
                )
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('evidence')
                .setDescription('Link to the evidence document')
                .setRequired(true)
        ),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const requiredRoles = ["844895864774066186", "1252144963873935371", "1262484099033993278"];

      // Check if the user has required roles
      const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
      if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]", '', interaction, client, [true, 30]);
      }

        const adjudicator = interaction.options.getString('adjudicator');
        const offender = interaction.options.getString('offender');
        const description = interaction.options.getString('description');
        const punishment = interaction.options.getString('punishment');
        const loggedToMPCID = interaction.options.getString('logged_to_mp_cid');
        const evidence = interaction.options.getString('evidence');

        
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Internal Affairs Report')
            .addFields(
                { name: 'Adjudicator', value: adjudicator, inline: true },
                { name: 'Offender', value: offender, inline: false },
                { name: 'Description', value: description, inline: false },
                { name: 'Punishment', value: punishment, inline: false },
                { name: 'Logged to MP CID?', value: loggedToMPCID, inline: true },
                { name: 'Evidence', value: evidence, inline: false }
            )
            .setFooter({
                text: `Filed by ${interaction.user.tag} | Filed at ${new Date().toLocaleTimeString()} ${new Date().toString().match(/GMT([+-]\d{2})(\d{2})/)[0]}`,
                iconURL: client.user.displayAvatarURL()
            })
            .setColor('Blurple')
            .setTimestamp();

        try {
            // Specify the channel ID where the embed should be sent
            const channelId = '1252147005040492635';  
            const channel = client.channels.cache.get(channelId);

            if (!channel) {
                return interaction.editReply({ content: 'The specified channel could not be found.', ephemeral: true });
            }

            
            await channel.send({ embeds: [embed] });

            // Confirm the action to the user
            await interaction.editReply({ content: 'Internal affairs report has been logged successfully.', ephemeral: true });
        } catch (error) {
            console.error('Error sending the log:', error);
            await interaction.editReply({ content: 'An error occurred while logging the report. Please try again later.', ephemeral: true });
        }
    }
};
