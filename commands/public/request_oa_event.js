const {
  CommandInteractionOptionResolver,
  EmbedBuilder,
  SlashCommandBuilder,
  CommandInteraction,
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { getRowifi } = require("../../functions");
const noblox = require("noblox.js");

module.exports = {
  name: "request_oa_event",
  description: "Request an event with specific details.",
  data: new SlashCommandBuilder()
    .setName("request_oa_event")
    .setDescription("Request an event with specific details.")
    .addIntegerOption((option) =>
      option
        .setName("time")
        .setDescription("Time available for the event in hours")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("event")
        .setDescription("Select event")
        .addChoices(
          { name: "Co-host", value: "Co-host" },
          { name: "Weapons Training", value: "Weapons Training" },
          { name: "Discipline Training", value: "Discipline Training" },
          { name: "Patrol Supervision", value: "Patrol Supervision" },
          { name: "Physical Training", value: "Physical Training" },
          {
            name: "Situational Discipline Training",
            value: "Situational Discipline Training",
          },
          {
            name: "Situational Moderation Training",
            value: "Situational Moderation Training",
          },
          { name: "UT Evaluation", value: "UT Evaluation" },
          { name: "Essentials Lecture Pt.1", value: "Essentials Lecture Pt.1" },
          { name: "Essentials Lecture Pt.2", value: "Essentials Lecture Pt.2" },
          { name: "Knowledge Exam", value: "Knowledge Exam" }
        )
        .setRequired(true)
    ),

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  run: async (client, interaction, options) => {
    await interaction.deferReply({ ephemeral: true });

    const time = interaction.options.getInteger("time");
    const eventDetails = interaction.options.getString("event");
    const id = interaction.user.id;
    const rowifi = await getRowifi(id, client);

    if (!rowifi.success) {
      return interaction.editReply({
        content: "You need to be verified with RoWifi to continue.",
      });
    }

    const username = rowifi.username;
    let currentRankOA;
    try {
      currentRankOA = await noblox.getRankNameInGroup(10436572, rowifi.roblox); // OA group
    } catch (error) {
      return interaction.editReply({
        content: "Failed to fetch current rank. Please try again later.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("Purple")
      .setTitle("Event Request")
      .setDescription(
        `**Username:** <@!${interaction.user.id}> (${username})\n` +
          `**Rank:** ${currentRankOA || "N/A"}\n` +
          `**Event Requested:** ${eventDetails}\n` +
          `**Time Available:** ${time}h`
      )
      .setFooter({
        text: `Requested by ${interaction.member.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    const acceptButton = new ButtonBuilder()
      .setCustomId("accept")
      .setLabel("Accept")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Success);

    const denyButton = new ButtonBuilder()
      .setCustomId("deny")
      .setLabel("Deny")
      .setEmoji("❎")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(acceptButton, denyButton);

    const targetChannelId = "1258502611095785552"; // Replace with your channel ID
    const targetChannel = await interaction.client.channels.fetch(
      targetChannelId
    );

    // Conditional content for the message
    let messageContent =
      "<@&844895864774066186>, a new event is up for grabs! Let's get to it.";
    if (eventDetails === "Knowledge Exam") {
      messageContent =
        "<@&1252454009952931881>, a new Knowledge Exam event is up for grabs!";
    }

    const message = await targetChannel.send({
      content: messageContent,
      embeds: [embed],
      components: [row],
    });

    const filter = (i) => ["accept", "deny"].includes(i.customId);

    // Set the collector's time based on the user input (convert hours to milliseconds)
    const collector = message.createMessageComponentCollector({
      filter,
      time: time * 60 * 60 * 1000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "accept") {
        const allowedRoles = ["844895864774066186", "844895585069039627"]; // Replace with the actual role IDs
        const hasPermission = i.member.roles.cache.some((role) =>
          allowedRoles.includes(role.id)
        );
        if (!hasPermission) {
          return i.reply({
            content: "You do not have permission to accept this event.",
            ephemeral: true,
          });
        }

        await i.update({
          content: `Event has been accepted by <@!${i.user.id}>.`,
          components: [],
        });

        // Send a DM to the requester
        try {
          const requester = await client.users.fetch(id);
          await requester.send(
            `Your event request for **${eventDetails}** has been accepted by ${i.user.tag}.`
          );
        } catch (error) {
          console.error("Failed to send DM to the requester:", error);
        }
      } else if (i.customId === "deny") {
        if (i.user.id !== id) {
          return i.reply({
            content: "You do not have permission to deny this event.",
            ephemeral: true,
          });
        }
        await i.update({
          content: "The event request has been denied.",
          components: [],
        });
      }
    });

    collector.on("end", async () => {
      await message.edit({ components: [] }); // Remove buttons after the collector ends
    });

    await interaction.editReply({
      content: "Your event request has been submitted.",
      ephemeral: true,
    });
  },
};
