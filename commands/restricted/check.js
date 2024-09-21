// eslint-disable-next-line no-unused-vars
const { Client, CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { interactionEmbed } = require("../../functions.js");
const { requiredRoles } = require('../../config.json').discord;

const nbx = require("noblox.js");

module.exports = {
  name: "check",
  description: "Check the user's profile.",
  data: new SlashCommandBuilder()
    .setName("check")
    .setDescription("Check the user's profile.")
    .addStringOption(option =>
      option
        .setName("roblox_user")
        .setDescription("Roblox username")
        .setRequired(true)
    ),
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async run(client, interaction, options) {
    await interaction.deferReply({ephemeral: false});
    const hasRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
        return interactionEmbed(3, "[ERR-UPRM]",'', interaction, client, [true, 30]);
        }
    const username = options.getString("roblox_user");
    try {
      const id = await nbx.getIdFromUsername(username);
      const info = await nbx.getPlayerInfo(id);

      const mainRank = await nbx.getRankNameInGroup(872876, id);
      const governmentRank = await nbx.getRankNameInGroup(5248401, id);
      const militaryRank = await nbx.getRankNameInGroup(3029096, id);
      const oaRank = await nbx.getRankNameInGroup(10436572, id);
      const dsRank = await nbx.getRankNameInGroup(10421203, id);
      const embed = new EmbedBuilder()
        .setTitle(`${info.username}'s Profile`)
        .addFields([
          { name: "Username", value: `\`${info.username}\``, inline: true },
          { name: "Display Name", value: `\`${info.displayName || "N/A"}\``, inline: false },
          { name: "Previous Usernames", value: `\`${info.oldNames.length ? info.oldNames.join(", ") : "N/A"}\``, inline: false },
          { name: "User ID", value: `\`${id}\``, inline: false },
          { name: "Account Age", value: String(info.age), inline: false },
          { name: "Main Rank", value: mainRank, inline: false },
          { name: "Military Rank", value: militaryRank, inline: false },
          { name: "Government Rank", value: governmentRank, inline: false },
          { name: "Officer Academy", value: oaRank || "NA", inline: false },
          { name: "Drill School", value: dsRank || "NA", inline: false },
          { name: "Roblox profile link", value: `[Profile](https://www.roblox.com/users/${id}/profile)`, inline: false },
        ])
        .setFooter({ text: `Requested by ${interaction.member.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp(new Date())
        .setColor('Aqua');

      const enemyGroups = [
        { id: 5248163, name: await nbx.getRankNameInGroup(5248163, id), rank: await nbx.getRankInGroup(5248163, id) }
      ];

      const enemyInfo = enemyGroups
        .filter(group => group.rank > 0)
        .map(group => `[${group.name} - ${group.rank}](https://www.roblox.com/groups/${group.id})`)
        .join('\n') || 'N/A';

      embed.addFields({ name: "Enemy groups", value: enemyInfo });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(`[ERROR] ${error}`);
      return interactionEmbed(3, "[ERR-ARGS]", `Could not retrieve profile for \`${username}\``, interaction, client, [true, 15]);
    }
  }
};