// eslint-disable-next-line no-unused-vars
const { SlashCommandBuilder, EmbedBuilder, WebhookClient, Client, CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const roblox = require("noblox.js");
const { interactionEmbed } = require("../../functions");
const config = require("../../config.json");
const groupid = config.roblox.groupid;

module.exports = {
  name: "demote",
  roles: ["933652067296366592", "908267205576237096"],
  data: new SlashCommandBuilder()
    .setName("demote")
    .setDescription("Demotes an user one rank below.")
    .addStringOption(option => {
      return option
        .setName("user")
        .setDescription("Roblox username")
        .setRequired(true);
    })
    .addStringOption(option => {
      return option
        .setName("reason")
        .setDescription("Reason for the demotion")
        .setRequired(true);
    }),
  /**
* @param {Client} client
* @param {CommandInteraction} interaction
* @param {CommandInteractionOptionResolver} options
*/
  run: async (client, interaction, options) => {
    await interaction.deferReply();

    let robloxname = options.getString("user");
    let reason = options.getString("reason");
    let robloxid;
    try {
      robloxid = await roblox.getIdFromUsername(robloxname);
    } catch (error) {
      return interactionEmbed(3, "[ERR-ARGS]", `Interpreted \`${robloxname}\` as username but found no user`, interaction, client, [true, 30]);
    }

    if (await roblox.getRankInGroup(groupid, robloxid) == 0) {
      return interactionEmbed(3, "The user is not in the group.", "", interaction, client, [true, 30]);
    }

    await roblox.demote(groupid, robloxid)
      .then(async (success) => {
        var x = new EmbedBuilder()
          .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
          .setDescription(`**Moderator:** ${interaction.member} (\`${interaction.user.id}\`)\n**Action:** Demotion \n**User:** ${robloxname} (\`${robloxid}\`)\n**Rank change:** ${success.oldRole.name} (${success.oldRole.rank}) -> ${success.newRole.name} (${success.newRole.rank})\n**Reason:** ${reason}`)
          .setTimestamp()
          .setColor("#043b64");
        interaction.editReply({ embeds: [x] });
        const webhookClient = new WebhookClient({ id: config.discord.webhookId, token: config.discord.webhookToken });
        webhookClient.send({
          content: "MTA Division",
          username: "MTA | Ranking Logs",
          embeds: [x],
        });
      })
      .catch((err) => {
        interactionEmbed(3, err.message, "", interaction, client, [true, 30]);
      });
  }
};